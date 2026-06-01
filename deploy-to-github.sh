#!/usr/bin/env bash
# ──────────────────────────────────────────────
#  oddkit → GitHub private repo  (run from Mac Terminal)
# ──────────────────────────────────────────────
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo ""
echo "🚀  oddkit · GitHub deploy"
echo "────────────────────────────"
echo ""

# ── Ask for credentials ──
read -p "GitHub username: " GH_USER
read -s -p "GitHub Personal Access Token (needs repo scope): " GH_TOKEN
echo ""
read -p "Repo name [oddkit]: " REPO_NAME
REPO_NAME="${REPO_NAME:-oddkit}"

echo ""
echo "① Initialising git repo…"
git init
git checkout -b main 2>/dev/null || git branch -m main
git config user.email "dongzhizhang36@gmail.com"
git config user.name "$GH_USER"
git add .
git commit -m "init: oddkit component library

- oddkit-demo.html  standalone demo (open directly in browser)
- constellation-sphere.js  3D sphere Web Component (hover-pause, drag)
- public/staircase-reveal.js  Staircase Reveal (matchTarget auto color sync)
- public/cube-word-stack.js  Cube Word Stack 3D text"

echo ""
echo "② Creating private GitHub repo '$REPO_NAME'…"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"description\":\"Oddkit — frontend animation component library\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
  CLONE_URL=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['clone_url'])")
  echo "   ✅  Repo created: https://github.com/$GH_USER/$REPO_NAME"
elif [ "$HTTP_CODE" = "422" ]; then
  echo "   ℹ️  Repo already exists — pushing to existing repo."
  CLONE_URL="https://github.com/$GH_USER/$REPO_NAME.git"
else
  echo "   ❌  GitHub API error $HTTP_CODE:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

echo ""
echo "③ Pushing to GitHub…"
# Embed token in URL so push is credential-free
AUTH_URL="https://${GH_USER}:${GH_TOKEN}@${CLONE_URL#https://}"
git remote remove origin 2>/dev/null || true
git remote add origin "$AUTH_URL"
git push -u origin main

echo ""
echo "✅  Done!  https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "   Team access → Settings → Collaborators → Add people"
