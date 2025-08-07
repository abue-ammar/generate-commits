import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const author = 'abue.ammar';

try {
  // Get remote origin URL from Git config
  const rawRepoUrl = execSync('git config --get remote.origin.url').toString().trim();

  // Convert SSH or Git format to HTTPS
  const repoUrl = rawRepoUrl
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/\.git$/, '');

  const output = execSync(
    `git log --author="${author}" --since=midnight --until=now --pretty=format:"%s|%h"`
  ).toString();

  const lines = output.trim().split('\n');

  if (!lines.length || !lines[0]) {
    console.log('No commits found for today.');
    process.exit(0);
  }

  const summaryLines = [];
  const urlLines = [];

  for (const line of lines) {
    const [message, hash] = line.split('|');
    summaryLines.push(`- ${message} (${hash})`);
    urlLines.push(`${repoUrl}/commit/${hash}`);
  }

  const markdown = `**Summary**\n${summaryLines.join('\n')}\n\n**Commits**\n${urlLines.join('\n')}\n`;

  await writeFile('todays-commits.md', markdown);

  console.log('✅ Markdown file "todays-commits.md" generated.');
} catch (err) {
  console.error('❌ Error:', err.message);
}
