#!/usr/bin/env node

import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import * as readline from "node:readline";

const author = "abue.ammar";

// ANSI color codes for pretty output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

function printBanner() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════╗
║     ${colors.bright}📋 Git Commits Report Generator${colors.reset}${colors.cyan}          ║
╚═══════════════════════════════════════════════╝${colors.reset}
`);
}

function printMenu() {
  console.log(`${colors.yellow}Choose a date option:${colors.reset}
  
  ${colors.green}1${colors.reset}) ${colors.bright}Today${colors.reset}        - Get today's commits
  ${colors.green}2${colors.reset}) ${colors.bright}Yesterday${colors.reset}    - Get yesterday's commits
  ${colors.green}3${colors.reset}) ${colors.bright}Specific${colors.reset}     - Enter a specific date (YYYY-MM-DD)
  ${colors.green}q${colors.reset}) ${colors.dim}Quit${colors.reset}

`);
}

function getDateRange(choice, specificDate = null) {
  const now = new Date();
  let since, until, displayDate;

  switch (choice) {
    case "1": // Today
      since = "midnight";
      until = "now";
      displayDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      break;

    case "2": // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      since = yesterday.toISOString().split("T")[0] + " 00:00:00";
      until = yesterday.toISOString().split("T")[0] + " 23:59:59";
      displayDate = yesterday.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      break;

    case "3": // Specific date
      if (!specificDate || !/^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
        return null;
      }
      since = `${specificDate} 00:00:00`;
      until = `${specificDate} 23:59:59`;
      const parsedDate = new Date(specificDate + "T00:00:00");
      displayDate = parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      break;

    default:
      return null;
  }

  return { since, until, displayDate };
}

async function generateReport(dateRange) {
  try {
    // Get remote origin URL from Git config
    const rawRepoUrl = execSync("git config --get remote.origin.url")
      .toString()
      .trim();

    // Convert SSH or Git format to HTTPS
    const repoUrl = rawRepoUrl
      .replace(/^git@([^:]+):/, "https://$1/")
      .replace(/\.git$/, "");

    const output = execSync(
      `git log --author="${author}" --since="${dateRange.since}" --until="${dateRange.until}" --pretty=format:"%s|%h"`
    ).toString();

    const lines = output.trim().split("\n");

    if (!lines.length || !lines[0]) {
      console.log(
        `\n${colors.yellow}⚠️  No commits found for ${dateRange.displayDate}.${colors.reset}`
      );
      return;
    }

    const summaryLines = [];
    const commitLinks = [];

    for (const line of lines) {
      const [message, hash] = line.split("|");
      // Skip merge commits
      if (message.startsWith("Merge branch")) continue;
      summaryLines.push(`- **${message}** \`${hash}\``);
      commitLinks.push(`- ${repoUrl}/commit/${hash}`);
    }

    if (summaryLines.length === 0) {
      console.log(
        `\n${colors.yellow}⚠️  No non-merge commits found for ${dateRange.displayDate}.${colors.reset}`
      );
      return;
    }

    const markdown = `## 📝 Summary ${dateRange.displayDate}
${summaryLines.join("\n")}

## 🔗 Commit Links
${commitLinks.join("\n")}
`;

    const filename = `commits-${dateRange.displayDate.replace(
      /,?\s+/g,
      "-"
    )}.md`;
    await writeFile(filename, markdown);

    console.log(
      `\n${colors.green}✅ Generated "${filename}" with ${summaryLines.length} commit(s).${colors.reset}`
    );
  } catch (err) {
    console.error(`\n${colors.red}❌ Error: ${err.message}${colors.reset}`);
  }
}

function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printBanner();
  printMenu();

  const choice = await prompt(
    rl,
    `${colors.cyan}Enter your choice (1/2/3/q): ${colors.reset}`
  );

  if (choice.toLowerCase() === "q") {
    console.log(`\n${colors.dim}Goodbye! 👋${colors.reset}\n`);
    rl.close();
    process.exit(0);
  }

  let dateRange;

  if (choice === "3") {
    const specificDate = await prompt(
      rl,
      `${colors.cyan}Enter date (YYYY-MM-DD): ${colors.reset}`
    );
    dateRange = getDateRange(choice, specificDate);

    if (!dateRange) {
      console.log(
        `\n${colors.red}❌ Invalid date format. Please use YYYY-MM-DD (e.g., 2026-01-07)${colors.reset}\n`
      );
      rl.close();
      process.exit(1);
    }
  } else if (choice === "1" || choice === "2") {
    dateRange = getDateRange(choice);
  } else {
    console.log(
      `\n${colors.red}❌ Invalid option. Please choose 1, 2, 3, or q.${colors.reset}\n`
    );
    rl.close();
    process.exit(1);
  }

  rl.close();
  await generateReport(dateRange);
  console.log();
}

main();
