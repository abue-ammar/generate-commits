# Generate Daily Commits

A Node.js script that generates a markdown file with today's Git commits by a specific author.

## Usage

```bash
node generate-commits.mjs
```

Generates `todays-commits.md` with your commits from today, including commit messages and links to the repository.

## Setup

1. Run from a Git repository
2. Edit the `author` variable in the script to match your Git username

## Requirements

- Node.js 18+ installed
- Git repository with remote origin
