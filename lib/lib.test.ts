import { before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildSkillMd, emptyDraft, githubNewFileUrl, parseTags, rulesFromSchema, validateDraft, type Rules } from "./skill-draft";
import type { Skill } from "./registry";
import { filterSkills, parseFilters } from "./search";
import { splitSections, stripFrontmatter } from "./markdown";

const skill = (name: string, over: Partial<Skill> = {}): Skill => ({
  name,
  title: name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
  description: "",
  version: "1.0.0",
  author: "Velonx",
  license: "MIT",
  category: "research",
  tags: [],
  platforms: ["generic", "claude"],
  requirements: [],
  featured: false,
  deprecated: false,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  path: `skills/${name}/SKILL.md`,
  files: ["SKILL.md"],
  ...over,
});

const SKILLS = [
  skill("web-research", { featured: true, tags: ["research", "web"] }),
  skill("academic-research", { tags: ["papers"], createdAt: "2026-03-01" }),
  skill("competitive-analysis", { description: "Compare competitors." }),
  skill("code-review", { category: "development", tags: ["git"], platforms: ["cursor"], license: "Apache-2.0" }),
  skill("pdf-analysis", { category: "documents", description: "Extract tables from PDF documents." }),
];
const CATS = [
  { id: "research", title: "Research", icon: "search", description: "" },
  { id: "development", title: "Development", icon: "code", description: "" },
  { id: "documents", title: "Documents", icon: "doc", description: "" },
];
const names = (f: Parameters<typeof filterSkills>[1]) => filterSkills(SKILLS, f, CATS).map((s) => s.name);

test("search matches title, tags, category and description; best match first", () => {
  assert.deepEqual(names({ q: "research" }), ["academic-research", "web-research", "competitive-analysis"]);
  assert.deepEqual(names({ q: "Web Research" })[0], "web-research");
  assert.deepEqual(names({ q: "tables" }), ["pdf-analysis"]);
  assert.deepEqual(names({ q: "develop" }), ["code-review"]);
});

test("every search word must match", () => {
  assert.deepEqual(names({ q: "web papers" }), []);
});

test("filters and sorts", () => {
  assert.deepEqual(names({ category: "research", sort: "name" }), ["academic-research", "competitive-analysis", "web-research"]);
  assert.deepEqual(names({ platforms: ["cursor"] }), ["code-review"]);
  assert.deepEqual(names({ license: "Apache-2.0" }), ["code-review"]);
  assert.equal(names({})[0], "web-research"); // featured first by default
  assert.equal(names({ sort: "newest" })[0], "academic-research");
});

test("parseFilters ignores unknown sort values", () => {
  const f = parseFilters(new URLSearchParams("q=pdf&platform=claude&platform=cursor&sort=bogus"));
  assert.deepEqual(f, { q: "pdf", category: undefined, license: undefined, platforms: ["claude", "cursor"], sort: undefined });
});

test("splitSections: strips title, ignores headings in code, dedupes ids", () => {
  const md = stripFrontmatter("---\nname: x\n---\n\n# Title\n\nIntro line.\n\n## Usage\n\n```md\n## Not a heading\n```\n\n## Usage\n\nAgain.\n");
  const { intro, sections } = splitSections(md);
  assert.equal(intro, "Intro line.");
  assert.deepEqual(sections.map((s) => s.id), ["usage", "usage-1"]);
  assert.match(sections[0].body, /## Not a heading/);
  assert.equal(sections[1].body, "Again.");
});

// Tested against the real schema, as pulled by `npm run registry` (or from AGENT_SKILLS_DIR).
let RULES: Rules;
before(async () => {
  const root = process.env.AGENT_SKILLS_DIR || ".registry";
  RULES = rulesFromSchema(JSON.parse(await readFile(join(root, "registry/schema.json"), "utf8")));
});

const TAKEN = { names: ["web-research"], titles: ["Web Research"] };
const CAT_IDS = ["research", "other"];
const good = () => ({
  ...emptyDraft(),
  name: "meeting-notes",
  title: "Meeting Notes",
  description: 'Turn a transcript into decisions and action items: "who, what, when". Use when asked to summarise a meeting.',
  category: "other",
  tags: "Meetings, notes, notes",
  author: "Ada",
});

test("draft validation mirrors the schema", () => {
  assert.deepEqual(validateDraft(good(), RULES, TAKEN, CAT_IDS), {});
  const e = validateDraft({ ...good(), name: "Web_Research", title: "web research", description: "short <b>", tags: "", platforms: [], license: "GPL-3.0" }, RULES, TAKEN, CAT_IDS);
  assert.deepEqual(Object.keys(e).sort(), ["description", "license", "name", "platforms", "tags", "title"]);
  assert.match(validateDraft({ ...good(), name: "web-research" }, RULES, TAKEN, CAT_IDS).name!, /already exists/);
});

test("generated SKILL.md quotes user text and has every required section", () => {
  const md = buildSkillMd(good());
  assert.match(md, /^description: "Turn a transcript into decisions and action items: \\"who, what, when\\"\. Use/m);
  assert.match(md, /^  tags: \[meetings, notes\]$/m);
  assert.match(md, /^  version: "1\.0\.0"$/m);
  for (const s of ["Overview", "When to Use", "Usage", "Examples", "Limitations", "Changelog"]) assert.match(md, new RegExp(`^## ${s}$`, "m"));
  assert.deepEqual(parseTags(" Web Search , web-search,"), ["web-search"]);
});

test("GitHub link pre-fills path and content", () => {
  const url = new URL(githubNewFileUrl("meeting-notes", "hello"));
  assert.equal(url.pathname, "/velonx/agent-skills/new/main");
  assert.equal(url.searchParams.get("filename"), "skills/meeting-notes/SKILL.md");
  assert.equal(url.searchParams.get("value"), "hello");
});
