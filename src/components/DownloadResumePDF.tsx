"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/resume-schema";
import { ResumeTemplate, TemplateName, TEMPLATE_OPTIONS } from "./resume-templates";

interface DownloadResumePDFProps {
  structuredResume: ResumeData | null;
  llmAnalysis?: string;
}

export default function DownloadResumePDF({ structuredResume, llmAnalysis }: DownloadResumePDFProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName | undefined>(undefined);

  if (!structuredResume) {
    if (!llmAnalysis) return null;
    return (
      <p className="text-xs text-zinc-400 italic">
        PDF generation unavailable — structured data not returned.
      </p>
    );
  }

  const activeTemplate = selectedTemplate || structuredResume.suggested_template || "modern";

  async function handleDownload() {
    if (!structuredResume) return;
    setGenerating(true);
    try {
      const doc = <ResumeTemplate data={structuredResume} template={activeTemplate} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${structuredResume.name.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Try copying the text instead.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Template Picker */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500">Template:</label>
        <div className="flex gap-1">
          {TEMPLATE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedTemplate(opt.id)}
              title={opt.description}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTemplate === opt.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {generating ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Resume as PDF
          </>
        )}
      </button>
    </div>
  );
}
