#!/bin/bash

# Release script for elbot-card
# Usage: ./scripts/release.sh [major|minor|patch]

set -e

VERSION_TYPE=${1:-patch}

echo "🚀 Starting release process..."

# Check if git is clean
if [[ -n $(git status -s) ]]; then
  echo "❌ Git working directory is not clean. Commit or stash changes first."
  exit 1
fi

# Ensure we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" ]]; then
  echo "❌ You must be on the main branch to release."
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Run tests and build
echo "🧪 Running validation..."
npm run build

# Bump version
echo "📦 Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

echo "✅ Version bumped to v$NEW_VERSION"

# Push changes and tags
echo "📤 Pushing changes..."
git push origin main
git push origin "v$NEW_VERSION"

echo "🎉 Release v$NEW_VERSION initiated!"
echo "GitHub Actions will handle the rest."
