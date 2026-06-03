const MCF_API_BASE = "https://api.mycareersfuture.gov.sg/v2/jobs";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  data: JobSearchResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}, 60_000);

export interface JobListing {
  title: string;
  company: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: string;
  postingDate: string | null;
  skills: string[];
  url: string;
  location: string;
  employmentType: string;
}

export interface JobSearchResult {
  query: string;
  totalCount: number;
  jobs: JobListing[];
  searchUrl: string;
}

async function searchMCF(query: string, limit: number = 5): Promise<JobSearchResult> {
  const searchUrl = `https://www.mycareersfuture.gov.sg/search?search=${encodeURIComponent(query)}&sortBy=new_posting_date`;
  const cacheKey = `${query.toLowerCase().trim()}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const response = await fetch(
      `${MCF_API_BASE}?search=${encodeURIComponent(query)}&limit=${limit}&page=0&salary=0&sortBy=new_posting_date&salary_type=monthly`,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "SGJobHuntCopilot/1.0",
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      return { query, totalCount: 0, jobs: [], searchUrl };
    }

    const data = await response.json();

    const jobs: JobListing[] = (data.results || []).slice(0, limit).map((job: Record<string, unknown>) => {
      const salary = job.salary as Record<string, unknown> | undefined;
      const company = job.postedCompany as Record<string, unknown> | undefined;
      const metadata = job.metadata as Record<string, unknown> | undefined;
      const position = job.positionLevels as Array<Record<string, unknown>> | undefined;

      return {
        title: job.title || "Untitled",
        company: company?.name || "Company not listed",
        salaryMin: salary?.minimum ? Number(salary.minimum) : null,
        salaryMax: salary?.maximum ? Number(salary.maximum) : null,
        salaryType: (salary?.type as Record<string, unknown>)?.salaryType || "monthly",
        postingDate: metadata?.newPostingDate as string || null,
        skills: Array.isArray(job.skills) ? (job.skills as Array<Record<string, unknown>>).map(s => s.skill as string).filter(Boolean).slice(0, 6) : [],
        url: `https://www.mycareersfuture.gov.sg/job/${job.uuid}`,
        location: position?.[0]?.position as string || "",
        employmentType: Array.isArray(job.employmentTypes) ? (job.employmentTypes as Array<Record<string, unknown>>).map(e => e.employmentType).join(", ") : "",
      };
    });

    const result: JobSearchResult = {
      query,
      totalCount: data.total || jobs.length,
      jobs,
      searchUrl,
    };

    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch {
    return { query, totalCount: 0, jobs: [], searchUrl };
  }
}

export async function searchJobs(
  queries: string[],
  limit: number = 5
): Promise<JobSearchResult[]> {
  const uniqueQueries = [...new Set(queries.map(q => q.trim().toLowerCase()))].slice(0, 3);
  const results = await Promise.all(uniqueQueries.map(q => searchMCF(q, limit)));
  return results.filter(r => r.jobs.length > 0);
}
