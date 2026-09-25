// The only data source: files published by velonx/agent-skills, pulled into .registry/ before
// every dev/build by scripts/pull-registry.mjs (or read from AGENT_SKILLS_DIR, a local checkout).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SkillSchema } from "./skill-draft";

export type Skill = {
  name: string;
  title: string;
  description: string;
  version: string;
  author: string;
  license: string;
  category: string;
  tags: string[];
  platforms: string[];
  requirements: string[];
  compatibility?: string;
  dependencies?: string[];
  repository?: string;
  homepage?: string;
  documentation?: string;
  icon?: string;
  featured: boolean;
  deprecated: boolean | string;
  createdAt: string | null;
  updatedAt: string | null;
  path: string;
  files: string[];
};

export type Category = { id: string; title: string; icon: string; description: string };

const ROOT = process.env.AGENT_SKILLS_DIR || join(process.cwd(), ".registry");

// Only read at build time (every page is prerendered), so keep these files out of server tracing.
async function loadText(file: string): Promise<string> {
  const path = join(/*turbopackIgnore: true*/ ROOT, file);
  try {
    return await readFile(/*turbopackIgnore: true*/ path, "utf8");
  } catch {
    throw new Error(`Registry file missing: ${path}. Run "npm run registry" (or set AGENT_SKILLS_DIR).`);
  }
}

const loadJson = async <T>(file: string): Promise<T> => JSON.parse(await loadText(file));

/** Every skill, deprecated ones included (their pages stay up with a notice). */
export async function getAllSkills(): Promise<Skill[]> {
  const { version, skills } = await loadJson<{ version: number; skills: Skill[] }>("registry/skills.json");
  if (version !== 1) throw new Error(`Unsupported registry version ${version}`);
  return skills;
}

/** Skills to list and search: deprecated ones hidden. */
export const getSkills = async () => (await getAllSkills()).filter((s) => !s.deprecated);

export const getSkill = async (name: string) => (await getAllSkills()).find((s) => s.name === name);

/** Raw SKILL.md, frontmatter included. `path` comes from the registry, never from user input. */
export const getSkillSource = (skill: Skill) => loadText(skill.path);

export async function getCategories(): Promise<Category[]> {
  return (await loadJson<{ categories: Category[] }>("registry/categories.json")).categories;
}

/** The skill frontmatter JSON Schema — the submit form derives its rules from it. */
export const getSkillSchema = () => loadJson<SkillSchema>("registry/schema.json");

/** The agent-skills commit this build was made from; null when reading a local checkout. */
export const getRegistryRevision = async () =>
  process.env.AGENT_SKILLS_DIR ? null : (await loadText("REVISION")).trim();
