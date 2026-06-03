#!/bin/bash

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  exit 0
fi

npx eslint src/ --quiet 2>/dev/null
if [ $? -ne 0 ]; then
  echo '{"followup_message": "Lint errors found — skipping auto-commit. Fix lint errors then commit manually."}'
  exit 0
fi

git add -A
timestamp=$(date '+%Y-%m-%d %H:%M')
changed=$(git diff --cached --stat | tail -1)
git commit -m "auto: agent session ${timestamp}

${changed}" --no-verify 2>/dev/null

exit 0
