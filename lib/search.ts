// Local search over the registry. Pure and synchronous so it runs on the server and in the browser.
// ponytail: substring scoring over the whole list — fine for thousands of skills; swap this module for a search index when it isn't.
import type { Category, Skill } from "./registry";

export const SORTS = {
  relevance: "Best match",
  popular: "Popular",
  newest: "Recently added",
  updated: "Recently updated",
  name: "A – Z",
} as const;
export type SortKey = keyof typeof SORTS;

export type Filters = {
  q?: string;
  category?: string;
  platforms?: string[];
  license?: string;
  sort?: SortKey;
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const tokenize = (q: string) => norm(q).split(/[^a-z0-9]+/).filter(Boolean);

// Field → weight. A token that starts a word scores full weight, one inside a word half.
const FIELDS: [(s: Skill, category: string) => string, number][] = [
  [(s) => s.title, 10],
  [(s) => s.name.replaceAll("-", " "), 8],
  [(s) => s.tags.join(" ").replaceAll("-", " "), 6],
  [(_, category) => category, 4],
  [(s) => s.description, 2],
  [(s) => s.author, 2],
];

/** 0 means "doesn't match". Every token must match some field. */
export function scoreSkill(skill: Skill, tokens: string[], categoryTitle = ""): number {
  const category = `${skill.category} ${categoryTitle}`;
  const haystacks = FIELDS.map(([get, w]) => [norm(get(skill, category)), w] as const);
  let total = 0;
  for (const t of tokens) {
    const wordStart = new RegExp(`(^|[^a-z0-9])${escapeRe(t)}`);
    let best = 0;
    for (const [text, w] of haystacks) {
      if (!text.includes(t)) continue;
      best = Math.max(best, wordStart.test(text) ? w : w / 2);
    }
    if (!best) return 0;
    total += best;
  }
  if (norm(skill.title) === tokens.join(" ")) total += 20;
  return total;
}

const COMPARE: Record<Exclude<SortKey, "relevance">, (a: Skill, b: Skill) => number> = {
  popular: (a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title),
  newest: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || a.title.localeCompare(b.title),
  updated: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || a.title.localeCompare(b.title),
  name: (a, b) => a.title.localeCompare(b.title),
};

export function filterSkills(skills: Skill[], f: Filters, categories: Category[] = []): Skill[] {
  const title = new Map(categories.map((c) => [c.id, c.title]));
  let list = skills.filter(
    (s) =>
      (!f.category || s.category === f.category) &&
      (!f.license || s.license === f.license) &&
      (!f.platforms?.length || f.platforms.some((p) => s.platforms.includes(p))),
  );

  const tokens = tokenize(f.q ?? "");
  const sort = f.sort ?? (tokens.length ? "relevance" : "popular");
  if (tokens.length) {
    const scored = list.map((s) => [s, scoreSkill(s, tokens, title.get(s.category))] as const).filter(([, n]) => n > 0);
    if (sort === "relevance") scored.sort((a, b) => b[1] - a[1] || a[0].title.localeCompare(b[0].title));
    list = scored.map(([s]) => s);
  }
  return sort === "relevance" ? list : [...list].sort(COMPARE[sort]);
}

/** Read filters from a URLSearchParams-like object. Unknown values are ignored. */
export function parseFilters(p: { get(k: string): string | null; getAll(k: string): string[] }): Filters {
  const sort = p.get("sort");
  return {
    q: p.get("q") ?? undefined,
    category: p.get("category") ?? undefined,
    license: p.get("license") ?? undefined,
    platforms: p.getAll("platform"),
    sort: sort && sort in SORTS ? (sort as SortKey) : undefined,
  };
}
