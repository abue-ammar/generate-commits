# Generate Daily Commits

A Node.js script that generates a markdown file with today's Git commits by a specific author.

## Usage

```bash
node generate-commits.mjs
```

Generates `todays-commits.md` with your commits from today, including commit messages and links to the repository.

## Sample Output

The generated file will look like this:

```markdown
## 📝 Summary

- **Fix navigation bug** `a1b2c3d`
- **Add user authentication** `e4f5g6h`
- **Update documentation** `i7j8k9l`

## 🔗 Commit Links

- https://github.com/username/repo/commit/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
- https://github.com/username/repo/commit/e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3
- https://github.com/username/repo/commit/i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6
```

## Setup

1. Run from a Git repository
2. Edit the `author` variable in the script to match your Git username

## Requirements

- Node.js 18+ installed
- Git repository with remote origin
