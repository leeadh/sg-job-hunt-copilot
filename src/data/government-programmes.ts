export interface Programme {
  name: string;
  agency: string;
  description: string;
  eligibility: string[];
  benefit: string;
  url: string;
  match: (profile: UserProfile) => { eligible: boolean; reason: string };
}

export interface UserProfile {
  age?: number;
  yearsExperience?: number;
  expectedSalary?: number;
  employmentStatus?: "employed" | "unemployed" | "retrenched" | "student";
  citizenship?: "citizen" | "pr" | "foreigner";
  field?: string;
  jobDescription?: string;
}

function isTechRole(field?: string, jd?: string): boolean {
  const techTerms = /tech|software|data|engineer|developer|cyber|ai|cloud|ict|devops|machine learning|analytics|programming|computing/i;
  return techTerms.test(field || "") || techTerms.test(jd || "");
}

export const GOVERNMENT_PROGRAMMES: Programme[] = [
  {
    name: "Career Conversion Programme (CCP) — Tech",
    agency: "WSG / IMDA",
    description: "Company hires you into a tech role, government pays up to 90% of your salary while you train on-the-job for up to 6 months.",
    eligibility: [
      "Singapore Citizen or Permanent Resident",
      "At least 21 years old, graduated or completed NS ≥ 2 years ago",
      "Switching into a role substantially different from previous job",
      "Hired by a participating employer",
    ],
    benefit: "Up to 90% salary support (capped at $6,000/month) for up to 6 months",
    url: "https://www.wsg.gov.sg/home/individuals/attachment-placement-programmes/career-conversion-programmes-for-individuals",
    match: (p) => {
      if (p.citizenship === "foreigner") return { eligible: false, reason: "Only for SC/PR" };
      if ((p.yearsExperience ?? 0) < 2) return { eligible: false, reason: "Need ≥ 2 years work experience" };
      if (p.employmentStatus === "student") return { eligible: false, reason: "Not for students" };
      const isEnhancedTier = p.citizenship === "citizen" && (p.age ?? 0) >= 40;
      if (isTechRole(p.field, p.jobDescription)) {
        const tierNote = isEnhancedTier
          ? "As a Singaporean aged 40+, you qualify for the enhanced tier (up to 90% salary support, capped at $6,000/month)."
          : "Note: The enhanced 90% salary support tier requires Singapore Citizenship and age 40+. Standard CCP support is still available for SC/PR aged 21+.";
        return { eligible: true, reason: `You have ${p.yearsExperience} years experience and are targeting a tech role — this programme could subsidize your salary while you reskill. ${tierNote}` };
      }
      const tierNote = isEnhancedTier
        ? "As a Singaporean aged 40+, you qualify for the enhanced tier."
        : "Note: Enhanced 90% salary support requires SC and age 40+.";
      return { eligible: true, reason: `Available across 30+ sectors, not just tech. Check WSG for your sector. ${tierNote}` };
    },
  },
  {
    name: "SkillsFuture Mid-Career Enhanced Subsidy",
    agency: "SSG",
    description: "Up to 90% course fee subsidy (vs 70% for under-40s) on SSG-supported and MOE-subsidised courses.",
    eligibility: [
      "Singapore Citizen",
      "Aged 40 and above",
    ],
    benefit: "Up to 90% course fee subsidy at CET Centres, at least 90% for MOE-subsidised programmes",
    url: "https://www.skillsfuture.gov.sg/enhancedsubsidy",
    match: (p) => {
      if (p.citizenship !== "citizen") return { eligible: false, reason: "Only for Singapore Citizens" };
      if ((p.age ?? 0) < 40) return { eligible: false, reason: `You need to be 40+. You're ${p.age ?? "unknown age"}.` };
      return { eligible: true, reason: `At ${p.age}, you qualify for up to 90% course fee subsidy — 20% more than younger workers. Check MySkillsFuture for eligible courses.` };
    },
  },
  {
    name: "SkillsFuture Credit",
    agency: "SSG",
    description: "Government credits for approved courses. Check your balance on MySkillsFuture portal via Singpass.",
    eligibility: [
      "Singapore Citizen",
      "Aged 25 and above",
    ],
    benefit: "$500 opening credit + periodic top-ups. Use on top of existing course fee subsidies.",
    url: "https://www.myskillsfuture.gov.sg",
    match: (p) => {
      if (p.citizenship !== "citizen") return { eligible: false, reason: "Only for Singapore Citizens" };
      if ((p.age ?? 25) < 25) return { eligible: false, reason: "Need to be 25+" };
      return { eligible: true, reason: "You likely have unused SkillsFuture credits. Log into MySkillsFuture with Singpass to check your balance." };
    },
  },
  {
    name: "SkillsFuture Jobseeker Support (SFJS)",
    agency: "WSG",
    description: "Temporary financial support while you actively search for a new job. Earn points by attending career coaching and submitting applications.",
    eligibility: [
      "Singapore Citizen or Permanent Resident, aged 21+",
      "Involuntarily unemployed (retrenched / contract ended / company closed)",
      "Previously earned average gross monthly income ≤ $5,000",
      "Property annual value ≤ $31,000",
      "Employed in SG for at least 6 months in past 12 months",
    ],
    benefit: "Up to $6,000 over 6 months. Apply at go.gov.sg/jobseekersupport",
    url: "https://www.wsg.gov.sg/home/individuals/jobseeker-support",
    match: (p) => {
      if (p.citizenship === "foreigner") return { eligible: false, reason: "Only for SC/PR" };
      if (p.employmentStatus !== "unemployed" && p.employmentStatus !== "retrenched") {
        return { eligible: false, reason: "Only for involuntarily unemployed jobseekers" };
      }
      if ((p.expectedSalary ?? 0) > 5000 && p.expectedSalary !== undefined) {
        return { eligible: false, reason: "Previous income must be ≤ $5,000/month to qualify" };
      }
      return { eligible: true, reason: "You may qualify for up to $6,000 over 6 months. Apply at go.gov.sg/jobseekersupport — this is real money while you job search." };
    },
  },
  {
    name: "Tech Skills Accelerator (TeSA)",
    agency: "IMDA",
    description: "Multiple pathways into tech: place-and-train, company-led training, AI fluency programmes. IMDA expanding to upskill 40,000 professionals by 2029.",
    eligibility: [
      "Singapore Citizen or Permanent Resident",
      "Various pathways for fresh grads (TIP Alliance) and mid-career (CCP/CLT)",
    ],
    benefit: "Structured OJT + certifications, salary supported by government grants to employer",
    url: "https://www.imda.gov.sg/how-we-can-help/techskills-accelerator-tesa",
    match: (p) => {
      if (p.citizenship === "foreigner") return { eligible: false, reason: "Only for SC/PR" };
      if (!isTechRole(p.field, p.jobDescription)) return { eligible: false, reason: "Primarily for ICT/tech roles" };
      if ((p.yearsExperience ?? 0) === 0) {
        return { eligible: true, reason: "As a fresh grad targeting tech, check the TIP Alliance+ for ITE/Poly grads or TIPP for career converters." };
      }
      return { eligible: true, reason: "You're targeting a tech role — TeSA's Company-Led Training or AI fluency programmes could be relevant." };
    },
  },
  {
    name: "Workfare Income Supplement (WIS)",
    agency: "CPF Board",
    description: "Monthly cash + CPF top-ups for lower-wage workers. You may already be getting this without knowing — check via govbenefits.gov.sg.",
    eligibility: [
      "Singapore Citizen",
      "Aged 30+ (or 17+ if person with disability)",
      "Gross monthly income between $500 and $3,000",
      "Property annual value ≤ $31,000",
    ],
    benefit: "Up to $4,900/year (40% cash, 60% CPF). Paid monthly for employees.",
    url: "https://www.cpf.gov.sg/member/growing-your-savings/government-support/workfare-income-supplement",
    match: (p) => {
      if (p.citizenship !== "citizen") return { eligible: false, reason: "Only for Singapore Citizens" };
      if ((p.age ?? 0) < 30) return { eligible: false, reason: "Need to be 30+" };
      if (p.expectedSalary !== undefined && p.expectedSalary > 3000) {
        return { eligible: false, reason: `Your expected income ($${p.expectedSalary.toLocaleString()}) exceeds the $3,000 cap` };
      }
      if (p.expectedSalary !== undefined && p.expectedSalary >= 500 && p.expectedSalary <= 3000) {
        return { eligible: true, reason: `At $${p.expectedSalary.toLocaleString()}/month, you likely qualify for WIS. That's up to $4,900/year in cash + CPF. Check govbenefits.gov.sg.` };
      }
      return { eligible: false, reason: "Income must be between $500 and $3,000/month" };
    },
  },
  {
    name: "Workforce Singapore Career Matching",
    agency: "WSG",
    description: "Free 1-on-1 career coaching at Careers Connect centres. They review your resume, run workshops, and refer you directly to employers.",
    eligibility: [
      "Singapore Citizen or Permanent Resident",
      "Actively seeking employment",
    ],
    benefit: "Free career advisory, workshops, and direct job referrals",
    url: "https://www.wsg.gov.sg/home/individuals/career-matching-guidance/visit-career-centres",
    match: (p) => {
      if (p.citizenship === "foreigner") return { eligible: false, reason: "Only for SC/PR" };
      if (p.employmentStatus === "employed") return { eligible: false, reason: "Primarily for active jobseekers" };
      return { eligible: true, reason: "Free in-person career coaching — walk in or book online. They can review your resume and connect you with employers directly." };
    },
  },
  {
    name: "NTUC e2i Career Services",
    agency: "NTUC e2i",
    description: "Career coaching, job fairs, and employment facilitation. Walk-in friendly, no appointment needed for many services.",
    eligibility: [
      "Singapore Citizen or Permanent Resident",
      "NTUC union member or general jobseeker",
    ],
    benefit: "Free career coaching, skills assessment, job matching, and career fair access",
    url: "https://e2i.com.sg",
    match: (p) => {
      if (p.citizenship === "foreigner") return { eligible: false, reason: "Only for SC/PR" };
      if (p.employmentStatus === "employed") return { eligible: false, reason: "Primarily for active jobseekers" };
      return { eligible: true, reason: "Walk-in career coaching and regular job fairs. Check e2i.com.sg for upcoming events near you." };
    },
  },
  {
    name: "MyCareersFuture Job Portal",
    agency: "WSG",
    description: "National job portal. Employers hiring foreign workers must post here first (Fair Consideration Framework). Salary ranges shown for most roles.",
    eligibility: [
      "Open to all jobseekers",
    ],
    benefit: "Job listings with salary transparency and skills-based matching",
    url: "https://www.mycareersfuture.gov.sg",
    match: () => {
      return { eligible: true, reason: "Search for roles matching your skills. Salary ranges are shown for most listings — useful for benchmarking." };
    },
  },
];

export function matchProgrammes(profile: UserProfile): { programme: Programme; reason: string }[] {
  return GOVERNMENT_PROGRAMMES
    .map(p => {
      const result = p.match(profile);
      return result.eligible ? { programme: p, reason: result.reason } : null;
    })
    .filter((r): r is { programme: Programme; reason: string } => r !== null);
}
