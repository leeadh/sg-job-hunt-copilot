import { ResumeData, ResumeExperience, ResumeEducation, ResumeCertification, ResumeSkillGroup } from "./resume-schema";

/**
 * Parse the "## Revised Resume" section from the LLM analysis into structured ResumeData.
 * Expects the strict format enforced by the system prompt.
 */
export function parseRevisedResume(llmAnalysis: string): ResumeData | null {
  const match = llmAnalysis.match(/## Revised Resume\s*\n([\s\S]*?)(?=\n## (?!.*Resume)|$)/);
  if (!match) return null;

  const text = match[1].trim();
  const lines = text.split("\n");

  let name = "";
  let title = "";
  let contactLine = "";
  const sections: { header: string; lines: string[] }[] = [];
  let currentSection: { header: string; lines: string[] } | null = null;
  let headersDone = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect ### SECTION headers
    if (trimmed.startsWith("### ")) {
      headersDone = true;
      if (currentSection) sections.push(currentSection);
      currentSection = { header: trimmed.slice(4).trim().toUpperCase(), lines: [] };
      continue;
    }

    // Before first section: extract name, title, contact
    if (!headersDone && !currentSection) {
      if (!name) {
        name = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      } else if (!title) {
        title = trimmed.replace(/\*\*/g, "").trim();
      } else if (!contactLine) {
        contactLine = trimmed.replace(/\*\*/g, "").trim();
      }
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(trimmed);
    }
  }
  if (currentSection) sections.push(currentSection);

  // Parse contact
  const contact = parseContact(contactLine);

  // Parse sections
  let summary = "";
  const experience: ResumeExperience[] = [];
  const education: ResumeEducation[] = [];
  const skills: ResumeSkillGroup[] = [];
  const certifications: ResumeCertification[] = [];
  let languages: string[] = [];

  for (const sec of sections) {
    const h = sec.header;
    if (/SUMMARY|PROFILE|OBJECTIVE/.test(h)) {
      summary = sec.lines.join(" ").replace(/\*\*/g, "");
    } else if (/EXPERIENCE|EMPLOYMENT|WORK/.test(h)) {
      experience.push(...parseExperience(sec.lines));
    } else if (/EDUCATION/.test(h)) {
      education.push(...parseEducation(sec.lines));
    } else if (/SKILL|COMPETENC|TECHNICAL/.test(h)) {
      skills.push(...parseSkills(sec.lines));
    } else if (/CERTIF|LICENSE/.test(h)) {
      certifications.push(...parseCertifications(sec.lines));
    } else if (/LANGUAGE/.test(h)) {
      languages = sec.lines.join(", ").split(/[,|]/).map(s => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
    }
  }

  // Determine template suggestion based on content
  const suggestedTemplate = pickTemplate(experience, skills, certifications);
  const accentColor = "#2563EB";

  return {
    name,
    title,
    contact,
    summary,
    experience,
    education,
    skills,
    certifications,
    languages,
    suggested_template: suggestedTemplate,
    accent_color: accentColor,
  };
}

function parseContact(line: string): ResumeData["contact"] {
  const parts = line.split("|").map(s => s.trim());
  let email = "", phone = "", linkedin = "", location = "";

  for (const p of parts) {
    if (p.includes("@")) email = p;
    else if (/^\+?\d[\d\s()-]{6,}$/.test(p)) phone = p;
    else if (/linkedin/i.test(p)) linkedin = p;
    else if (p.length > 0) location = location || p;
  }

  return { email, phone, linkedin, location };
}

function parseExperience(lines: string[]): ResumeExperience[] {
  const results: ResumeExperience[] = [];
  let current: ResumeExperience | null = null;

  for (const line of lines) {
    // Role line: **Role** | Company | Date  OR  bold role with pipe separators
    const roleMatch = line.match(/^\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+)$/);
    if (roleMatch) {
      if (current) results.push(current);
      current = { role: roleMatch[1].trim(), company: roleMatch[2].trim(), date: roleMatch[3].trim(), bullets: [] };
      continue;
    }

    // Fallback: ### subheader or bold line with date pattern
    const altMatch = line.match(/^(?:\*\*)?(.+?)(?:\*\*)?\s*[-–|]\s*(.+?)\s*[-–|]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}).+)$/i);
    if (altMatch && !line.startsWith("-") && !line.startsWith("•")) {
      if (current) results.push(current);
      current = { role: altMatch[1].replace(/\*\*/g, "").trim(), company: altMatch[2].trim(), date: altMatch[3].trim(), bullets: [] };
      continue;
    }

    // Bullet point
    if ((line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) && current) {
      current.bullets.push(line.replace(/^[-•*]\s*/, "").replace(/\*\*/g, "").trim());
    }
  }

  if (current) results.push(current);
  return results;
}

function parseEducation(lines: string[]): ResumeEducation[] {
  const results: ResumeEducation[] = [];
  let current: ResumeEducation | null = null;

  for (const line of lines) {
    // **Degree** | Institution | Date
    const eduMatch = line.match(/^\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+)$/);
    if (eduMatch) {
      if (current) results.push(current);
      current = { degree: eduMatch[1].trim(), institution: eduMatch[2].trim(), date: eduMatch[3].trim(), details: [] };
      continue;
    }

    // Fallback: any non-bullet line that looks like a degree entry
    const altMatch = line.match(/^(?:\*\*)?(.+?)(?:\*\*)?\s*\|\s*(.+?)\s*\|\s*(.+)$/);
    if (altMatch && !line.startsWith("-") && !line.startsWith("•")) {
      if (current) results.push(current);
      current = { degree: altMatch[1].replace(/\*\*/g, "").trim(), institution: altMatch[2].trim(), date: altMatch[3].trim(), details: [] };
      continue;
    }

    if ((line.startsWith("-") || line.startsWith("•")) && current) {
      current.details.push(line.replace(/^[-•*]\s*/, "").replace(/\*\*/g, "").trim());
    }
  }

  if (current) results.push(current);
  return results;
}

function parseSkills(lines: string[]): ResumeSkillGroup[] {
  const results: ResumeSkillGroup[] = [];

  for (const line of lines) {
    // **Category:** skill1, skill2, skill3
    const skillMatch = line.match(/^\*\*(.+?)\*\*[:\s]+(.+)$/);
    if (skillMatch) {
      results.push({
        category: skillMatch[1].trim().replace(/:$/, ""),
        items: skillMatch[2].split(",").map(s => s.trim()).filter(Boolean),
      });
      continue;
    }

    // Category: skill1, skill2
    const plainMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (plainMatch && !line.startsWith("-") && !line.startsWith("•")) {
      results.push({
        category: plainMatch[1].replace(/\*\*/g, "").trim(),
        items: plainMatch[2].split(",").map(s => s.trim()).filter(Boolean),
      });
    }
  }

  return results;
}

function parseCertifications(lines: string[]): ResumeCertification[] {
  const results: ResumeCertification[] = [];

  for (const line of lines) {
    const clean = line.replace(/^[-•*]\s*/, "").trim();
    // Name | Issuer | Date
    const parts = clean.split("|").map(s => s.trim());
    if (parts.length >= 2) {
      results.push({
        name: parts[0].replace(/\*\*/g, ""),
        issuer: parts[1],
        date: parts[2] || "",
      });
    } else if (clean.includes("—") || clean.includes("–")) {
      const dashParts = clean.split(/[—–]/).map(s => s.trim());
      results.push({
        name: dashParts[0].replace(/\*\*/g, ""),
        issuer: dashParts[1] || "",
        date: dashParts[2] || "",
      });
    } else if (clean) {
      results.push({ name: clean.replace(/\*\*/g, ""), issuer: "", date: "" });
    }
  }

  return results;
}

function pickTemplate(
  experience: ResumeExperience[],
  skills: ResumeSkillGroup[],
  certifications: ResumeCertification[]
): "modern" | "minimal" | "executive" {
  const totalBullets = experience.reduce((sum, e) => sum + e.bullets.length, 0);
  const yearsHint = experience.length;

  if (yearsHint >= 4 || totalBullets > 15) return "executive";
  if (skills.length >= 4 || certifications.length >= 5) return "modern";
  return "minimal";
}
