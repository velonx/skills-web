import { test } from "node:test";
import assert from "node:assert/strict";
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
