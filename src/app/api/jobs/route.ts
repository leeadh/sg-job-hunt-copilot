import { NextRequest, NextResponse } from "next/server";

// MyCareersFuture API integration
// Docs: https://api.mycareersfuture.gov.sg (public, no auth required for search)
const MCF_API_BASE = "https://api.mycareersfuture.gov.sg/v2/jobs";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const limit = req.nextUrl.searchParams.get("limit") || "10";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${MCF_API_BASE}?search=${encodeURIComponent(query)}&limit=${limit}&page=0&salary=0&sortBy=new_posting_date&salary_type=monthly`,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "SGJobHuntCopilot/1.0",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        source: "mycareersfuture",
        status: "api_unavailable",
        message: "MyCareersFuture API is currently unavailable. Try searching directly at mycareersfuture.gov.sg",
        fallbackUrl: `https://www.mycareersfuture.gov.sg/search?search=${encodeURIComponent(query)}`,
      });
    }

    const data = await response.json();

    const jobs = (data.results || []).slice(0, parseInt(limit)).map((job: Record<string, unknown>) => ({
      title: job.title,
      company: (job.postedCompany as Record<string, unknown>)?.name || "Company not listed",
      salary: job.salary,
      postingDate: job.metadata && (job.metadata as Record<string, unknown>).newPostingDate,
      skills: job.skills,
      url: `https://www.mycareersfuture.gov.sg/job/${job.uuid}`,
    }));

    return NextResponse.json({
      source: "mycareersfuture",
      totalCount: data.total || jobs.length,
      jobs,
      searchUrl: `https://www.mycareersfuture.gov.sg/search?search=${encodeURIComponent(query)}`,
    });
  } catch {
    return NextResponse.json({
      source: "mycareersfuture",
      status: "api_unavailable",
      message: "Could not reach MyCareersFuture API. Try searching directly.",
      fallbackUrl: `https://www.mycareersfuture.gov.sg/search?search=${encodeURIComponent(query)}`,
    });
  }
}
