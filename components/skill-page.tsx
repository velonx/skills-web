// Building blocks of /skills/[slug].
import Link from "next/link";
import type { ReactNode } from "react";
import type { Category, Skill } from "@/lib/registry";
import { formatDate } from "@/lib/format";
import { PLATFORMS, REQUIREMENTS, SKILLS_REPO, repoFile, skillEditUrl, skillTree } from "@/lib/site";
import { CommandLine } from "./CodeBlock";
import { CopyButton, Tabs } from "./client";
import { Icon } from "./Icon";
import { ButtonLink, GitHubButton, PaperCard, Tag } from "./paper";
import { SkillBadge, SkillTile } from "./skill";

export function SkillHeader({ skill, category, source }: { skill: Skill; category?: Category; source: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3.5 text-[13.5px] text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/skills" className="hover:text-ink hover:underline">Skills</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/categories/${skill.category}`} className="hover:text-ink hover:underline">{category?.title ?? skill.category}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink-2">{skill.title}</li>
        </ol>
      </nav>
      <PaperCard className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-5 p-8 max-sm:gap-x-4 max-sm:px-[18px] max-sm:py-6">
        <SkillTile icon={skill.icon} category={skill.category} size="lg" />
        <div>
          <h1 className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[clamp(34px,3.6vw,46px)] leading-tight">
            {skill.title}
            <SkillBadge>v{skill.version}</SkillBadge>
            {skill.featured && <SkillBadge tone="green"><Icon name="star" className="size-3.5" />featured</SkillBadge>}
          </h1>
          <p className="mt-2 max-w-[70ch] text-[16.5px] text-ink-2">{skill.description}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13.5px] text-ink-2">
            <Meta icon="users" label="Author">{skill.author}</Meta>
            <Meta icon="doc" label="License">{skill.license}</Meta>
            <Meta icon="clock" label="Updated">{formatDate(skill.updatedAt)}</Meta>
          </dl>
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {skill.tags.map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}><Tag>{t}</Tag></Link>
            ))}
          </div>
        </div>
        <div className="col-span-full flex flex-wrap gap-2.5">
          <GitHubButton href={skillTree(skill.name)}>View on GitHub</GitHubButton>
          <CopyButton text={source}>Copy SKILL.md</CopyButton>
          <ButtonLink href="#installation">Install <Icon name="arrow" className="size-[18px] rotate-90" /></ButtonLink>
        </div>
        {skill.deprecated && (
          <p role="note" className="col-span-full rounded-wobbly border-[1.3px] border-dashed border-peach-ink/50 bg-peach/30 px-4 py-3 text-sm">
            <strong>Deprecated.</strong> {typeof skill.deprecated === "string" ? skill.deprecated : "This skill is no longer maintained."}
          </p>
        )}
      </PaperCard>
    </>
  );
}

function Meta({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon} className="size-[15px] text-muted" />
      <dt className="sr-only">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function SkillMetadata({ skill, category }: { skill: Skill; category?: Category }) {
  const rows: [string, ReactNode][] = [
    ["Version", skill.version],
    ["Category", <Link key="c" href={`/categories/${skill.category}`} className="hover:underline">{category?.title ?? skill.category}</Link>],
    ["License", skill.license],
    ["Author", skill.author],
    ["Added", formatDate(skill.createdAt)],
    ["Updated", formatDate(skill.updatedAt)],
  ];
  return (
    <PaperCard variant="flat" className="p-5">
      <p className="mb-1 font-hand text-xl">Details</p>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-t border-dashed border-line-2 py-2 text-sm first:border-0">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-mono text-[13px]">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mb-2 mt-3 font-hand text-lg">Works with</p>
      <div className="flex flex-wrap gap-1.5">
        {skill.platforms.map((p) => <SkillBadge key={p}>{PLATFORMS[p] ?? p}</SkillBadge>)}
      </div>
    </PaperCard>
  );
}

/** Section wrapper with an anchor id and a hand-written heading. */
export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="min-w-0 border-t border-dashed border-line-2 pt-7 first:border-0 first:pt-0">
      <h2 id={`${id}-h`} className="mb-3 text-[27px] leading-tight">
        <a href={`#${id}`} className="group">
          {title}
          <span className="ml-2 text-muted opacity-0 transition group-hover:opacity-100" aria-hidden>#</span>
        </a>
      </h2>
      {children}
    </section>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="grid grid-cols-[minmax(0,1fr)] gap-4 [counter-reset:step]">{children}</ol>;
}

function Step({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <li className="flex gap-3.5 [counter-increment:step]">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-[48%_52%_45%_55%/55%_45%_55%_45%] border-[1.6px] border-ink-2 font-hand text-lg before:content-[counter(step)]"
        aria-hidden
      />
      <div className="min-w-0 flex-1 pt-1">
        <p className="font-medium">{title}</p>
        {children && <div className="mt-1 text-sm text-ink-2">{children}</div>}
      </div>
    </li>
  );
}

const CLONE = "git clone --depth 1 https://github.com/velonx/agent-skills.git";

/** Per-platform manual install steps, plus the (not yet available) CLI. */
export function InstallationBlock({ skill }: { skill: Skill }) {
  const n = skill.name;
  const folder = `agent-skills/skills/${n}`;
  const getIt = (
    <Step title="Get the skill folder">
      <CommandLine command={CLONE} />
      The skill is <code>{folder}/</code>. Or <a href={skillTree(n)} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">open it on GitHub</a> and download the files.
    </Step>
  );
  const ask = <Step title="Ask for the task in your own words">The agent follows the skill when your request matches it. You can also name it: “use {n}”.</Step>;

  const panels: Record<string, ReactNode> = {
    generic: (
      <Steps>
        {getIt}
        <Step title="Give SKILL.md to your agent as instructions">
          Add it to the system prompt, custom instructions or rules file your agent reads. Keep the rest of the folder next to it if the skill refers to examples or scripts.
        </Step>
        {ask}
      </Steps>
    ),
    claude: (
      <Steps>
        {getIt}
        <Step title="Claude Code: copy it into a skills folder">
          <CommandLine command={`cp -R ${folder} ~/.claude/skills/`} />
          Use <code>.claude/skills/</code> inside a project instead to share it with your team through git.
        </Step>
        <Step title="Claude apps: upload it">Zip the folder and upload it under Settings → Capabilities → Skills.</Step>
        {ask}
      </Steps>
    ),
    openai: (
      <Steps>
        {getIt}
        <Step title="ChatGPT: add it to a GPT or project">
          Paste <code>SKILL.md</code> into the instructions, and upload files from the folder as knowledge if the skill uses them.
        </Step>
        <Step title="API: send it as instructions">Use <code>SKILL.md</code> as the system / developer message, or as agent instructions in your SDK.</Step>
        {ask}
      </Steps>
    ),
    gemini: (
      <Steps>
        {getIt}
        <Step title="Gemini app: create a Gem">Paste <code>SKILL.md</code> into the Gem’s instructions.</Step>
        <Step title="Gemini CLI or API">
          Add the contents to your project’s <code>GEMINI.md</code>, or pass it as the <code>system_instruction</code> in the API.
        </Step>
        {ask}
      </Steps>
    ),
    cursor: (
      <Steps>
        {getIt}
        <Step title="Add it as a project rule">
          Create <code>.cursor/rules/{n}.mdc</code> and paste the body of <code>SKILL.md</code>. Use the skill’s description as the rule description so the agent applies it when relevant.
        </Step>
        <Step title="Keep the folder in your repo">Only needed if the skill refers to examples or scripts.</Step>
        {ask}
      </Steps>
    ),
  };

  const order = ["generic", "claude", "openai", "gemini", "cursor"].filter((p) => skill.platforms.includes(p));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="rounded-wobbly flex flex-wrap items-center gap-x-3 gap-y-2 border-[1.3px] border-dashed border-line-2 bg-paper-2/60 px-4 py-3 text-sm text-muted">
        <span className="rounded-pill border border-peach-ink/40 px-2 font-hand text-[15px] text-peach-ink">coming soon</span>
        <span>Velonx CLI:</span>
        <code aria-disabled className="break-all">velonx install {n}</code>
      </div>
      <Tabs label="Install for" tabs={order.map((p) => ({ id: p, label: PLATFORMS[p], content: panels[p] }))} />
      <p className="text-[13px] text-muted">Agents move these settings between versions — if a path doesn’t match, check your agent’s docs.</p>
    </div>
  );
}

export function RequirementsBlock({ skill, dependencies }: { skill: Skill; dependencies: Skill[] }) {
  return (
    <div className="grid gap-4 text-ink-2">
      <div>
        <p className="font-medium text-ink">Your agent needs</p>
        {skill.requirements.length ? (
          <ul className="mt-1.5 grid gap-1">
            {skill.requirements.map((r) => (
              <li key={r} className="flex items-center gap-2"><Icon name="check" className="size-4 text-green" />{REQUIREMENTS[r] ?? r}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Nothing beyond reading instructions.</p>
        )}
      </div>
      {skill.compatibility && <p><span className="font-medium text-ink">Environment: </span>{skill.compatibility}</p>}
      {dependencies.length > 0 && (
        <p>
          <span className="font-medium text-ink">Builds on: </span>
          {dependencies.map((d, i) => (
            <span key={d.name}>{i > 0 && ", "}<Link href={`/skills/${d.name}`} className="underline underline-offset-4">{d.title}</Link></span>
          ))}
        </p>
      )}
      <div>
        <p className="font-medium text-ink">Written for</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {skill.platforms.map((p) => <SkillBadge key={p}>{PLATFORMS[p] ?? p}</SkillBadge>)}
        </div>
      </div>
    </div>
  );
}

export function FilesBlock({ skill }: { skill: Skill }) {
  const dir = skill.path.replace(/SKILL\.md$/, "");
  return (
    <ul className="overflow-hidden rounded-lg border border-line">
      {skill.files.map((f) => (
        <li key={f} className="border-t border-dashed border-line first:border-0">
          <a
            href={repoFile(dir + f)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-paper px-4 py-2.5 font-mono text-[13.5px] hover:bg-paper-2"
          >
            <Icon name={f === "SKILL.md" ? "doc" : "folder"} className="size-4 text-muted" />
            {f}
            <Icon name="arrow" className="ml-auto size-3.5 -rotate-45 text-muted" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContributingBlock({ skill, issueUrl }: { skill: Skill; issueUrl: string }) {
  return (
    <div className="text-ink-2">
      <p>This skill lives in <a href={SKILLS_REPO} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">velonx/agent-skills</a>. Improvements go through a pull request, reviewed by maintainers.</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <ButtonLink href={skillEditUrl(skill.path)} external><Icon name="pen" /> Edit this skill</ButtonLink>
        <ButtonLink href={issueUrl} variant="ghost" external><Icon name="plus" /> Report a problem</ButtonLink>
        <ButtonLink href={repoFile("CONTRIBUTING.md")} variant="ghost" external><Icon name="book" /> Contributing guide</ButtonLink>
      </div>
    </div>
  );
}
