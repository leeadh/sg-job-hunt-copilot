import { NextRequest, NextResponse } from "next/server";
import { analyzeResume, extractKeywords } from "@/lib/ats-analyzer";
import { findSalaryBenchmark, getSalaryPercentile } from "@/data/salary-benchmarks";
import { matchProgrammes, UserProfile } from "@/data/government-programmes";
import { analyzeWithGemini, suggestJobTitles, generateInterviewPrep, generateLinkedInOptimizer } from "@/lib/gemini";
import { searchJobs } from "@/lib/job-search";
import { validateInputs } from "@/lib/sanitize";
import { filterLLMOutput } from "@/lib/output-filter";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumeText, jobDescription, expectedSalary, field, degree,
      yearsExperience, age, employmentStatus, citizenship, apiKey: userApiKey,
    } = body;

    const serverKey = process.env.GEMINI_API_KEY;
    const effectiveKey = userApiKey || serverKey || null;
    const usingSharedKey = !userApiKey && !!serverKey;

    const ip = getClientIP(req);
    const rateMode = usingSharedKey ? "shared_key" : "own_key";
    const rateCheck = checkRateLimit(ip, rateMode);
    if (!rateCheck.allowed) {
      const retrySeconds = Math.ceil(rateCheck.retryAfterMs / 1000);
      return NextResponse.json(
        { error: usingSharedKey
            ? `Free service limit reached (2 analyses per 5 minutes). Try again in ${retrySeconds}s, or add your own free Gemini key for unlimited usage.`
            : `Too many requests. Try again in ${retrySeconds} seconds.`
        },
        { status: 429, headers: { "Retry-After": String(retrySeconds), "X-RateLimit-Remaining": "0" } }
      );
    }

    const validation = validateInputs(resumeText, jobDescription);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const atsResult = jobDescription
      ? analyzeResume(resumeText, jobDescription)
      : null;

    let salaryInsight = null;
    if (expectedSalary && field) {
      const benchmarks = findSalaryBenchmark(field, degree);
      if (benchmarks.length > 0) {
        const benchmark = benchmarks[0];
        const percentile = getSalaryPercentile(expectedSalary, benchmark);
        const isAboveMedian = expectedSalary > benchmark.medianSalary;
        salaryInsight = {
          benchmark, percentile, expectedSalary, isAboveMedian,
          advice: isAboveMedian && expectedSalary > benchmark.p75Salary
            ? `Your expected salary of $${expectedSalary.toLocaleString()} is in the ${percentile} for ${benchmark.field} (${benchmark.degree}). This may reduce callback rates for entry/junior roles. The median is $${benchmark.medianSalary.toLocaleString()}.`
            : `Your expected salary of $${expectedSalary.toLocaleString()} is in the ${percentile} for ${benchmark.field} (${benchmark.degree}). Median: $${benchmark.medianSalary.toLocaleString()}.`,
        };
      }
    }

    const profile: UserProfile = {
      age: age ? parseInt(age) : undefined,
      yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
      expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
      employmentStatus: employmentStatus || undefined,
      citizenship: citizenship || "citizen",
      field: field || undefined,
      jobDescription: jobDescription || undefined,
    };

    const programmes = matchProgrammes(profile);

    let llmAnalysis: string | null = null;
    let jobResults = null;
    let interviewPrep: string | null = null;
    let linkedIn: { headline: string; summary: string } | null = null;

    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = jobDescription ? extractKeywords(jobDescription) : [];
    const missingKeywords = jdKeywords.filter(k => !resumeKeywords.includes(k));

    const fallbackQueries: string[] = [];
    if (jobDescription) {
      const jdWords = jobDescription.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (jdWords?.[0]) fallbackQueries.push(jdWords[0]);
    }
    if (field) fallbackQueries.push(field);
    if (resumeKeywords.length > 0) {
      fallbackQueries.push(resumeKeywords.slice(0, 3).join(" "));
    }

    if (effectiveKey) {
      try {
        const geminiCalls: Promise<unknown>[] = [
          analyzeWithGemini({
            apiKey: effectiveKey, resumeText, jobDescription, field, degree,
            expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
            yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
            age: age ? parseInt(age) : undefined,
            employmentStatus,
          }),
          suggestJobTitles({ apiKey: effectiveKey, resumeText, jobDescription, field }),
          generateLinkedInOptimizer({ apiKey: effectiveKey, resumeText, field }),
        ];

        if (jobDescription) {
          geminiCalls.push(generateInterviewPrep({ apiKey: effectiveKey, resumeText, jobDescription, missingKeywords }));
        }

        const results = await Promise.all(geminiCalls);

        const filtered = filterLLMOutput(results[0] as string);
        llmAnalysis = filtered.output;

        const suggestedTitles = results[1] as string[];
        linkedIn = results[2] as { headline: string; summary: string } | null;
        interviewPrep = (results[3] as string) || null;

        const searchQueries = suggestedTitles.length > 0
          ? suggestedTitles
          : fallbackQueries;

        if (searchQueries.length > 0) {
          jobResults = await searchJobs(searchQueries, 4);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const isRateLimit = message.includes("429") || message.includes("quota") || message.includes("Resource");
        llmAnalysis = isRateLimit
          ? "⚠ AI analysis temporarily unavailable (high demand). Please try again in a minute."
          : `⚠ Gemini API error: ${message}. Check your API key and try again.`;

        if (fallbackQueries.length > 0) {
          jobResults = await searchJobs(fallbackQueries.slice(0, 2), 4);
        }
      }
    } else if (fallbackQueries.length > 0) {
      jobResults = await searchJobs(fallbackQueries.slice(0, 2), 4);
    }

    return NextResponse.json(
      { ats: atsResult, salary: salaryInsight, programmes, llmAnalysis, jobs: jobResults, interviewPrep, linkedIn, usingSharedKey },
      { headers: { "X-RateLimit-Remaining": String(rateCheck.remaining) } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze. Check your input." },
      { status: 500 }
    );
  }
}
