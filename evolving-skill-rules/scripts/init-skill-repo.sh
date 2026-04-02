#!/usr/bin/env bash
#
# init-skill-repo.sh — Initialize git version tracking for a skill directory.
#
# Usage: init-skill-repo.sh <skill-directory>
#
# Behavior:
#   1. Validates the argument is a directory containing SKILL.md
#   2. Checks if git is already initialized (skips if yes)
#   3. Initializes a git repo
#   4. Makes an initial commit of the current state
#   5. Prints success message
#
# Compatible with macOS, Linux, and Windows (Git Bash / WSL).
#
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: init-skill-repo.sh <skill-directory>" >&2
  exit 1
fi

SKILL_DIR="$1"

if [ ! -d "$SKILL_DIR" ]; then
  echo "Error: '$SKILL_DIR' is not a directory." >&2
  exit 1
fi

if [ ! -f "$SKILL_DIR/SKILL.md" ]; then
  echo "Error: '$SKILL_DIR/SKILL.md' not found. A skill directory must contain SKILL.md." >&2
  exit 1
fi

if [ -d "$SKILL_DIR/.git" ]; then
  echo "Git already initialized in '$SKILL_DIR'. Nothing to do."
  exit 0
fi

git -C "$SKILL_DIR" init
git -C "$SKILL_DIR" remote remove origin 2>/dev/null || true
git -C "$SKILL_DIR" add -A
git -C "$SKILL_DIR" commit -m "initial: skill baseline"

echo "Skill repo initialized in '$SKILL_DIR'."
