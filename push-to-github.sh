#!/usr/bin/env bash
# Run from inside the unzipped arum-soul-coach/ folder.
# Usage: ./push-to-github.sh https://github.com/YOUR-USERNAME/arum-soul-coach.git
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./push-to-github.sh <git-remote-url>"
  echo "Create an empty repo first at https://github.com/new (don't initialize it with a README), then pass its URL here."
  exit 1
fi

git init
git add .
git commit -m "Arum-Soul Coach"
git branch -M main
git remote add origin "$1"
git push -u origin main

echo ""
echo "Pushed. Next: dash.cloudflare.com -> Workers & Pages -> Import a repository -> pick this repo."
