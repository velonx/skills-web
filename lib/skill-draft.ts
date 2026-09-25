// Build and check a new SKILL.md in the browser. Rules come from agent-skills' registry/schema.json,
// so this form and the CI validator can't drift apart. CI stays the real gate.
import { SKILLS_REPO } from "./site";

export type Rules = {
  namePattern: string;
  nameMax: number;
  descMin: number;
  descMax: number;
  titleMax: number;
  tagPattern: string;
  tagsMax: number;
  licenses: string[];
  platforms: string[];
  requirements: string[];
};

export type SkillSchema = {
  properties: {
    name: { pattern: string; maxLength: number };
    description: { minLength: number; maxLength: number };
    license: { enum: string[] };
    metadata: {
      properties: {
        title: { maxLength: number };
        tags: { maxItems: number; items: { pattern: string } };
        platforms: { items: { enum: string[] } };
        requirements: { items: { enum: string[] } };
      };
    };
  };
};

export function rulesFromSchema(s: SkillSchema): Rules {
  const m = s.properties.metadata.properties;
  return {
    namePattern: s.properties.name.pattern,
    nameMax: s.properties.name.maxLength,
    descMin: s.properties.description.minLength,
    descMax: s.properties.description.maxLength,
    titleMax: m.title.maxLength,
    tagPattern: m.tags.items.pattern,
    tagsMax: m.tags.maxItems,
    licenses: s.properties.license.enum,
    platforms: m.platforms.items.enum,
    requirements: m.requirements.items.enum,
  };
}

export type Draft = {
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  platforms: string[];
  requirements: string[];
  license: string;
  author: string;
  overview: string;
  whenToUse: string;
  usage: string;
  example: string;
};

export const emptyDraft = (): Draft => ({
  name: "",
  title: "",
  description: "",
  category: "",
  tags: "",
  platforms: ["generic", "claude"],
  requirements: [],
  license: "MIT",
  author: "",
  overview: "",
  whenToUse: "",
  usage: "",
  example: "",
});

export const toSlug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);

export const parseTags = (s: string) => [...new Set(s.split(",").map((t) => toSlug(t.trim())).filter(Boolean))];

export type Errors = Partial<Record<keyof Draft, string>>;

export function validateDraft(d: Draft, rules: Rules, taken: { names: string[]; titles: string[] }, categories: string[]): Errors {
  const e: Errors = {};
  const name = d.name.trim();
  if (!name) e.name = "Required.";
  else if (name.length > rules.nameMax) e.name = `At most ${rules.nameMax} characters.`;
  else if (!new RegExp(rules.namePattern).test(name)) e.name = "Lowercase letters, numbers and single hyphens, e.g. meeting-notes.";
  else if (taken.names.includes(name)) e.name = "A skill with this name already exists.";

  const title = d.title.trim();
  if (title.length < 2) e.title = "Required.";
  else if (title.length > rules.titleMax) e.title = `At most ${rules.titleMax} characters.`;
  else if (taken.titles.some((t) => t.toLowerCase() === title.toLowerCase())) e.title = "A skill with this title already exists.";

  const desc = d.description.trim();
  if (desc.length < rules.descMin) e.description = `At least ${rules.descMin} characters — say what it does and when to use it.`;
  else if (desc.length > rules.descMax) e.description = `At most ${rules.descMax} characters.`;
  else if (/[<>]/.test(desc)) e.description = "Can't contain < or >.";

  if (!categories.includes(d.category)) e.category = "Pick a category.";

  const tags = parseTags(d.tags);
  if (!tags.length) e.tags = "Add at least one tag.";
  else if (tags.length > rules.tagsMax) e.tags = `At most ${rules.tagsMax} tags.`;
  else if (tags.some((t) => t.length > 30 || !new RegExp(rules.tagPattern).test(t))) e.tags = "Tags are short lowercase words.";

  if (!d.platforms.length) e.platforms = "Pick at least one.";
  if (!rules.licenses.includes(d.license)) e.license = "Pick a license from the list.";
  if (!d.author.trim()) e.author = "Required — your name, handle or team.";
  return e;
}

// JSON strings are valid YAML double-quoted scalars, so this is safe for any user text.
const q = (s: string) => JSON.stringify(s.trim());
const list = (xs: string[]) => `[${xs.join(", ")}]`;
const orHint = (text: string, hint: string) => text.trim() || `<!-- ${hint} -->`;

export function buildSkillMd(d: Draft): string {
  const title = d.title.trim() || "Untitled Skill";
  return `---
name: ${d.name.trim() || "my-skill"}
description: ${q(d.description)}
license: ${d.license}
metadata:
  title: ${q(title)}
  version: "1.0.0"
  author: ${q(d.author)}
  category: ${d.category || "other"}
  tags: ${list(parseTags(d.tags))}
  platforms: ${list(d.platforms)}
  requirements: ${list(d.requirements)}
---

# ${title}

## Overview

${orHint(d.overview, "One or two sentences: what the skill does and why it helps.")}

## When to Use

${orHint(d.whenToUse, "Phrases and situations that should trigger this skill. Say when NOT to use it, too.")}

## Usage

${orHint(d.usage, "Numbered steps written as instructions to the agent. Include commands and the exact output format.")}

## Examples

${orHint(d.example, "A realistic prompt and what the agent does with it.")}

## Limitations

<!-- What the skill can't do, or gets wrong. -->

## Changelog

- **1.0.0** — Initial release.
`;
}

/** GitHub's "create new file" page, pre-filled. Without write access GitHub forks and opens a PR for you. */
export const MAX_URL = 8000;
export function githubNewFileUrl(name: string, content?: string) {
  const params = new URLSearchParams({ filename: `skills/${name || "my-skill"}/SKILL.md` });
  if (content) params.set("value", content);
  return `${SKILLS_REPO}/new/main?${params}`;
}
