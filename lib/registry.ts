// The only data source: registry files published by velonx/agent-skills.
// Fetched at build time. Set AGENT_SKILLS_DIR=../agent-skills to develop against a local checkout.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SKILLS_RAW } from "./site";

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

async function load<T>(file: string): Promise<T> {
  const dir = process.env.AGENT_SKILLS_DIR;
  if (dir) return JSON.parse(await readFile(join(dir, file), "utf8"));
  const res = await fetch(`${SKILLS_RAW}/${file}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Registry fetch failed: ${file} → ${res.status}`);
  return res.json();
}

export async function getSkills(): Promise<Skill[]> {
  const { version, skills } = await load<{ version: number; skills: Skill[] }>("registry/skills.json");
  if (version !== 1) throw new Error(`Unsupported registry version ${version}`);
  return skills.filter((s) => !s.deprecated);
}

export async function getCategories(): Promise<Category[]> {
  return (await load<{ categories: Category[] }>("registry/categories.json")).categories;
}

/** Newest first; skills without a date go last. */
export const byNewest = (a: Skill, b: Skill) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "");

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—";
