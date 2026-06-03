#!/bin/bash
input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null)

if echo "$command" | grep -qiE 'push\s+--force|push\s+-f|reset\s+--hard|rm\s+-rf\s+/'; then
  echo '{
    "permission": "deny",
    "user_message": "Blocked a destructive command. Review it manually if needed.",
    "agent_message": "This command was blocked by a safety hook because it could cause irreversible damage."
  }'
  exit 0
fi

if echo "$command" | grep -qiE 'AQ\.|AIzaSy|GEMINI_API_KEY=\S{10}'; then
  echo '{
    "permission": "ask",
    "user_message": "This command may contain a secret. Please review before running.",
    "agent_message": "A hook detected a possible API key in this shell command."
  }'
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
