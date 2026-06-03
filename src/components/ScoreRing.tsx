"use client";

export default function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "text-emerald-500" :
    score >= 40 ? "text-amber-500" :
    "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8"
          fill="none" className="text-zinc-200 dark:text-zinc-800" />
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8"
          fill="none" className={color}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-zinc-500">ATS Score</span>
      </div>
    </div>
  );
}
