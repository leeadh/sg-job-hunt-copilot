"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  label: string;
  accept?: string;
}

export default function FileUpload({ onTextExtracted, label, accept = ".pdf,.txt,.doc,.docx" }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError("");
    setParsing(true);
    setFileName(file.name);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const { extractTextFromPDF } = await import("@/lib/parse-pdf");
        const text = await extractTextFromPDF(file);
        if (!text.trim()) {
          setError("Could not extract text — this PDF may be image-based. Try copy-pasting instead.");
          return;
        }
        onTextExtracted(text);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        onTextExtracted(text);
      } else {
        setError("Unsupported format. Please upload a PDF or TXT file, or paste your text directly.");
      }
    } catch (err) {
      console.error("PDF parse error:", err);
      setError(`Failed to parse file: ${err instanceof Error ? err.message : "Unknown error"}. Try copy-pasting your resume text instead.`);
    } finally {
      setParsing(false);
    }
  }, [onTextExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors
          ${dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {parsing ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <svg className="h-5 w-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Extracting text from {fileName}...
          </div>
        ) : fileName ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-500">&#10003;</span>
            <span className="font-medium">{fileName}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setFileName(null); onTextExtracted(""); }}
              className="ml-2 text-xs text-zinc-400 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="text-3xl text-zinc-300 dark:text-zinc-600">&#128196;</div>
            <p className="mt-2 text-sm text-zinc-500">
              <span className="font-medium text-blue-600 dark:text-blue-400">Upload a file</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-zinc-400">PDF or TXT (max 5MB)</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
