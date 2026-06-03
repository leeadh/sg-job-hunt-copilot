# SG Job Hunt Copilot

Free AI-powered resume analysis tool built specifically for Singapore jobseekers. Combines Gemini AI with real Singapore data (MOM salaries, government programmes, MyCareersFuture jobs) to give advice that generic LLMs can't.

## The Problem

Singapore's job market is brutal. Fresh grads send 400+ applications and get ghosted. 60% of workers say job hunting got harder this year. The common advice — "just paste your resume into ChatGPT" — misses the actual gaps:

- **Salary expectations are off** → LLMs hallucinate Singapore salary data
- **Missing keywords** → generic AI reviews don't simulate real ATS parsing
- **Government support exists** → but nobody knows about WSG, TeSA, CCP, SFJS
- **Advice is generic** → ChatGPT doesn't know if you qualify for Mid-Career Subsidy at 42 or SFJS if retrenched
- **No job suggestions** → LLMs can't search live job portals for you

## What This Does (That ChatGPT Can't)

| Feature | How it works | Why an LLM can't |
|---|---|---|
| **AI Resume Rewrite** | Gemini 2.5 Flash-Lite rewrites your full resume with Singapore context baked in | Uses real MOM salary data + programme eligibility in its prompt, not hallucinations |
| **Interview Prep** | Generates 5-10 interview questions tailored to your resume gaps vs the JD | Questions target your specific weaknesses — e.g. "You lack AWS experience but the JD requires it" |
| **LinkedIn Optimizer** | Generates a recruiter-optimized LinkedIn headline + summary from your resume | Knows SG recruiter search patterns and your actual skill stack |
| **Live Job Matching** | Gemini suggests job titles → searches MyCareersFuture API → shows real listings with salaries | Real-time API search with AI-suggested queries, not training data |
| **Auto Profile Extraction** | Uploads your resume and auto-fills age, experience, field, qualification, and employment status | Infers from graduation year, work history dates, and degree type |
| **ATS Keyword Match** | Extracts skills from your resume and the JD, shows match score with specific missing keywords | Real keyword extraction with n-gram matching, not LLM guessing |
| **Salary Benchmarking** | Compares your expected salary against MOM Graduate Employment Survey data by field + degree | Uses actual published data with p25/median/p75 ranges |
| **Smart Programme Matching** | Checks your age, citizenship, employment status, and income against real eligibility rules | Cross-references 9 programmes with specific criteria — shows only what you actually qualify for |
| **Downloadable Revised Resume** | One-click PDF download of the AI-rewritten resume in A4 format | Professional formatting with proper sections, ready to send |
| **PDF Resume Upload** | Drag-and-drop PDF parsing in the browser — no copy-paste needed | Client-side extraction, nothing leaves your browser |

## What's Been Built

### Done

- [x] **Next.js 16 app** with TypeScript and Tailwind CSS
- [x] **Landing page** with hero section, feature cards, and privacy notice
- [x] **PDF resume upload** — drag-and-drop or click to upload, client-side parsing via `pdfjs-dist`
- [x] **Paste text fallback** — toggle between upload and paste modes
- [x] **Auto profile extraction** — uploads resume and auto-fills age (from graduation year), years of experience (from work history), field of study, qualification (Bachelor's/Diploma), and employment status (employed/unemployed/student) — all editable
- [x] **Gemini 2.5 Flash-Lite integration** — AI-powered resume analysis with structured output (Key Issues, Salary & Programmes, Revised Resume, Next Steps)
- [x] **AI-powered job suggestions** — Gemini suggests 3 job titles based on your resume, then searches MyCareersFuture for real listings
- [x] **Live job listings** — shows matching jobs from MyCareersFuture with salary ranges, company names, skills, posting dates, and direct apply links
- [x] **Interview prep generator** — Gemini generates 5-10 interview questions specific to the candidate's resume gaps vs the JD, with coaching tips for weak areas
- [x] **LinkedIn headline + summary optimizer** — generates a recruiter-optimized LinkedIn headline and About section based on the resume
- [x] **Downloadable revised resume PDF** — `@react-pdf/renderer` generates a professional A4 PDF from the AI rewrite
- [x] **Free public AI service** — server-side Gemini API key powers all users; optional BYOK (Bring Your Own Key) for unlimited usage
- [x] **ATS keyword analyzer** — extracts skills using dictionary lookup + n-gram matching across 100+ skill terms
- [x] **ATS score ring** — animated SVG visualization with color-coded score (red/amber/green)
- [x] **Matched vs missing keyword pills** — green for matched, red for missing from resume
- [x] **Format issue detection** — checks for ATS-breaking characters, resume length, missing sections
- [x] **MOM salary benchmarking** — 34 fields across Bachelor's and Diploma, with p25/median/p75
- [x] **Salary percentile visualizer** — shows where your expected salary sits on the distribution
- [x] **Smart government programme matcher** — 9 programmes with real eligibility functions that check age, citizenship, employment status, income, and target role
- [x] **Personalized programme reasons** — each matched programme shows *why* you qualify with specific numbers
- [x] **Profile inputs** — age, employment status (employed/unemployed/retrenched/student), citizenship (SC/PR/foreigner), expected salary, years of experience, field, and qualification
- [x] **MyCareersFuture API integration** — `/api/jobs` endpoint querying `api.mycareersfuture.gov.sg/v2/jobs`
- [x] **Salary lookup API** — `/api/salary` endpoint to query benchmarks by field
- [x] **Input validation + sanitization** — max 15K resume / 5K JD, prompt injection detection (14 patterns), content wrapped in XML delimiters
- [x] **Hardened Gemini prompt** — anti-injection rules in system prompt, `safetySettings` with `BLOCK_MEDIUM_AND_ABOVE` for dangerous content/harassment/hate speech
- [x] **Output safety filter** — scans LLM output for `<script>`, `javascript:`, and other XSS patterns before rendering
- [x] **Tiered rate limiting** — shared key: 5 analyses/5 min per IP; own key: 5/min; `429` + `Retry-After` headers
- [x] **MCF response caching** — 5-minute TTL cache to reduce redundant API calls under load
- [x] **Gemini timeout** — 30-second timeout on all LLM calls to prevent hanging serverless functions
- [x] **Graceful degradation** — if Gemini is rate-limited or down, returns data-only results (ATS, salary, programmes, keyword-based jobs) with a message
- [x] **Tabbed results layout** — Resume Analysis, Interview Prep, LinkedIn, Jobs, Salary & ATS, and Programmes organized in tabs to reduce scrolling
- [x] **Privacy-first design** — no accounts, no storage, no tracking, no third-party analytics

### Roadmap

- [ ] Networking suggestions (LinkedIn alumni finder)
- [ ] Multilingual support (Mandarin, Malay, Tamil)
- [ ] Mobile PWA for on-the-go use

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Next.js App                          │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │  Landing   │  │  Analyzer  │  │   Results Panel  │   │
│  │   Page     │  │   Form     │  │  ├─ AI Analysis  │   │
│  └────────────┘  └─────┬──────┘  │  ├─ Job Listings │   │
│                        │         │  ├─ Salary Bench  │   │
│  ┌─────────────┐       │         │  ├─ ATS Score     │   │
│  │ FileUpload  │───────┤         │  └─ Programmes    │   │
│  │ (PDF parse) │       │         └────────┬──────────┘   │
│  └─────────────┘       │                  │              │
│  ┌─────────────┐       │         ┌────────┴──────────┐   │
│  │ Extract     │───────┤         │ DownloadResumePDF │   │
│  │ Profile     │       │         │ (@react-pdf)      │   │
│  └─────────────┘       │         └───────────────────┘   │
│                        │                                  │
│              ┌─────────▼──────────────────────────────┐  │
│              │            API Routes                  │  │
│              │                                        │  │
│              │  /api/analyze                          │  │
│              │    ├─ Tiered rate limiter               │  │
│              │    ├─ Input validation + sanitization   │  │
│              │    ├─ ATS keyword matcher               │  │
│              │    ├─ Salary benchmarker                │  │
│              │    ├─ Programme eligibility checker     │  │
│              │    ├─ Gemini AI analysis                │  │
│              │    ├─ Gemini interview prep             │  │
│              │    ├─ Gemini LinkedIn optimizer          │  │
│              │    ├─ Gemini job title suggestions      │  │
│              │    ├─ MyCareersFuture job search (cached)│  │
│              │    └─ Output safety filter              │  │
│              │                                        │  │
│              │  /api/salary                            │  │
│              │    └─ MOM GES data lookup               │  │
│              └────────────────────────────────────────┘  │
│                          │                │               │
│  ┌───────────────────────▼────┐  ┌───────▼────────────┐  │
│  │      Data + Intelligence  │  │   External APIs    │  │
│  │  salary-benchmarks.ts     │  │  MyCareersFuture   │  │
│  │  government-programmes.ts │  │   /v2/jobs         │  │
│  │  gemini.ts                │  │  Google Gemini     │  │
│  │  ats-analyzer.ts          │  │   2.5 Flash-Lite   │  │
│  │  extract-profile.ts       │  └────────────────────┘  │
│  │  sanitize.ts              │                           │
│  │  output-filter.ts         │                           │
│  │  rate-limit.ts            │                           │
│  └───────────────────────────┘                           │
└──────────────────────────────────────────────────────────┘
```

## Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/sg-job-hunt-copilot.git
cd sg-job-hunt-copilot
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Setup

Copy `.env.example` to `.env.local` and add your Gemini API key:

```bash
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

Without the env variable, users can still use the app by entering their own API key in the form.

## Deploy for Free

### Option 1: Vercel (Recommended — $0)

```bash
npm i -g vercel
vercel

# Set the API key securely (never stored in code)
vercel env add GEMINI_API_KEY production
# Paste your key when prompted

# Redeploy to pick up the env variable
vercel --prod
```

Free tier includes:
- 100GB bandwidth/month
- Serverless functions (API routes)
- Automatic HTTPS
- Global CDN

> **Important:** After deploying, go to Vercel Dashboard → Settings → Deployment Protection and set it to **"Only Preview Deployments"** so the public can access your production URL without logging in.

### Option 2: Cloudflare Pages ($0)

```bash
npm run build
npx wrangler pages deploy .next
```

### Option 3: AWS (if you want to stay on AWS)

**Cheapest AWS setup (~$0-5/month):**

| Service | Purpose | Cost |
|---|---|---|
| **AWS Amplify Hosting** | Static + SSR hosting | Free tier: 1000 build mins, 15GB served/month |
| **or S3 + CloudFront** | Static export | ~$0.50/month at low traffic |

```bash
# AWS Amplify (easiest)
npm i -g @aws-amplify/cli
amplify init
amplify push

# Or static export to S3
# Add to next.config.ts: output: 'export'
npm run build
aws s3 sync out/ s3://your-bucket --delete
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts       # Main endpoint: ATS + salary + programmes + Gemini + job search
│   │   ├── jobs/route.ts          # Standalone MyCareersFuture API proxy
│   │   └── salary/route.ts        # Salary benchmark lookup
│   ├── layout.tsx
│   ├── page.tsx                   # Landing page
│   └── globals.css
├── components/
│   ├── AnalyzerForm.tsx           # Form with upload/paste toggle + auto-filled profile inputs
│   ├── DownloadResumePDF.tsx      # PDF generation for revised resume (@react-pdf/renderer)
│   ├── FileUpload.tsx             # Drag-and-drop PDF/TXT upload
│   ├── ResultsPanel.tsx           # Results: AI analysis, jobs, salary, ATS, programmes
│   └── ScoreRing.tsx              # Animated ATS score ring (SVG)
├── data/
│   ├── salary-benchmarks.ts       # MOM GES data — 34 fields, Bachelor's + Diploma
│   └── government-programmes.ts   # 9 programmes with match() eligibility functions
└── lib/
    ├── ats-analyzer.ts            # ATS keyword extraction engine (dictionary + n-grams)
    ├── extract-profile.ts         # Auto-extract age, experience, field, status from resume text
    ├── gemini.ts                  # Gemini 2.5 Flash-Lite: analysis, interview prep, LinkedIn, job titles
    ├── job-search.ts              # MyCareersFuture API client with 5-min TTL cache
    ├── output-filter.ts           # LLM output safety filter (XSS, injection detection)
    ├── parse-pdf.ts               # Client-side PDF text extraction (pdfjs-dist)
    ├── rate-limit.ts              # Tiered rate limiter (shared key: 5/5min, own key: 5/min)
    └── sanitize.ts                # Input validation, length limits, prompt injection detection
```

## Data Sources

| Data | Source | Update Frequency |
|---|---|---|
| Graduate salaries | MOM Graduate Employment Survey via NUS/NTU/SMU/SUTD/SIT | Annual (update when new GES published) |
| Job listings | MyCareersFuture API (`api.mycareersfuture.gov.sg/v2/jobs`) | Real-time |
| Government programmes | WSG, SSG, IMDA, CPF Board official pages | Manual (check quarterly) |

## Programme Eligibility Logic

Each programme has a `match()` function that checks your profile:

| Programme | Key Criteria |
|---|---|
| **CCP — Tech** | SC/PR, 2+ years experience, targeting a different role |
| **Mid-Career Enhanced Subsidy** | SC only, aged 40+ |
| **SkillsFuture Credit** | SC only, aged 25+ |
| **SFJS** | SC/PR, involuntarily unemployed, previous income ≤ $5k |
| **TeSA** | SC/PR, targeting ICT/tech roles |
| **WIS** | SC only, aged 30+, income $500–$3,000/month |
| **WSG Career Matching** | SC/PR, active jobseeker |
| **NTUC e2i** | SC/PR, active jobseeker |
| **MyCareersFuture** | Open to all |

Programmes that don't match your profile are hidden entirely — no generic lists.

## How Job Matching Works

1. You upload your resume
2. Gemini analyzes it and suggests 3 specific job titles tailored to your skills
3. Each title is searched against the MyCareersFuture API (`/v2/jobs`)
4. Results show real listings with salary ranges, company names, skills, and direct apply links
5. The server-side Gemini key powers all users by default; optional BYOK for unlimited usage

## Security

- **API key is server-side only** — stored as an encrypted environment variable in Vercel, never in source code or client-side JavaScript. Not visible in browser DevTools, network requests, or page source.
- **Tiered rate limiting** — prevents abuse of the shared API key (5 analyses per 5 minutes per IP)
- **Input sanitization** — 14 prompt injection patterns detected and blocked before reaching the LLM
- **Hardened system prompt** — explicit anti-injection rules prevent prompt leaking or misuse
- **Output filtering** — LLM responses scanned for XSS patterns (`<script>`, `javascript:`, etc.) before rendering
- **Safety settings** — Gemini configured with `BLOCK_MEDIUM_AND_ABOVE` for dangerous content, harassment, and hate speech

## Privacy

- No data is stored or logged
- No user accounts
- No analytics/tracking
- PDF parsing happens client-side (in your browser) — the file is never uploaded
- Server-side API key is encrypted in Vercel's environment — never in source code
- Optional user API key is stored in browser localStorage only — never sent to our server
- Resume text is sent to Google's Gemini API for analysis, then immediately discarded
- Open source — audit the code yourself

## Contributing

PRs welcome. The most impactful contributions:
1. **Updated salary data** — when new GES is published
2. **New government programmes** — add to `government-programmes.ts` with a `match()` function
3. **Better ATS patterns** — improve keyword extraction in `ats-analyzer.ts`

## License

MIT
