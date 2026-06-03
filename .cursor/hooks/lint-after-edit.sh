#!/bin/bash
input=$(cat)
file=$(echo "$input" | python3 -c "import sys,json; print(json.load(sys.stdin).get('path',''))" 2>/dev/null)

if [[ "$file" == *.ts || "$file" == *.tsx ]]; then
  errors=$(npx eslint --no-warn-ignored "$file" 2>&1)
  exit_code=$?
  
  if [ $exit_code -ne 0 ]; then
    escaped=$(echo "$errors" | head -20 | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null)
    echo "{\"additional_context\": \"Lint errors found in ${file}:\\n${escaped}\"}"
    exit 0
  fi
fi

echo '{}'
exit 0
