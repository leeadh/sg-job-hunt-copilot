import AnalyzerForm from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">SG</div>
            <span className="text-lg font-semibold tracking-tight">Job Hunt Copilot</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Open Source
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stop guessing. <span className="text-blue-600">Know</span>{" "}why you&apos;re not getting callbacks.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400">
            Free resume analysis built for Singapore — ATS keyword matching, salary benchmarks from MOM data,
            and government programmes you may not know about.
          </p>
        </div>

        {/* What makes this different */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-2xl">&#128202;</div>
            <h3 className="text-sm font-semibold">Real Salary Data</h3>
            <p className="mt-1 text-xs text-zinc-500">
              MOM Graduate Employment Survey data. Not LLM guesses.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-2xl">&#128270;</div>
            <h3 className="text-sm font-semibold">ATS Simulation</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Keyword extraction like real Applicant Tracking Systems use.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-2xl">&#127480;&#127468;</div>
            <h3 className="text-sm font-semibold">SG Programmes</h3>
            <p className="mt-1 text-xs text-zinc-500">
              WSG, SkillsFuture, TeSA — matched to your profile automatically.
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center text-xs text-zinc-600 dark:border-blue-900 dark:bg-blue-950/30 dark:text-zinc-400">
          <strong>Privacy:</strong> Your PDF is parsed in your browser — never uploaded.
          Resume text is sent to Google Gemini for AI analysis and immediately discarded.
          No data is stored, no account required.{" "}
          <a href="https://github.com" className="underline hover:text-blue-600">Open-source</a> — audit the code yourself.
        </div>

        {/* Analyzer Form */}
        <AnalyzerForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-6 py-6 text-center text-xs text-zinc-400">
          <p>
            Built for Singapore jobseekers. Salary data sourced from MOM & university graduate employment surveys.
          </p>
          <p className="mt-1">
            Not affiliated with any government agency. Job listings via{" "}
            <a href="https://www.mycareersfuture.gov.sg" className="underline hover:text-zinc-600" target="_blank" rel="noopener noreferrer">
              MyCareersFuture
            </a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
