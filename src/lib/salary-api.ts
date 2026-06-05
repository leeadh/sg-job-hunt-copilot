import { SalaryBenchmark, findSalaryBenchmark } from "@/data/salary-benchmarks";

const GES_DATASET_ID = "d_3c55210de27fcccda2ed0c63fdd2b352";
const MOM_WAGES_DATASET_ID = "d_9917e751f7498502f70052a940a3f312";
const MOM_WAGES_BY_AGE_DATASET_ID = "d_db0e6e9b54364552dd9d2fc6a28f14f0";
const DATA_GOV_BASE = "https://data.gov.sg/api/action/datastore_search";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const API_TIMEOUT_MS = 5000;

interface GESRecord {
  year: string;
  university: string;
  school: string;
  degree: string;
  employment_rate_overall: string;
  employment_rate_ft_perm: string;
  gross_monthly_median: string;
  gross_mthly_25_percentile: string;
  gross_mthly_75_percentile: string;
}

interface CacheEntry {
  data: SalaryBenchmark[];
  cachedAt: number;
}

const cache = new Map<string, CacheEntry>();

function parseNumber(val: string): number | null {
  if (!val || val === "na" || val === "N.A." || val === "x") return null;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function toBenchmark(record: GESRecord): SalaryBenchmark | null {
  const median = parseNumber(record.gross_monthly_median);
  const p25 = parseNumber(record.gross_mthly_25_percentile);
  const p75 = parseNumber(record.gross_mthly_75_percentile);
  const empRate = parseNumber(record.employment_rate_ft_perm)
    ?? parseNumber(record.employment_rate_overall);

  if (!median || !p25 || !p75) return null;

  return {
    field: record.degree,
    degree: "Bachelor's",
    medianSalary: median,
    p25Salary: p25,
    p75Salary: p75,
    employmentRate: empRate ?? 0,
    source: `${record.university} GES ${record.year} (data.gov.sg)`,
  };
}

async function fetchGES(query: string, limit: number = 20): Promise<GESRecord[]> {
  const url = `${DATA_GOV_BASE}?resource_id=${GES_DATASET_ID}&q=${encodeURIComponent(query)}&sort=year+desc&limit=${limit}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.result?.records ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function getLatestByDegree(records: GESRecord[]): GESRecord[] {
  const latest = new Map<string, GESRecord>();

  for (const r of records) {
    const key = `${r.university}|${r.degree}`;
    const existing = latest.get(key);
    if (!existing || parseInt(r.year) > parseInt(existing.year)) {
      latest.set(key, r);
    }
  }

  return Array.from(latest.values());
}

export async function fetchLiveSalaryData(field: string, degree?: string): Promise<SalaryBenchmark[]> {
  const cacheKey = `${field}|${degree ?? ""}`.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const records = await fetchGES(field);
  if (records.length === 0) {
    return findSalaryBenchmark(field, degree);
  }

  const latest = getLatestByDegree(records);
  const benchmarks = latest
    .map(toBenchmark)
    .filter((b): b is SalaryBenchmark => b !== null);

  if (benchmarks.length === 0) {
    return findSalaryBenchmark(field, degree);
  }

  cache.set(cacheKey, { data: benchmarks, cachedAt: Date.now() });
  return benchmarks;
}

export async function fetchSalaryWithFallback(
  field: string,
  degree?: string,
  yearsExperience?: number,
  age?: number
): Promise<{ benchmarks: SalaryBenchmark[]; source: "live" | "live-mom" | "static" }> {
  // Mid-career route: use MOM Occupational Wages for 4+ years experience
  if ((yearsExperience ?? 0) >= 4) {
    try {
      const momResult = await fetchMOMOccupationalWages(field, age);
      if (momResult.length > 0) {
        return { benchmarks: momResult, source: "live-mom" };
      }
    } catch {
      // Fall through to GES / static
    }
  }

  // Fresh grad route: use GES
  try {
    const live = await fetchLiveSalaryData(field, degree);
    if (live.length > 0 && live[0].source.includes("data.gov.sg")) {
      return { benchmarks: live, source: "live" };
    }
    return { benchmarks: live, source: "static" };
  } catch {
    return { benchmarks: findSalaryBenchmark(field, degree), source: "static" };
  }
}

// --- MOM Occupational Wages (covers all experience levels) ---

const FIELD_TO_OCCUPATIONS: Record<string, string[]> = {
  "Computer Science": ["software developer", "systems analyst", "database administrator"],
  "Information Systems": ["systems analyst", "business analyst", "database administrator"],
  "Data Science / Analytics": ["data scientist", "statistician", "business analyst"],
  "Cybersecurity": ["information security analyst", "systems analyst"],
  "Software Engineering": ["software developer", "systems analyst", "web developer"],
  "Electrical Engineering": ["electrical engineer", "electronics engineer"],
  "Mechanical Engineering": ["mechanical engineer"],
  "Chemical Engineering": ["chemical engineer"],
  "Civil Engineering": ["civil engineer"],
  "Industrial & Systems Engineering": ["industrial engineer", "production engineer"],
  "Business Administration": ["administration manager", "business analyst"],
  "Accountancy": ["accountant (excluding tax accountant)", "auditor"],
  "Finance": ["financial analyst", "financial adviser"],
  "Economics": ["economist", "financial analyst"],
  "Marketing": ["marketing manager", "advertising/public relations manager"],
  "Biological Sciences": ["biologist", "laboratory analyst"],
  "Chemistry": ["chemist", "laboratory analyst"],
  "Physics": ["physicist"],
  "Mathematics": ["statistician", "actuary"],
  "Environmental Science": ["environmental engineer"],
  "Communications / Media": ["public relations professional", "journalist"],
  "Psychology": ["psychologist", "counsellor"],
  "Law": ["lawyer", "legal counsel"],
  "Architecture": ["architect"],
  "Medicine": ["medical doctor"],
  "Nursing": ["registered nurse"],
  "Pharmacy": ["pharmacist"],
  "Dentistry": ["dentist"],
  "IT / Computing": ["software developer", "web developer", "systems analyst"],
  "Engineering": ["mechanical engineer", "electrical engineer", "civil engineer"],
  "Business": ["administration manager", "business analyst"],
};

function getAgeBand(age: number): string | undefined {
  if (age < 25) return "Below 25";
  if (age < 30) return "25 - 29";
  if (age < 35) return "30 - 34";
  if (age < 40) return "35 - 39";
  if (age < 45) return "40 - 44";
  if (age < 50) return "45 - 49";
  if (age < 55) return "50 - 54";
  if (age < 60) return "55 - 59";
  return "60 & Over";
}

interface MOMWageRecord {
  year: string;
  occupation: string;
  gross_wage_75: string;
  gross_wage_median: string;
  gross_wage_25: string;
  basic_wage_75: string;
  basic_wage_median: string;
  basic_wage_25: string;
  age?: string;
}

function momRecordToBenchmark(record: MOMWageRecord, ageBand?: string): SalaryBenchmark | null {
  const median = parseNumber(record.gross_wage_median);
  const p25 = parseNumber(record.gross_wage_25);
  const p75 = parseNumber(record.gross_wage_75);

  if (!median || !p25 || !p75) return null;

  const sourceLabel = ageBand
    ? `MOM Occupational Wage Survey 2024, aged ${ageBand} (data.gov.sg)`
    : "MOM Occupational Wage Survey 2024 (data.gov.sg)";

  return {
    field: record.occupation,
    degree: "All levels",
    medianSalary: median,
    p25Salary: p25,
    p75Salary: p75,
    employmentRate: 0,
    source: sourceLabel,
  };
}

async function fetchMOMWagesAPI(datasetId: string, occupation: string, ageBand?: string): Promise<MOMWageRecord[]> {
  let url = `${DATA_GOV_BASE}?resource_id=${datasetId}&q=${encodeURIComponent(occupation)}&limit=20`;
  if (ageBand) {
    url += `&filters=${encodeURIComponent(JSON.stringify({ age: ageBand }))}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.result?.records ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMOMOccupationalWages(field: string, age?: number): Promise<SalaryBenchmark[]> {
  const cacheKey = `mom|${field}|${age ?? ""}`.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const occupations = FIELD_TO_OCCUPATIONS[field] ?? [];
  if (occupations.length === 0) {
    // Try a direct search with the field name
    const directResults = await fetchMOMWagesAPI(MOM_WAGES_DATASET_ID, field.toLowerCase());
    if (directResults.length > 0) {
      const benchmarks = directResults
        .map(r => momRecordToBenchmark(r))
        .filter((b): b is SalaryBenchmark => b !== null);
      if (benchmarks.length > 0) {
        cache.set(cacheKey, { data: benchmarks, cachedAt: Date.now() });
        return benchmarks;
      }
    }
    return [];
  }

  // Try age-band dataset first if age is known
  if (age) {
    const ageBand = getAgeBand(age);
    if (ageBand) {
      for (const occ of occupations) {
        const records = await fetchMOMWagesAPI(MOM_WAGES_BY_AGE_DATASET_ID, occ, ageBand);
        if (records.length > 0) {
          const benchmarks = records
            .map(r => momRecordToBenchmark(r, ageBand))
            .filter((b): b is SalaryBenchmark => b !== null);
          if (benchmarks.length > 0) {
            cache.set(cacheKey, { data: benchmarks, cachedAt: Date.now() });
            return benchmarks;
          }
        }
      }
    }
  }

  // Fall back to overall occupational wages (no age filter)
  for (const occ of occupations) {
    const records = await fetchMOMWagesAPI(MOM_WAGES_DATASET_ID, occ);
    if (records.length > 0) {
      const benchmarks = records
        .map(r => momRecordToBenchmark(r))
        .filter((b): b is SalaryBenchmark => b !== null);
      if (benchmarks.length > 0) {
        cache.set(cacheKey, { data: benchmarks, cachedAt: Date.now() });
        return benchmarks;
      }
    }
  }

  return [];
}
