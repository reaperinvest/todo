#!/usr/bin/env bash
set -euo pipefail

# Determine staged changes for this commit
CHANGED=$(git diff --cached --name-only)

# Identify code/config changes (exclude markdown docs)
CODE_CHANGED=$(echo "$CHANGED" | grep -E '^(backend|frontend)/|^package\.json$|^package-lock\.json$' || true)
DOCS_CHANGED=$(echo "$CHANGED" | grep -E '^README\.md$|^README-TH\.md$' || true)

if [[ -n "$CODE_CHANGED" && -z "$DOCS_CHANGED" ]]; then
  echo "\n[docs-check] Code/config changed, but README.md/README-TH.md not updated."
  echo "Please update both READMEs to reflect your changes, then commit again.\n"
  echo "Changed files:";
  echo "$CHANGED" | sed 's/^/  - /'
  exit 1
fi

exit 0

