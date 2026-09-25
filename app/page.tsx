import { CommandLine } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Fern, PaperPlane, Robot } from "@/components/doodles";
import { ButtonLink, Chip, NotebookSection, PaperCard } from "@/components/paper";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard, SkillGrid, SkillRow } from "@/components/skill";
import { getCategories, getSkills } from "@/lib/registry";
import { filterSkills } from "@/lib/search";
import { SKILLS_REPO } from "@/lib/site";

const POPULAR_SEARCHES = ["Web Research", "Code Review", "PDF Analysis", "Data Analysis", "GitHub", "Writing"];

export default async function Home() {
  const [skills, categories] = await Promise.all([getSkills(), getCategories()]);
  const titleOf = (id: string) => categories.find((c) => c.id === id)?.title;
  const count = (id: string) => skills.filter((s) => s.category === id).length;
  // No usage data in V1: "popular" means maintainer-featured first.
  const popular = filterSkills(skills, { sort: "popular" }).slice(0, 4);
  const latest = filterSkills(skills, { sort: "newest" }).slice(0, 5);
  const contributorsUsed = new Set(skills.map((s) => s.author)).size;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_330px] items-start gap-[26px] max-2xl:grid-cols-[minmax(0,1fr)]">
      <div className="grid gap-[26px]">
        {/* Hero */}
        <PaperCard className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-8 gap-y-6 overflow-hidden px-11 pb-10 pt-10 max-xl:grid-cols-[auto_minmax(0,1fr)] max-sm:grid-cols-1 max-sm:px-5 max-sm:text-center">
          <Robot className="h-[140px] w-[170px] max-sm:mx-auto max-sm:h-[108px] max-sm:w-[130px]" />
          <div className="self-center">
            <h1 className="text-[clamp(38px,4.4vw,54px)] leading-[1.05]">AI Agent Skills</h1>
            <p className="mt-2 max-w-[58ch] text-[16.5px] text-ink-2 max-sm:mx-auto">
              Discover, understand and use reusable skills for your AI agents. Open source. Built by the community.
            </p>
          </div>
          <div
            className="relative mt-1 w-[158px] -rotate-[5deg] self-start bg-sticky px-4 pb-3.5 pt-[22px] text-center font-script text-xl leading-snug text-ink-2 shadow-[2px_6px_14px_-8px_rgba(70,58,34,.5)] [background-image:var(--noise)] max-xl:hidden"
            aria-hidden
          >
            <span className="tape" />
            Open Source<br />Community Driven<br />Always Growing
            <Icon name="heart" className="mx-auto mt-1 size-[18px] fill-heart/25 text-heart" />
          </div>
          <div className="col-span-full">
            <SearchBar variant="hero" />
          </div>
          <div className="col-span-full flex flex-wrap items-center justify-center gap-2.5">
            <span className="mr-1 font-hand text-lg">Popular:</span>
            {POPULAR_SEARCHES.map((q) => (
              <Chip key={q} href={`/search?q=${encodeURIComponent(q)}`}>{q.toLowerCase()}</Chip>
            ))}
          </div>
          <Fern className="-bottom-[22px] right-[26px] h-[140px] w-[54px] rotate-[8deg] max-sm:hidden" />
        </PaperCard>

        <PaperCard className="p-[26px] max-sm:px-[18px]">
          <NotebookSection title="Popular Skills" icon="star" href="/skills?sort=popular">
            <SkillGrid skills={popular} categories={categories} />
          </NotebookSection>
          <NotebookSection title="Browse by Category" icon="folder" href="/categories" className="mt-9">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">
              {categories.map((c) => <CategoryCard key={c.id} category={c} count={count(c.id)} />)}
            </div>
          </NotebookSection>
        </PaperCard>

        <PaperCard className="p-[26px] max-sm:px-[18px]">
          <NotebookSection title="Use a skill in three steps" icon="terminal">
            <ol className="grid grid-cols-3 gap-6 max-xl:grid-cols-1 max-xl:gap-5">
              <Step n={1} title="Find a skill">
                Search or browse. Every skill is a readable <code>SKILL.md</code> — read it before you use it.
              </Step>
              <Step n={2} title="Copy it to your agent">
                <CommandLine command="cp -R skills/web-research ~/.claude/skills/" />
                <span className="text-[13px]">
                  <span className="rounded-pill mr-1.5 border border-peach-ink/40 px-2 font-hand text-[15px] text-peach-ink">coming soon</span>
                  <code>velonx install</code>
                </span>
              </Step>
              <Step n={3} title="Just ask">
                Your agent loads the skill when a request matches its description. No glue code.
              </Step>
            </ol>
          </NotebookSection>
          <p className="mt-4 -rotate-1 font-script text-xl text-peach-ink">works with Claude, OpenAI, Gemini, Cursor &amp; any agent that reads Markdown ↗</p>
        </PaperCard>
      </div>

      {/* Right rail */}
      <aside className="grid gap-[26px] max-2xl:grid-cols-[repeat(auto-fit,minmax(270px,1fr))]" aria-label="More">
        <PaperCard className="p-[26px] max-sm:px-[18px]">
          <NotebookSection title="Latest Skills" icon="clock" href="/skills?sort=newest" level={3}>
            <ul className="divide-y divide-dashed divide-line-2">
              {latest.map((s) => (
                <li key={s.name}><SkillRow skill={s} categoryTitle={titleOf(s.category)} /></li>
              ))}
            </ul>
          </NotebookSection>
        </PaperCard>

        <PaperCard variant="sticky" className="p-[26px] max-sm:px-[18px]">
          <h3 className="flex items-center gap-2.5 text-[22px]"><Icon name="send" className="size-5" /> Contribute a Skill</h3>
          <p className="mb-[18px] mt-2.5 max-w-[30ch] text-sm text-ink-2">Share your skills with the community and help others build better agents.</p>
          <ButtonLink href="/submit">Create a Skill <Icon name="arrow" /></ButtonLink>
          <PaperPlane className="absolute bottom-4 right-[18px] h-[50px] w-[60px] text-ink-2" />
        </PaperCard>

        <PaperCard className="p-[26px] max-sm:px-[18px]">
          <h3 className="flex items-center gap-2.5 text-[22px]"><Icon name="heart" className="size-5 fill-heart/25 text-heart" /> Powered by Open Source</h3>
          <p className="mb-4 mt-2 text-[13.5px] text-muted">Built by developers, for developers. Every skill lives on GitHub under an open license.</p>
          <dl className="mb-4 grid grid-cols-3 gap-2 border-y border-dashed border-line-2 py-3 text-center">
            <Stat label="skills" value={skills.length} />
            <Stat label="categories" value={categories.length} />
            <Stat label="authors" value={contributorsUsed} />
          </dl>
          <a href={SKILLS_REPO} className="inline-flex items-center gap-1.5 text-[13.5px] underline underline-offset-4 hover:text-ink" target="_blank" rel="noopener noreferrer">
            <Icon name="github" /> Star us on GitHub →
          </a>
        </PaperCard>
      </aside>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-[48%_52%_45%_55%/55%_45%_55%_45%] border-[1.6px] border-ink-2 font-hand text-xl" aria-hidden>
        {n}
      </span>
      <div className="min-w-0">
        <h3 className="mb-1 text-xl">{title}</h3>
        <div className="text-sm text-ink-2">{children}</div>
      </div>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-hand text-2xl leading-tight">{value}</dd>
    </div>
  );
}
