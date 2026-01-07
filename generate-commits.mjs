import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

const author = "abue.ammar";

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
    `git log --author="${author}" --since=midnight --until=now --pretty=format:"%s|%h"`
  ).toString();

  const lines = output.trim().split("\n");

  if (!lines.length || !lines[0]) {
    console.log("No commits found for today.");
    process.exit(0);
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

  // Get current date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const markdown = `## 📝 Summary ${today}
${summaryLines.join("\n")}

## 🔗 Commit Links
${commitLinks.join("\n")}
`;

  await writeFile("todays-commits.md", markdown);

  console.log('✅ Markdown file "todays-commits.md" generated.');
} catch (err) {
  console.error("❌ Error:", err.message);
}
