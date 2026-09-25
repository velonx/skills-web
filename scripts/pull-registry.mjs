// Download the registry from velonx/agent-skills into .registry/ before dev/build.
// Everything comes from one commit, so a build never mixes old and new files, and nothing
// relies on Next's fetch cache (which hosts keep between builds and would serve stale data).
//
//   AGENT_SKILLS_DIR=../agent-skills  → skip; the site reads that checkout directly
//   AGENT_SKILLS_REF=<sha|branch>     → pull a specific revision (default: main)
//   GITHUB_TOKEN                      → optional, avoids API rate limits in CI
import { mkdir, writeFile, rm, rename, access } from "node:fs/promises";
import { dirname, join } from "node:path";

const REPO = "velonx/agent-skills";
const OUT = join(process.cwd(), ".registry");
const FILES = ["registry/skills.json", "registry/categories.json", "registry/schema.json"];

if (process.env.AGENT_SKILLS_DIR) {
  console.log(`registry: using local checkout ${process.env.AGENT_SKILLS_DIR}`);
  process.exit(0);
}

const headers = { "User-Agent": "velonx-skills-web", ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }) };
const get = async (url, accept) => {
  const res = await fetch(url, { headers: { ...headers, ...(accept && { Accept: accept }) } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};

try {
  const ref = process.env.AGENT_SKILLS_REF || "main";
  const sha = (await get(`https://api.github.com/repos/${REPO}/commits/${ref}`, "application/vnd.github.sha")).trim();
  const raw = (path) => get(`https://raw.githubusercontent.com/${REPO}/${sha}/${path}`);

  const files = new Map(await Promise.all(FILES.map(async (f) => [f, await raw(f)])));
  const { skills } = JSON.parse(files.get("registry/skills.json"));
  // Skill paths come from the registry our CI generated; still refuse anything odd.
  for (const s of skills) if (!/^skills\/[a-z0-9-]+\/SKILL\.md$/.test(s.path)) throw new Error(`Unexpected skill path: ${s.path}`);
  await Promise.all(skills.map(async (s) => files.set(s.path, await raw(s.path))));

  // Write to a temp dir and swap, so a failed pull never leaves a half-written registry.
  const tmp = `${OUT}.tmp`;
  await rm(tmp, { recursive: true, force: true });
  for (const [path, text] of files) {
    await mkdir(dirname(join(tmp, path)), { recursive: true });
    await writeFile(join(tmp, path), text);
  }
  await writeFile(join(tmp, "REVISION"), sha + "\n");
  await rm(OUT, { recursive: true, force: true });
  await rename(tmp, OUT);
  console.log(`registry: ${skills.length} skills @ ${sha.slice(0, 7)}`);
} catch (e) {
  // Offline dev with an earlier pull is fine; a build without any registry is not.
  const have = await access(join(OUT, "registry/skills.json")).then(() => true, () => false);
  if (have && process.env.npm_lifecycle_event === "predev") {
    console.warn(`registry: pull failed (${e.message}); using the existing .registry/`);
  } else {
    console.error(`registry: pull failed — ${e.message}`);
    process.exit(1);
  }
}
