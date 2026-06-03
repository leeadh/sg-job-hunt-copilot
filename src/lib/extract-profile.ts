export interface ExtractedProfile {
  field?: string;
  degree?: string;
  yearsExperience?: number;
  age?: number;
  employmentStatus?: "employed" | "unemployed" | "student";
}

const FIELD_PATTERNS: [RegExp, string][] = [
  [/\b(computer science|comp\.?\s*sci)\b/i, "Computer Science"],
  [/\b(information systems|info\.?\s*sys)\b/i, "Information Systems"],
  [/\b(data science|data analytics)\b/i, "Data Science / Analytics"],
  [/\bcyber\s*security\b/i, "Cybersecurity"],
  [/\b(software eng|software development)\b/i, "Software Engineering"],
  [/\b(electrical eng|electrical & electronic)\b/i, "Electrical Engineering"],
  [/\b(mechanical eng)\b/i, "Mechanical Engineering"],
  [/\b(chemical eng)\b/i, "Chemical Engineering"],
  [/\b(civil eng)\b/i, "Civil Engineering"],
  [/\b(industrial.*eng|systems eng)\b/i, "Industrial & Systems Engineering"],
  [/\b(business admin|business management|bba)\b/i, "Business Administration"],
  [/\baccountan/i, "Accountancy"],
  [/\bfinance\b/i, "Finance"],
  [/\beconomics\b/i, "Economics"],
  [/\bmarketing\b/i, "Marketing"],
  [/\b(bio\w*\s*science|life science|biology)\b/i, "Biological Sciences"],
  [/\bchemistry\b/i, "Chemistry"],
  [/\bphysics\b/i, "Physics"],
  [/\bmathematics\b/i, "Mathematics"],
  [/\b(environmental science|environmental studies)\b/i, "Environmental Science"],
  [/\b(communications?|mass comm|media studies)\b/i, "Communications / Media"],
  [/\bpsychology\b/i, "Psychology"],
  [/\b(political science|public policy)\b/i, "Political Science"],
  [/\b(law|llb|juris)\b/i, "Law"],
  [/\barchitecture\b/i, "Architecture"],
  [/\b(medicine|mbbs|medical)\b/i, "Medicine"],
  [/\bnursing\b/i, "Nursing"],
  [/\bpharmac/i, "Pharmacy"],
  [/\bdentistry\b/i, "Dentistry"],
];

const DEGREE_PATTERNS: [RegExp, string][] = [
  [/\b(master|msc|mba|m\.a\.|m\.s\.|m\.eng|meng|masters)\b/i, "Bachelor's"],
  [/\b(bachelor|bsc|b\.a\.|b\.s\.|b\.eng|beng|degree|honours|honor)\b/i, "Bachelor's"],
  [/\b(diploma|dip\.?|advanced diploma|poly|polytechnic)\b/i, "Diploma"],
];

const GRADUATION_AGE: Record<string, number> = {
  "Diploma": 20,
  "Bachelor's": 24,
};

function extractYearsExperience(text: string): number | undefined {
  const currentYear = new Date().getFullYear();
  const yearPattern = /\b(20\d{2}|19\d{2})\b/g;
  const years: number[] = [];
  let match;
  while ((match = yearPattern.exec(text)) !== null) {
    const y = parseInt(match[1]);
    if (y >= 1980 && y <= currentYear) years.push(y);
  }
  if (years.length < 2) return undefined;

  const earliest = Math.min(...years);
  const latest = Math.max(...years);

  if (latest >= currentYear - 1 && latest - earliest >= 1) {
    return latest - earliest;
  }
  return undefined;
}

function extractAge(text: string, degree?: string): number | undefined {
  const currentYear = new Date().getFullYear();

  // 1) Explicit DOB or age statement
  const dobPatterns = [
    /\b(?:d\.?o\.?b\.?|date of birth|born)[:\s]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/i,
    /\b(?:d\.?o\.?b\.?|date of birth|born)[:\s]*\w+\s+\d{1,2},?\s+(\d{4})\b/i,
    /\b(?:d\.?o\.?b\.?|date of birth|born)[:\s]*(\d{4})\b/i,
    /\bage[:\s]*(\d{2})\b/i,
  ];

  for (const pat of dobPatterns) {
    const m = text.match(pat);
    if (!m) continue;
    if (pat.source.includes("age")) {
      const a = parseInt(m[1]);
      if (a >= 16 && a <= 80) return a;
    } else {
      const year = parseInt(m[m.length - 1]);
      if (year >= 1940 && year <= currentYear - 16) {
        return currentYear - year;
      }
    }
  }

  // 2) Estimate from graduation year + degree type
  const gradPatterns = [
    /\b(?:graduated?|class of|batch of|cohort)\s*:?\s*(20\d{2}|19\d{2})\b/i,
    /(?:bachelor|bsc|b\.?a\.?|diploma|master|msc|mba|b\.?eng)[\s\S]{0,80}?(20\d{2}|19\d{2})\b/i,
    /\b(20\d{2}|19\d{2})\s*[-–]\s*(?:20\d{2}|19\d{2})\b.*(?:university|polytechnic|college|school|institute)/i,
  ];

  for (const pat of gradPatterns) {
    const m = text.match(pat);
    if (m) {
      const gradYear = parseInt(m[1]);
      if (gradYear >= 1970 && gradYear <= currentYear) {
        const typicalAge = GRADUATION_AGE[degree || "Bachelor's"] || 24;
        const estimated = currentYear - gradYear + typicalAge;
        if (estimated >= 18 && estimated <= 80) return estimated;
      }
    }
  }

  // 3) Estimate from earliest work year (assume started working at ~22-24)
  const workYearPattern = /\b(20\d{2}|19\d{2})\b/g;
  const workYears: number[] = [];
  let wm;
  while ((wm = workYearPattern.exec(text)) !== null) {
    const y = parseInt(wm[1]);
    if (y >= 1980 && y <= currentYear) workYears.push(y);
  }
  if (workYears.length >= 2) {
    const earliestWork = Math.min(...workYears);
    const startAge = degree === "Diploma" ? 20 : 23;
    const estimated = currentYear - earliestWork + startAge;
    if (estimated >= 18 && estimated <= 80) return estimated;
  }

  return undefined;
}

function extractEmploymentStatus(text: string): ExtractedProfile["employmentStatus"] | undefined {
  const currentYear = new Date().getFullYear();
  const textLower = text.toLowerCase();

  // Currently employed: look for "present", "current", or current year as end date
  const presentPatterns = [
    /[-–]\s*present\b/i,
    /[-–]\s*current\b/i,
    /[-–]\s*now\b/i,
    /[-–]\s*ongoing\b/i,
    new RegExp(`[-–]\\s*${currentYear}\\b`),
  ];

  for (const pat of presentPatterns) {
    if (pat.test(text)) return "employed";
  }

  // Student: currently studying
  const studentPatterns = [
    /\b(?:expected|anticipated)\s+(?:graduation|grad\.?)\b/i,
    /\b(?:year\s+[1-4]|currently\s+(?:studying|pursuing|enrolled))\b/i,
    /\b(?:undergraduate|postgraduate)\s+(?:student)\b/i,
  ];

  for (const pat of studentPatterns) {
    if (pat.test(text)) return "student";
  }

  // Fresh grad: graduated recently, no "present" in work section
  const recentGradYear = currentYear - 1;
  const recentGradPattern = new RegExp(
    `(?:bachelor|bsc|diploma|master|msc|graduated|class of)[\\s\\S]{0,40}(?:${recentGradYear}|${currentYear})`,
    "i"
  );
  if (recentGradPattern.test(text)) return "student";

  // If latest job ended in a past year, likely unemployed
  const dateRangePattern = /\b(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|19\d{2})\b/g;
  let latestEnd = 0;
  let dr;
  while ((dr = dateRangePattern.exec(text)) !== null) {
    const endYear = parseInt(dr[2]);
    if (endYear > latestEnd) latestEnd = endYear;
  }

  if (latestEnd > 0 && latestEnd < currentYear - 1) {
    return "unemployed";
  }

  // If we see job titles but no "present", check if it looks like they're not working
  if (/\b(experience|employment|work history)\b/i.test(textLower) && latestEnd > 0 && latestEnd < currentYear) {
    return "unemployed";
  }

  return undefined;
}

export function extractProfileFromResume(resumeText: string): ExtractedProfile {
  const result: ExtractedProfile = {};

  for (const [pattern, fieldName] of FIELD_PATTERNS) {
    if (pattern.test(resumeText)) {
      result.field = fieldName;
      break;
    }
  }

  for (const [pattern, degreeName] of DEGREE_PATTERNS) {
    if (pattern.test(resumeText)) {
      result.degree = degreeName;
      break;
    }
  }

  result.yearsExperience = extractYearsExperience(resumeText);
  result.age = extractAge(resumeText, result.degree);
  result.employmentStatus = extractEmploymentStatus(resumeText);

  return result;
}
