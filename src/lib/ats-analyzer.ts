export interface ATSResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  formatIssues: string[];
  suggestions: string[];
}

const COMMON_ATS_ISSUES = [
  { pattern: /\.(png|jpg|jpeg|gif|svg)/i, issue: "Contains image file references — ATS cannot read images" },
  { pattern: /[│┤├┬┴┼╔╗╚╝║═]/, issue: "Contains special box-drawing characters that ATS may not parse" },
  { pattern: /\t{3,}/, issue: "Excessive tabs may break ATS column parsing" },
];

const SKILL_TERMS = [
  // Programming languages
  "python", "java", "javascript", "typescript", "c++", "c#", "go", "golang", "rust", "ruby",
  "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "html", "css", "bash", "shell",
  // Frameworks & tools
  "react", "angular", "vue", "nextjs", "next.js", "nodejs", "node.js", "express", "django",
  "flask", "spring", "springboot", ".net", "terraform", "docker", "kubernetes", "k8s",
  "jenkins", "git", "github", "gitlab", "jira", "confluence", "notion",
  // Cloud
  "aws", "azure", "gcp", "google cloud", "snowflake", "databricks", "redshift", "bigquery",
  "ec2", "s3", "lambda", "rds", "ecs", "eks", "fargate", "cloudformation", "cdk",
  // Data & AI
  "machine learning", "deep learning", "nlp", "natural language processing", "computer vision",
  "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "llm", "generative ai", "gen ai",
  "rag", "langchain", "openai", "bedrock", "sagemaker", "data pipeline", "etl", "elt",
  "spark", "hadoop", "kafka", "airflow", "dbt", "tableau", "power bi", "looker", "excel",
  "data warehouse", "data lake", "data modeling", "data governance",
  // DevOps & methodologies
  "agile", "scrum", "kanban", "devops", "ci/cd", "cicd", "microservices", "rest api", "restful",
  "graphql", "tdd", "bdd", "sre", "monitoring", "observability",
  // Certifications
  "aws certified", "cka", "ckad", "pmp", "csm", "cissp", "ceh", "togaf", "itil",
  "prince2", "six sigma", "cfa", "acca", "cpa",
  // Business & finance
  "financial analysis", "financial modeling", "valuation", "budgeting", "forecasting",
  "accounting", "audit", "tax", "compliance", "risk management", "credit risk",
  "investment", "portfolio", "banking", "insurance", "wealth management",
  "business development", "sales", "marketing", "digital marketing", "seo", "sem",
  "crm", "salesforce", "hubspot", "analytics", "kpi", "roi",
  "strategy", "consulting", "market research", "competitive analysis",
  // Operations & management
  "project management", "programme management", "stakeholder management",
  "cross-functional", "team lead", "people management", "vendor management",
  "supply chain", "logistics", "procurement", "operations", "process improvement",
  "lean", "continuous improvement", "change management",
  // Design & product
  "ui/ux", "ux design", "ui design", "figma", "sketch", "adobe", "photoshop",
  "product management", "product owner", "user research", "wireframe", "prototype",
  // Communication & soft skills
  "leadership", "communication", "presentation", "negotiation", "problem solving",
  "critical thinking", "collaboration", "mentoring", "coaching",
  // Healthcare
  "clinical", "patient care", "healthcare", "medical", "pharmaceutical", "nursing",
  "public health", "regulatory", "gmp", "fda",
  // Engineering (non-software)
  "cad", "autocad", "solidworks", "bim", "revit", "structural", "mechanical",
  "electrical", "civil engineering", "environmental", "sustainability", "esg",
  // Legal
  "contract", "legal", "regulatory compliance", "intellectual property", "due diligence",
];

export function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found = new Set<string>();

  for (const term of SKILL_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lowerText)) {
      found.add(term);
    }
  }

  // Also extract capitalized proper nouns / acronyms from original text (likely tools/companies)
  const acronyms = text.match(/\b[A-Z]{2,6}\b/g);
  if (acronyms) {
    for (const a of acronyms) {
      const lower = a.toLowerCase();
      if (!["the", "and", "for", "with", "from", "this", "that", "have"].includes(lower)) {
        found.add(lower);
      }
    }
  }

  return [...found];
}

export function analyzeResume(resumeText: string, jobDescription: string): ATSResult {
  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jdKeywords = [...new Set(extractKeywords(jobDescription))];

  const matched = jdKeywords.filter(k => resumeKeywords.has(k));
  const missing = jdKeywords.filter(k => !resumeKeywords.has(k));

  const formatIssues: string[] = [];
  for (const check of COMMON_ATS_ISSUES) {
    if (check.pattern.test(resumeText)) {
      formatIssues.push(check.issue);
    }
  }

  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 150) {
    formatIssues.push("Resume appears too short (under 150 words). ATS may flag as incomplete.");
  }
  if (wordCount > 1200) {
    formatIssues.push("Resume is over 1,200 words. Most SG hiring managers prefer 1 page for < 10 years experience.");
  }

  const hasQuantifiedResults = /\b\d+%|\$\d|\d+x|\d+ (users|clients|projects|people|team)/i.test(resumeText);
  const suggestions: string[] = [];

  if (!hasQuantifiedResults) {
    suggestions.push("Add quantified achievements (e.g., 'Reduced API latency by 40%' or 'Managed team of 8').");
  }

  if (missing.length > 0) {
    const topMissing = missing.slice(0, 5);
    suggestions.push(`Add these missing keywords from the JD: ${topMissing.join(", ")}`);
  }

  if (!/education|university|degree|diploma|bachelor|master/i.test(resumeText)) {
    suggestions.push("Education section may be missing or not clearly labeled.");
  }

  if (!/experience|work\s?history|employment/i.test(resumeText)) {
    suggestions.push("Work experience section may be missing or not clearly labeled.");
  }

  const overallScore = jdKeywords.length > 0
    ? Math.round((matched.length / jdKeywords.length) * 100)
    : 0;

  return {
    overallScore: Math.min(overallScore, 100),
    matchedKeywords: matched,
    missingKeywords: missing,
    formatIssues,
    suggestions,
  };
}
