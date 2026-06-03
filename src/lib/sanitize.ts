const MAX_RESUME_LENGTH = 15_000;
const MAX_JD_LENGTH = 5_000;
const MIN_INPUT_LENGTH = 50;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /you\s+are\s+now\s+(a|an)\s/i,
  /forget\s+(everything|all|your)\b/i,
  /reveal\s+(your|the)\s+(system\s+)?prompt/i,
  /show\s+(me\s+)?(your|the)\s+(system\s+)?prompt/i,
  /what\s+(are|is)\s+your\s+(system\s+)?instructions/i,
  /act\s+as\s+(a|an)\s/i,
  /pretend\s+(you\s+are|to\s+be)\s/i,
  /new\s+instructions?\s*:/i,
  /override\s+(previous|system)/i,
  /disregard\s+(all|previous|your)/i,
  /do\s+not\s+follow\s+(your|the)\s+(system|original)/i,
  /jailbreak/i,
  /DAN\s*mode/i,
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateInputs(resumeText: string, jobDescription?: string): ValidationResult {
  if (!resumeText || typeof resumeText !== "string") {
    return { valid: false, error: "Resume text is required" };
  }

  if (resumeText.trim().length < MIN_INPUT_LENGTH) {
    return { valid: false, error: `Resume is too short (minimum ${MIN_INPUT_LENGTH} characters). Paste your full resume.` };
  }

  if (resumeText.length > MAX_RESUME_LENGTH) {
    return { valid: false, error: `Resume exceeds ${MAX_RESUME_LENGTH.toLocaleString()} characters. Please shorten it.` };
  }

  if (jobDescription && jobDescription.length > MAX_JD_LENGTH) {
    return { valid: false, error: `Job description exceeds ${MAX_JD_LENGTH.toLocaleString()} characters. Please shorten it.` };
  }

  return { valid: true };
}

export function sanitizeForPrompt(text: string, label: string): string {
  let cleaned = text;

  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[FILTERED]");
  }

  return `<${label}>\n${cleaned}\n</${label}>`;
}

export function containsInjectionAttempt(text: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(text));
}
