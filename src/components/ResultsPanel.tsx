"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ScoreRing from "./ScoreRing";

const DownloadResumePDF = dynamic(() => import("./DownloadResumePDF"), { ssr: false });

interface Programme {
  name: string;
  agency: string;
  description: string;
  benefit: string;
  url: string;
}

interface ProgrammeMatch {
  programme: Programme;
  reason: string;
}

interface SalaryInsight {
  benchmark: {
    field: string;
    degree: string;
    medianSalary: number;
    p25Salary: number;
    p75Salary: number;
    source: string;
  };
  percentile: string;
  expectedSalary: number;
  isAboveMedian: boolean;
  advice: string;
}

interface JobListing {
  title: string;
  company: string;
  salaryMin: number | null;
  salaryMax: number | null;
  postingDate: string | null;
  skills: string[];
  url: string;
  employmentType: string;
}

interface JobSearchResult {
  query: string;
  totalCount: number;
  jobs: JobListing[];
  searchUrl: string;
}

interface LinkedInResult {
  headline: string;
  summary: string;
}

interface AnalysisResult {
  ats: {
    overallScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    formatIssues: string[];
    suggestions: string[];
  } | null;
  salary: SalaryInsight | null;
  programmes: ProgrammeMatch[];
  llmAnalysis: string | null;
  jobs: JobSearchResult[] | null;
  interviewPrep: string | null;
  linkedIn: LinkedInResult | null;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="mt-5 mb-2 text-lg font-semibold">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="mt-4 mb-1 text-base font-semibold">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.slice(2);
      elements.push(
        <li key={i} className="ml-4 text-sm text-zinc-700 dark:text-zinc-300 list-disc">
          <span dangerouslySetInnerHTML={{
            __html: content
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.+?)`/g, '<code class="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">$1</code>')
              .replace(/→/g, '→')
          }} />
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <span dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.+?)`/g, '<code class="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">$1</code>')
              .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-700 dark:text-blue-400">$1</a>')
          }} />
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function formatSalary(min: number | null, max: number | null): string {
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  if (max) return `Up to $${max.toLocaleString()}`;
  return "Salary not listed";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const posted = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

interface ParsedQuestion {
  number: number;
  question: string;
  tip: string;
  isGapBased: boolean;
}

function parseInterviewQuestions(content: string): ParsedQuestion[] {
  const lines = content.split("\n");
  const questions: ParsedQuestion[] = [];
  let currentQ: Partial<ParsedQuestion> | null = null;
  let tipLines: string[] = [];

  for (const line of lines) {
    const numMatch = line.match(/^\s*(\d+)\.\s*\*?\*?(.+?)\*?\*?\s*$/);
    if (numMatch) {
      if (currentQ?.question) {
        questions.push({
          number: currentQ.number!,
          question: currentQ.question,
          tip: tipLines.join(" ").trim(),
          isGapBased: /gap|missing|lack|don't have|no evidence|weak/i.test(currentQ.question + tipLines.join(" ")),
        });
      }
      currentQ = { number: parseInt(numMatch[1]), question: numMatch[2].replace(/\*\*/g, "").trim() };
      tipLines = [];
    } else if (currentQ) {
      const cleaned = line.replace(/^\s*[-*>]\s*/, "").trim();
      if (cleaned) tipLines.push(cleaned);
    }
  }

  if (currentQ?.question) {
    questions.push({
      number: currentQ.number!,
      question: currentQ.question,
      tip: tipLines.join(" ").trim(),
      isGapBased: /gap|missing|lack|don't have|no evidence|weak/i.test(currentQ.question + tipLines.join(" ")),
    });
  }

  return questions;
}

function QuestionCard({ q }: { q: ParsedQuestion }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
      >
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${q.isGapBased ? "bg-red-500" : "bg-amber-500"}`}>
          {q.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium pr-6">{q.question}</p>
          {q.isGapBased && (
            <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
              Targets a gap in your resume
            </span>
          )}
        </div>
        <svg className={`mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && q.tip && (
        <div className="border-t border-zinc-100 bg-amber-50/30 px-4 py-3 dark:border-zinc-800 dark:bg-amber-950/10">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Coaching tip</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: q.tip
                .replace(/\*(.+?)\*/g, "<em>$1</em>")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            }}
          />
        </div>
      )}
    </div>
  );
}

function InterviewPrepSection({ content }: { content: string }) {
  const questions = parseInterviewQuestions(content);
  const gapCount = questions.filter(q => q.isGapBased).length;

  if (questions.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">Q</div>
          <h2 className="text-lg font-semibold">Interview Prep</h2>
        </div>
        {renderMarkdown(content)}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">Q</div>
        <h2 className="text-lg font-semibold">Interview Prep</h2>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          {questions.length} questions
        </span>
      </div>
      <p className="mb-4 text-xs text-zinc-500">
        {gapCount > 0 ? `${gapCount} questions target gaps between your resume and the JD. ` : ""}
        Click a question to see the coaching tip.
      </p>
      <div className="space-y-2">
        {questions.map((q) => (
          <QuestionCard key={q.number} q={q} />
        ))}
      </div>
    </section>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="shrink-0 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

const TABS = [
  { id: "analysis", label: "Resume Analysis", icon: "AI" },
  { id: "interview", label: "Interview Prep", icon: "Q" },
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "jobs", label: "Jobs", icon: "▶" },
  { id: "data", label: "Salary & ATS", icon: "$" },
  { id: "support", label: "Programmes", icon: "★" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function ResultsPanel({ result }: { result: AnalysisResult }) {
  const { ats, salary, programmes, llmAnalysis, jobs, interviewPrep, linkedIn } = result;

  const availableTabs = TABS.filter(t => {
    if (t.id === "analysis") return !!llmAnalysis;
    if (t.id === "interview") return !!interviewPrep;
    if (t.id === "linkedin") return !!linkedIn;
    if (t.id === "jobs") return jobs && jobs.length > 0;
    if (t.id === "data") return !!salary || !!ats;
    if (t.id === "support") return programmes.length > 0;
    return false;
  });

  const [activeTab, setActiveTab] = useState<TabId>(availableTabs[0]?.id || "analysis");

  if (!llmAnalysis && availableTabs.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-500">
          Add your free Gemini API key above to get AI-powered resume feedback with Singapore salary data and government programme recommendations baked in.
        </p>
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Get a free API key from Google AI Studio →
        </a>
      </section>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Tab bar */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white ${
              activeTab === tab.id
                ? tab.id === "analysis" ? "bg-blue-600"
                  : tab.id === "interview" ? "bg-amber-600"
                  : tab.id === "linkedin" ? "bg-blue-700"
                  : tab.id === "jobs" ? "bg-emerald-600"
                  : tab.id === "data" ? "bg-violet-600"
                  : "bg-zinc-600"
                : "bg-zinc-400 dark:bg-zinc-600"
            }`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">

        {/* Resume Analysis */}
        {activeTab === "analysis" && llmAnalysis && (
          <section className="rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">AI</div>
              <h2 className="text-lg font-semibold">Resume Analysis</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                Powered by Gemini + SG Data
              </span>
            </div>
            {renderMarkdown(llmAnalysis)}
            {llmAnalysis.includes("## Revised Resume") && (
              <div className="mt-5 flex items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <DownloadResumePDF llmAnalysis={llmAnalysis} />
                <span className="text-xs text-zinc-400">A4 format, ready to send</span>
              </div>
            )}
          </section>
        )}

        {/* Interview Prep */}
        {activeTab === "interview" && interviewPrep && (
          <InterviewPrepSection content={interviewPrep} />
        )}

        {/* LinkedIn Optimizer */}
        {activeTab === "linkedin" && linkedIn && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-[10px] font-bold text-white">in</div>
              <h2 className="text-lg font-semibold">LinkedIn Optimizer</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-medium text-zinc-500">Headline</h3>
                  <CopyButton text={linkedIn.headline} label="Copy" />
                </div>
                <p className="text-base font-semibold">{linkedIn.headline}</p>
              </div>
              <div className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-medium text-zinc-500">About / Summary</h3>
                  <CopyButton text={linkedIn.summary} label="Copy" />
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{linkedIn.summary}</p>
              </div>
            </div>
          </section>
        )}

        {/* Jobs */}
        {activeTab === "jobs" && jobs && jobs.length > 0 && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Jobs You Could Apply For</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                Live from MyCareersFuture
              </span>
            </div>
            <p className="mb-4 text-xs text-zinc-500">Real listings matched to your resume — with salary ranges shown.</p>
            {jobs.map((group) => (
              <div key={group.query} className="mb-5 last:mb-0">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    &ldquo;{group.query}&rdquo;
                    <span className="ml-2 text-xs font-normal text-zinc-400">{group.totalCount.toLocaleString()} jobs found</span>
                  </h3>
                  <a href={group.searchUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">See all →</a>
                </div>
                <div className="space-y-2">
                  {group.jobs.map((job, i) => (
                    <a key={`${group.query}-${i}`} href={job.url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-lg border border-zinc-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/30 dark:border-zinc-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium truncate">{job.title}</h4>
                          <p className="text-xs text-zinc-500 truncate">{job.company}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                          {job.postingDate && <p className="text-[10px] text-zinc-400">{timeAgo(job.postingDate)}</p>}
                        </div>
                      </div>
                      {job.skills.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {job.skills.map(s => (
                            <span key={s} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{s}</span>
                          ))}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Salary & ATS */}
        {activeTab === "data" && (
          <div className="space-y-6">
            {salary && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-3 text-lg font-semibold">Salary Benchmark (MOM Data)</h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{salary.advice}</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-zinc-500">25th %ile</div>
                    <div className="text-lg font-semibold">${salary.benchmark.p25Salary.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
                    <div className="text-xs text-zinc-500">Median</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">${salary.benchmark.medianSalary.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">75th %ile</div>
                    <div className="text-lg font-semibold">${salary.benchmark.p75Salary.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-3 relative h-3 rounded-full bg-zinc-200 dark:bg-zinc-700">
                  {(() => {
                    const min = salary.benchmark.p25Salary * 0.8;
                    const max = salary.benchmark.p75Salary * 1.2;
                    const pos = Math.min(Math.max(((salary.expectedSalary - min) / (max - min)) * 100, 2), 98);
                    return (
                      <div className="absolute -top-1 h-5 w-5 rounded-full border-2 border-white bg-blue-600 shadow dark:border-zinc-900"
                        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                        title={`Your ask: $${salary.expectedSalary.toLocaleString()}`} />
                    );
                  })()}
                </div>
                <p className="mt-1 text-right text-xs text-zinc-400">Source: {salary.benchmark.source}</p>
              </section>
            )}
            {ats && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-lg font-semibold">ATS Keyword Match</h2>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <ScoreRing score={ats.overallScore} />
                  <div className="flex-1 space-y-4">
                    {ats.matchedKeywords.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Matched Keywords</h3>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {ats.matchedKeywords.map(k => (
                            <span key={k} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {ats.missingKeywords.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Missing from Your Resume</h3>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {ats.missingKeywords.map(k => (
                            <span key={k} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Government Programmes */}
        {activeTab === "support" && programmes.length > 0 && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1 text-lg font-semibold">Government Support You Qualify For</h2>
            <p className="mb-4 text-xs text-zinc-500">Based on your age, status, income, and target role — not generic suggestions.</p>
            <div className="space-y-4">
              {programmes.map(({ programme: p, reason }) => (
                <div key={p.name} className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm">{p.name}</h3>
                      <p className="text-xs text-zinc-500">{p.agency}</p>
                    </div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900">
                      Learn more
                    </a>
                  </div>
                  <p className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-400">{reason}</p>
                  <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{p.benefit}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
