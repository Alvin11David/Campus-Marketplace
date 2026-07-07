import { execSync } from "node:child_process";

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", cwd: import.meta.dirname + "/../.." }).trim();
}

function getStatus(): { staged: string[]; unstaged: string[]; untracked: string[] } {
  const porcelain = run("git status --porcelain");
  const staged: string[] = [];
  const unstaged: string[] = [];
  const untracked: string[] = [];

  for (const line of porcelain.split("\n")) {
    if (!line.trim()) continue;
    const path = line.slice(3).trim();
    const index = line[0];
    const workTree = line[1];

    if (index !== " ") staged.push(path);
    if (workTree !== " " && index === " ") unstaged.push(path);
    if (line.startsWith("??")) untracked.push(path);
  }

  return { staged, unstaged, untracked };
}

function formatSummary(files: string[]): string {
  const categorized: Record<string, string[]> = {};
  for (const f of files) {
    const dir = f.includes("/") ? f.split("/")[0] : ".";
    if (!categorized[dir]) categorized[dir] = [];
    categorized[dir].push(f);
  }

  const parts: string[] = [];
  for (const [dir, items] of Object.entries(categorized)) {
    if (items.length <= 3) {
      parts.push(items.join(", "));
    } else {
      parts.push(`${dir}/ (${items.length} files)`);
    }
  }
  return parts.join("; ");
}

function main() {
  console.log("🔍 Checking for changes...\n");

  const { staged, unstaged, untracked } = getStatus();
  const allChanged = [...staged, ...unstaged, ...untracked].filter(
    (p) => !p.includes("pnpm-lock.yaml")
  );

  if (allChanged.length === 0) {
    console.log("✅ No changes to commit.");
    return;
  }

  console.log(`📦 ${allChanged.length} file(s) changed:\n`);
  for (const f of allChanged) {
    const tag = staged.includes(f) ? "✅ staged" : untracked.includes(f) ? "🆕 untracked" : "📝 modified";
    console.log(`  ${tag}  ${f}`);
  }

  // Stage everything
  console.log("\n📥 Staging all changes...");
  run("git add -A");
  console.log("   Done.");

  const summary = formatSummary(allChanged);
  const commitMsg = `chore: auto-commit — ${summary}`;

  console.log(`\n✍️  Committing: "${commitMsg}"`);
  try {
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    console.log("   Done.");
  } catch {
    console.log("   Nothing to commit (already committed).");
    return;
  }

  console.log("\n📤 Pushing to origin...");
  try {
    run("git push");
    console.log("   Done.");
  } catch {
    console.log("   ⚠️  Push failed. You may need to pull first or check remote access.");
  }

  console.log("\n✅ All done.");
}

main();
