# Changelog

All notable changes to SG Job Hunt Copilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- MOM Occupational Wages API integration (562 occupations, all experience levels) for mid-career salary benchmarks
- MOM Wages by Age dataset for peer-group salary comparison when user age is known
- Current date injection into Gemini prompt for accurate temporal reasoning

### Changed
- Privacy notice moved above form and accurately discloses Google Gemini API usage
- Salary benchmark routing: GES for 0-3 years experience, MOM Occupational Wages for 4+ years
- Resume rewrite prompt now prohibits fabricating metrics not present in the original resume
- CCP eligibility now correctly documents SC + age 40+ requirement for enhanced 90% salary support tier

### Fixed
- Years of experience extraction no longer counts education/certification years (uses work date ranges only)
- Age estimation uses graduation year heuristic instead of naive earliest-year-in-resume approach
- CCP programme matching no longer recommends enhanced tier to PRs or users under 40
- Gemini no longer flags 2025/2026 dates as "in the future"
- Resume rewrite no longer invents quantified achievements without source data

## [0.1.0] - 2026-06-01

### Added
- Resume analysis with ATS keyword match scoring
- Salary benchmarks from NTU/NUS Graduate Employment Survey 2024 (data.gov.sg)
- Government programme matching (WSG, TeSA, SkillsFuture, CCP, SFJS, WIS, e2i)
- Job search via MyCareersFuture API
- Interview prep generation for skill gaps
- LinkedIn profile optimizer
- PDF parsing (client-side, browser only)
- Cursor hooks: block dangerous shell commands, ESLint after edit, auto-commit on clean code
- Cursor rules: security, linting, testing, data-gov-sg conventions
