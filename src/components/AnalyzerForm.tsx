"use client";

import { useState, useCallback, useRef } from "react";
import ResultsPanel from "./ResultsPanel";
import FileUpload from "./FileUpload";
import { SALARY_BENCHMARKS } from "@/data/salary-benchmarks";
import { extractProfileFromResume } from "@/lib/extract-profile";

const FIELDS = [...new Set(SALARY_BENCHMARKS.map(b => b.field))].sort();
const DEGREES = ["Bachelor's", "Diploma"];

const API_KEY_STORAGE_KEY = "sg-job-copilot-gemini-key";

function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

export default function AnalyzerForm() {
  const [resumeText, setResumeText] = useState("");
  const [resumeInputMode, setResumeInputMode] = useState<"upload" | "paste">("upload");
  const [jobDescription, setJobDescription] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [field, setField] = useState("");
  const [degree, setDegree] = useState("Bachelor's");
  const [yearsExperience, setYearsExperience] = useState("");
  const [age, setAge] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [citizenship, setCitizenship] = useState("citizen");
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoFilled, setAutoFilled] = useState<string[]>([]);
  const manualEdits = useRef<Set<string>>(new Set());

  const handleResumeText = useCallback((text: string) => {
    setResumeText(text);
    if (!text.trim()) return;

    const profile = extractProfileFromResume(text);
    const filled: string[] = [];

    if (profile.field && !manualEdits.current.has("field")) {
      setField(profile.field);
      filled.push("Field of Study");
    }
    if (profile.degree && !manualEdits.current.has("degree")) {
      setDegree(profile.degree);
      filled.push("Qualification");
    }
    if (profile.yearsExperience !== undefined && !manualEdits.current.has("yearsExperience")) {
      setYearsExperience(String(profile.yearsExperience));
      filled.push("Years of Experience");
    }
    if (profile.age !== undefined && !manualEdits.current.has("age")) {
      setAge(String(profile.age));
      filled.push("Age");
    }
    if (profile.employmentStatus && !manualEdits.current.has("employmentStatus")) {
      setEmploymentStatus(profile.employmentStatus);
      filled.push("Current Status");
    }

    setAutoFilled(filled);
  }, []);

  function markManual(fieldName: string) {
    manualEdits.current.add(fieldName);
    setAutoFilled(prev => prev.filter(f => f !== fieldName));
  }

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem(API_KEY_STORAGE_KEY, value);
      } else {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription || undefined,
          expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
          field: field || undefined,
          degree,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          age: age || undefined,
          employmentStatus: employmentStatus || undefined,
          citizenship: citizenship || "citizen",
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = "Analysis failed";
        try { msg = JSON.parse(text).error || msg; } catch { msg = `Server error (${res.status}): ${text.slice(0, 200)}`; }
        throw new Error(msg);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Key — optional, collapsed by default */}
        <details className="rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <summary className="cursor-pointer px-4 py-3 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            {apiKey
              ? "✓ Using your own Gemini API key (unlimited)"
              : "Using free shared AI — want unlimited? Add your own key"}
          </summary>
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Your Gemini API Key <span className="text-zinc-400 font-normal">(optional)</span></label>
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">Get free key →</a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={e => handleApiKeyChange(e.target.value)}
              placeholder="AIzaSy... (free from Google AI Studio)"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1.5 text-xs text-zinc-400">
              With your own key: unlimited analyses, key stored in your browser only. Without: 2 free analyses per 5 minutes.
            </p>
          </div>
        </details>

        {/* Resume Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">
              Your Resume <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setResumeInputMode("upload")}
                className={`rounded-md px-3 py-1 transition-colors ${resumeInputMode === "upload" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setResumeInputMode("paste")}
                className={`rounded-md px-3 py-1 transition-colors ${resumeInputMode === "paste" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {resumeInputMode === "upload" ? (
            <FileUpload
              label=""
              onTextExtracted={handleResumeText}
              accept=".pdf,.txt"
            />
          ) : (
            <textarea
              value={resumeText}
              onChange={e => handleResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={8}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-600"
            />
          )}

          {resumeText && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <span>&#10003;</span> {resumeText.split(/\s+/).length} words extracted
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            Your resume is parsed in your browser and never stored.
          </p>
        </div>

        {/* Job Description — optional now */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Target Job Description <span className="text-zinc-400 font-normal">(optional but recommended)</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the job description you're applying for..."
            rows={5}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Profile — visible by default now */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Your Profile <span className="text-zinc-400 font-normal">(determines which programmes you qualify for)</span></h3>
            {autoFilled.length > 0 && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                ✓ Auto-filled: {autoFilled.join(", ")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => { markManual("age"); setAge(e.target.value); }}
                placeholder="e.g. 28"
                min="16"
                max="99"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Current Status</label>
              <select
                value={employmentStatus}
                onChange={e => { markManual("employmentStatus"); setEmploymentStatus(e.target.value); }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Select...</option>
                <option value="employed">Currently employed</option>
                <option value="unemployed">Unemployed (looking)</option>
                <option value="retrenched">Retrenched / laid off</option>
                <option value="student">Student / fresh grad</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Citizenship</label>
              <select
                value={citizenship}
                onChange={e => setCitizenship(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="citizen">Singapore Citizen</option>
                <option value="pr">Permanent Resident</option>
                <option value="foreigner">Foreigner / Work Pass</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Expected Monthly Salary (SGD)</label>
              <input
                type="number"
                value={expectedSalary}
                onChange={e => setExpectedSalary(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Years of Experience</label>
              <input
                type="number"
                value={yearsExperience}
                onChange={e => { markManual("yearsExperience"); setYearsExperience(e.target.value); }}
                placeholder="e.g. 0 for fresh grad"
                min="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Field of Study</label>
              <select
                value={field}
                onChange={e => { markManual("field"); setField(e.target.value); }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Select field...</option>
                {FIELDS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Qualification</label>
              <select
                value={degree}
                onChange={e => { markManual("degree"); setDegree(e.target.value); }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {DEGREES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !resumeText.trim()}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {apiKey ? "Analyzing with Gemini..." : "Analyzing..."}
            </span>
          ) : (
            apiKey ? "Analyze My Resume with AI" : "Analyze My Resume (Data Only)"
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>

      {result && <ResultsPanel result={result} />}
    </div>
  );
}
