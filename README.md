# Velonx Skills — website

The website for [skills.velonx.com](https://skills.velonx.com): a discoverable interface over [velonx/agent-skills](https://github.com/velonx/agent-skills).

This repo has **no skill data of its own**. Everything shown comes from the registry that `agent-skills` publishes (`registry/skills.json` and `registry/categories.json`). To add or change a skill, contribute to [agent-skills](https://github.com/velonx/agent-skills/blob/main/CONTRIBUTING.md).

## Stack

Next.js 16 (App Router, server components, static generation) · TypeScript · Tailwind CSS 4. No database, no backend, no client-side data fetching.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

The registry is fetched from GitHub (`raw.githubusercontent.com/velonx/agent-skills/main`) at build time. To work against a local checkout of the skills repo instead:

```bash
AGENT_SKILLS_DIR=../agent-skills npm run dev
```

```bash
npm run lint
npm run build        # prerenders every page as static HTML
```

## How data flows

```text
velonx/agent-skills ── registry/skills.json ──► lib/registry.ts (build time) ──► static pages
```

- `lib/registry.ts` is the **only** place that loads data. It checks the registry's `version` and throws on an unknown one.
- No token is needed: the registry is public. If one is ever needed for rate limits, keep it in a server-side env var — never `NEXT_PUBLIC_*`.
- Rebuilds are triggered when the registry changes. See [ARCHITECTURE.md](https://github.com/velonx/agent-skills/blob/main/ARCHITECTURE.md#f-github--website-sync).

## Structure

```text
app/
  layout.tsx        header, sidebar, footer, fonts, metadata, theme script
  page.tsx          home
  globals.css       design tokens (light/dark) + paper primitives
components/
  paper.tsx         PaperCard, NotebookSection, Tag, Chip, ButtonLink, GitHubButton
  skill.tsx         SkillTile, SkillBadge, SkillCard, SkillGrid, SkillRow, CategoryCard
  SearchBar.tsx     header + hero search (plain GET form to /search)
  CodeBlock.tsx     CommandLine, CodeBlock
  site.tsx          Header, Sidebar, Footer
  client.tsx        the only client code: NavLink, ThemeToggle, CopyButton, "/" shortcut
  doodles.tsx       Robot, Fern, PaperPlane, SVG paper filters
  Icon.tsx          stroke icon set (skills pick one via metadata.icon)
lib/
  registry.ts       types + loaders
  site.ts           URLs and constants
```

## Design system

A handmade developer notebook: warm paper on sage, hand-written headings (Patrick Hand, Caveat), technical text in IBM Plex Sans/Mono, torn paper edges, tape and sticky notes.

- **Tokens** are CSS variables in `app/globals.css`, exposed to Tailwind as `bg-paper`, `text-ink-2`, `border-line-2`, `bg-green`, `text-peach-ink`, `bg-tone-*`, `font-hand`, `font-script`… Dark mode swaps the variables under `[data-theme="dark"]`; `dark:` variants follow the same attribute.
- **Paper:** `.paper` draws the card on `::before` with an SVG displacement filter, so edges look torn but text stays crisp. `.paper-flat` is for small cards, `.paper-sticky` for notes.
- **Rules:** no gradients, no glass, no neon. Hand-drawn fonts for headings only; all technical content stays in Plex.
- **Accessibility:** semantic landmarks, skip link, visible dashed focus rings, `aria-current` on nav, reduced-motion support, and a native `popover` for the mobile menu (Esc and outside-click close it).

## Status

Phase 4 of the [plan](https://github.com/velonx/agent-skills/blob/main/ARCHITECTURE.md#h-development-phases): design system and home page. Links to `/skills`, `/categories`, `/search`, `/docs`, `/submit` and `/changelog` are placeholders until Phase 5.

## License

MIT
