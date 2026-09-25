// Split a SKILL.md into its "## " sections so the skill page can order them and build a table of contents.

export type Section = { id: string; title: string; body: string };

export const stripFrontmatter = (text: string) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";

/** Everything before the first "## " (minus the "# Title") is the intro. Headings inside code fences are ignored. */
export function splitSections(markdown: string): { intro: string; sections: Section[] } {
  const intro: string[] = [];
  const parts: { title: string; lines: string[] }[] = [];
  let lines = intro;
  let fence: string | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1][0];
    if (marker) fence = fence === null ? marker : marker === fence ? null : fence;
    else if (fence === null) {
      const h2 = line.match(/^##\s+(.+?)\s*#*\s*$/);
      if (h2) {
        parts.push({ title: h2[1], lines: (lines = []) });
        continue;
      }
      if (lines === intro && /^#\s/.test(line)) continue;
    }
    lines.push(line);
  }

  const seen = new Map<string, number>();
  const sections = parts.map(({ title, lines }) => {
    const base = slugify(title);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return { id: n ? `${base}-${n}` : base, title, body: lines.join("\n").trim() };
  });
  return { intro: intro.join("\n").trim(), sections };
}
