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

`npm run dev` and `npm run build` first pull the registry from [velonx/agent-skills](https://github.com/velonx/agent-skills) into `.registry/` (git-ignored) — every file from one commit. To work against a local checkout of the skills repo instead:

```bash
AGENT_SKILLS_DIR=../agent-skills npm run dev
```

```bash
npm run registry     # pull .registry/ (AGENT_SKILLS_REF=<sha> for a specific commit)
npm run lint
npm test             # search, SKILL.md parsing, submit-form rules
npm run build        # prerenders every page as static HTML
```

## How data flows

```text
velonx/agent-skills @ commit ─► scripts/pull-registry.mjs ─► .registry/ ─► lib/registry.ts ─► static pages
```

- `lib/registry.ts` is the **only** place that loads data. It checks the registry's `version` and throws on an unknown one.
- The build reads files, not `fetch`, on purpose: Next keeps `fetch` results in `.next/cache` between builds, which would serve a stale registry after an update.
- The footer shows which agent-skills commit a deployment was built from.
- No token is needed: the registry is public. `GITHUB_TOKEN` is used in CI only to avoid API rate limits.

## Staying in sync

`.github/workflows/rebuild.yml` rebuilds and redeploys the site when skills change:

- **instantly** on `repository_dispatch: registry-updated`, sent by agent-skills after every merge (needs `SKILLS_WEB_DISPATCH_TOKEN` in agent-skills),
- **hourly** as a fallback, only if `agent-skills/main` moved since the last rebuild,
- **by hand** from the Actions tab.

Each run pulls one exact commit, runs tests and a full build, then calls `DEPLOY_HOOK_URL` (a repo secret). Without that secret it only verifies the build. Details: [ARCHITECTURE.md § F](https://github.com/velonx/agent-skills/blob/main/ARCHITECTURE.md#f-github--website-sync).

## Structure

```text
app/
  layout.tsx                 header, sidebar, footer, fonts, metadata, theme script
  page.tsx                   home
  skills/page.tsx            all skills: filters, sort, search (state in the URL)
  skills/[slug]/page.tsx     one static page per skill, built from its SKILL.md
  categories/page.tsx        category overview
  categories/[slug]/page.tsx one page per category
  search/page.tsx            search-first view with keyboard navigation
  submit/page.tsx            SKILL.md builder that hands off to a GitHub pull request
  sitemap.ts · robots.ts · not-found.tsx
  globals.css                design tokens (light/dark) + paper primitives
components/
  paper.tsx         PaperCard, NotebookSection, Tag, Chip, ButtonLink, GitHubButton
  skill.tsx         SkillTile, SkillBadge, SkillCard, SkillGrid, SkillRow, CategoryCard
  skill-page.tsx    SkillHeader, SkillMetadata, InstallationBlock, RequirementsBlock, FilesBlock, ContributingBlock
  SkillBrowser.tsx  filter + search UI shared by /skills, /search and category pages
  SkillSubmitForm.tsx  /submit form: live validation, preview, "Continue on GitHub"
  Markdown.tsx      safe SKILL.md rendering (no raw HTML, relative links → GitHub)
  SearchBar.tsx     header + hero search (plain GET form to /search)
  CodeBlock.tsx     CommandLine, CodeBlock
  site.tsx          Header, Sidebar, Footer
  client.tsx        NavLink, ThemeToggle, CopyButton, Tabs, TableOfContents, "/" shortcut
  doodles.tsx       Robot, Fern, PaperPlane, SVG paper filters
  Icon.tsx          stroke icon set (skills pick one via metadata.icon)
scripts/
  pull-registry.mjs download the registry into .registry/ (runs before dev and build)
lib/
  registry.ts       types + loaders (server only)
  search.ts         local search, filters and sorting — swap for a search engine later
  markdown.ts       split SKILL.md into sections
  skill-draft.ts    build + validate a new SKILL.md (rules read from agent-skills' schema)
  format.ts         date formatting (client-safe)
  site.ts           URLs, labels and constants
```

## Skill pages

Each `/skills/<name>` page is generated from the skill's own `SKILL.md`: the sections the author wrote (Overview, When to Use, Usage, Examples, Limitations, Changelog…) are rendered in place, and the site adds Installation (per-platform tabs), Requirements & compatibility, Files and Contributing from registry metadata. Add a skill to `agent-skills` and its page appears on the next build — there are no per-skill React files.

Search covers name, title, tags, category, description and author. Every word must match; title and name matches rank highest.

## Submitting skills

`/submit` has no backend. The form builds a `SKILL.md`, checks it against rules read from `agent-skills`' `registry/schema.json` (plus name/title clashes with existing skills), then opens GitHub's "new file" page pre-filled at `skills/<name>/SKILL.md`. People without write access get GitHub's fork-and-pull-request flow automatically. CI validation and maintainer review stay the real gate.

## Design system

A handmade developer notebook: warm paper on sage, hand-written headings (Patrick Hand, Caveat), technical text in IBM Plex Sans/Mono, torn paper edges, tape and sticky notes.

- **Tokens** are CSS variables in `app/globals.css`, exposed to Tailwind as `bg-paper`, `text-ink-2`, `border-line-2`, `bg-green`, `text-peach-ink`, `bg-tone-*`, `font-hand`, `font-script`… Dark mode swaps the variables under `[data-theme="dark"]`; `dark:` variants follow the same attribute.
- **Paper:** `.paper` draws the card on `::before` with an SVG displacement filter, so edges look torn but text stays crisp. `.paper-flat` is for small cards, `.paper-sticky` for notes.
- **Rules:** no gradients, no glass, no neon. Hand-drawn fonts for headings only; all technical content stays in Plex.
- **Accessibility:** semantic landmarks, skip link, visible dashed focus rings, `aria-current` on nav, reduced-motion support, and a native `popover` for the mobile menu (Esc and outside-click close it).

## Status

Phases 4–9 of the [plan](https://github.com/velonx/agent-skills/blob/main/ARCHITECTURE.md#h-development-phases) are done: design system, home, skills, skill pages, categories, search, submitting and automatic rebuilds. `/docs` and `/changelog` are still to come and currently show the not-found page.

## License

MIT
