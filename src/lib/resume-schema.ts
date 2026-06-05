export interface ResumeExperience {
  role: string;
  company: string;
  date: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  date: string;
  details: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeSkillGroup {
  category: string;
  items: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkillGroup[];
  certifications: ResumeCertification[];
  languages: string[];
  suggested_template: "modern" | "minimal" | "executive";
  accent_color: string;
}

/**
 * JSON Schema for Gemini's responseSchema parameter.
 * Gemini uses a subset of OpenAPI 3.0 Schema (not full JSON Schema).
 */
export const RESUME_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    name: { type: "string" as const, description: "Full name of the candidate" },
    title: { type: "string" as const, description: "Professional title or tagline (e.g. 'Senior Product Manager')" },
    contact: {
      type: "object" as const,
      properties: {
        phone: { type: "string" as const },
        email: { type: "string" as const },
        linkedin: { type: "string" as const },
        location: { type: "string" as const },
      },
      required: ["phone", "email", "linkedin", "location"] as const,
    },
    summary: { type: "string" as const, description: "Professional summary paragraph (3-5 sentences)" },
    experience: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          role: { type: "string" as const },
          company: { type: "string" as const },
          date: { type: "string" as const, description: "e.g. 'Jan 2020 - Present'" },
          bullets: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["role", "company", "date", "bullets"] as const,
      },
    },
    education: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          institution: { type: "string" as const },
          degree: { type: "string" as const },
          date: { type: "string" as const },
          details: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["institution", "degree", "date", "details"] as const,
      },
    },
    skills: {
      type: "array" as const,
      description: "Skills grouped by category.",
      items: {
        type: "object" as const,
        properties: {
          category: { type: "string" as const, description: "Category name (e.g. 'Programming Languages', 'Tools & Platforms')" },
          items: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["category", "items"] as const,
      },
    },
    certifications: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          issuer: { type: "string" as const },
          date: { type: "string" as const },
        },
        required: ["name", "issuer", "date"] as const,
      },
    },
    languages: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    suggested_template: {
      type: "string" as const,
      enum: ["modern", "minimal", "executive"],
      description: "Pick the best template: 'modern' for tech/creative mid-career, 'minimal' for clean/junior, 'executive' for senior/corporate",
    },
    accent_color: {
      type: "string" as const,
      description: "Hex color code for accent elements (e.g. '#2563EB'). Choose based on industry: blue for corporate/tech, teal for healthcare, dark grey for finance.",
    },
  },
  required: [
    "name", "title", "contact", "summary", "experience",
    "education", "skills", "certifications", "languages",
    "suggested_template", "accent_color",
  ] as const,
};
