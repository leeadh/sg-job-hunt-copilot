"use client";

import { ResumeData } from "@/lib/resume-schema";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";

export type TemplateName = "modern" | "minimal" | "executive";

export const TEMPLATE_OPTIONS: { id: TemplateName; label: string; description: string }[] = [
  { id: "modern", label: "Modern", description: "Two-column layout with accent sidebar" },
  { id: "minimal", label: "Minimal", description: "Clean single-column, lots of whitespace" },
  { id: "executive", label: "Executive", description: "Formal serif typography for senior roles" },
];

export function ResumeTemplate({ data, template }: { data: ResumeData; template?: TemplateName }) {
  const selected = template || data.suggested_template || "modern";

  switch (selected) {
    case "minimal":
      return <MinimalTemplate data={data} />;
    case "executive":
      return <ExecutiveTemplate data={data} />;
    case "modern":
    default:
      return <ModernTemplate data={data} />;
  }
}
