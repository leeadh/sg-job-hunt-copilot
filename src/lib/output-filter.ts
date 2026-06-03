const DANGEROUS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=\s*["']/i,
  /data:text\/html/i,
];

const EXPECTED_SECTIONS = ["Key Issues", "Revised Resume"];

export interface FilterResult {
  safe: boolean;
  output: string;
  warnings: string[];
}

export function filterLLMOutput(text: string): FilterResult {
  const warnings: string[] = [];
  let output = text;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(output)) {
      output = output.replace(new RegExp(pattern.source, "gi"), "[REMOVED]");
      warnings.push("Potentially unsafe content was removed from the AI response.");
    }
  }

  const hasSections = EXPECTED_SECTIONS.some(s => output.includes(s));
  if (!hasSections && output.length > 200) {
    warnings.push("AI response did not follow the expected format.");
  }

  return { safe: warnings.length === 0, output, warnings };
}
