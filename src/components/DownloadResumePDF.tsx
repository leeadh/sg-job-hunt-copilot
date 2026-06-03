"use client";

import { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#1a1a1a",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    textAlign: "center",
  },
  contactLine: {
    fontSize: 9,
    color: "#555555",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.8,
    borderBottomColor: "#333333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 6,
    marginBottom: 1,
  },
  jobMeta: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#555555",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 10,
    marginBottom: 2,
    paddingLeft: 14,
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 3,
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
  skillsRow: {
    fontSize: 10,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#b0b0b0",
    textAlign: "center",
  },
});

function extractRevisedResume(llmAnalysis: string): string {
  // Try to extract between "## Revised Resume" and the next "## " section
  const match = llmAnalysis.match(/## Revised Resume\s*\n([\s\S]*?)(?=\n## (?!.*Resume)|$)/);
  if (match) return match[1].trim();

  // Fallback: try "## Revised" or "## Resume"
  const fallback = llmAnalysis.match(/## (?:Revised|Resume)\s*\n([\s\S]*?)(?=\n## |$)/);
  if (fallback) return fallback[1].trim();

  return llmAnalysis;
}

function isContactLine(line: string): boolean {
  const contactPatterns = /(\b\w+@\w+\.\w+|linkedin\.com|github\.com|\+65|\(\d{3}\)|\d{4}[\s-]\d{4}|singapore|sg\b)/i;
  return contactPatterns.test(line) && line.length < 200;
}

function isJobTitleLine(line: string, nextLine?: string): boolean {
  if (line.startsWith("### ") || line.startsWith("**")) {
    return true;
  }
  // Lines with dates like "Jan 2020 – Present" or "2019 - 2023"
  if (/\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(line)) {
    return true;
  }
  // Bold text with a pipe or dash separator (Company | Role format)
  if (/\*\*.*\*\*.*[|–—-]/.test(line)) {
    return true;
  }
  return false;
}

function renderTextWithBold(text: string, baseStyle: (typeof styles)[keyof typeof styles]) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  if (parts.length === 1) {
    return <Text style={baseStyle}>{text}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} style={styles.boldText}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

function parseResumeLines(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let foundName = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const rawLine = line
      .replace(/^#+\s*/, "")
      .replace(/\*\*/g, "");

    // First non-empty, non-header line is likely the name
    if (!foundName && !line.startsWith("#") && !line.startsWith("-") && !line.startsWith("*") && line.length < 60) {
      // Check if it's a name (short line, no special chars, at the start)
      if (i < 3 || line.startsWith("# ")) {
        elements.push(<Text key={i} style={styles.name}>{rawLine}</Text>);
        foundName = true;
        continue;
      }
    }

    if (line.startsWith("# ")) {
      elements.push(<Text key={i} style={styles.name}>{line.slice(2).trim()}</Text>);
      foundName = true;
      continue;
    }

    // Contact info line (email, phone, linkedin)
    if (isContactLine(line) && elements.length <= 3) {
      elements.push(<Text key={i} style={styles.contactLine}>{rawLine}</Text>);
      continue;
    }

    // Section headers: "## Education", "## Experience", etc.
    if (line.startsWith("## ")) {
      elements.push(
        <Text key={i} style={styles.sectionHeader}>{line.slice(3).trim()}</Text>
      );
      continue;
    }

    // Sub-headers / Job titles: "### Role at Company" or "**Role** at Company"
    if (line.startsWith("### ")) {
      elements.push(
        <Text key={i} style={styles.jobTitle}>{line.slice(4).trim().replace(/\*\*/g, "")}</Text>
      );
      continue;
    }

    // Lines with dates or bold company/role names
    if (isJobTitleLine(line)) {
      if (/\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(line) && !line.startsWith("**")) {
        elements.push(<Text key={i} style={styles.jobMeta}>{rawLine}</Text>);
      } else {
        elements.push(<Text key={i} style={styles.jobTitle}>{rawLine}</Text>);
      }
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const content = line.replace(/^[-*•]\s*/, "");
      elements.push(
        <View key={i}>
          {renderTextWithBold(`•  ${content}`, styles.bullet)}
        </View>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <View key={i}>
        {renderTextWithBold(line, styles.paragraph)}
      </View>
    );
  }

  return elements;
}

function ResumeDocument({ content }: { content: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>{parseResumeLines(content)}</View>
        <Text style={styles.footer}>
          Generated by SG Job Hunt Copilot
        </Text>
      </Page>
    </Document>
  );
}

export default function DownloadResumePDF({ llmAnalysis }: { llmAnalysis: string }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const resumeContent = extractRevisedResume(llmAnalysis);
      const blob = await pdf(<ResumeDocument content={resumeContent} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "revised-resume.pdf";
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
          Download Revised Resume as PDF
        </>
      )}
    </button>
  );
}
