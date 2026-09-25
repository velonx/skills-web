import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { ButtonLink, NotebookSection, PaperCard } from "@/components/paper";
import { SkillSubmitForm } from "@/components/SkillSubmitForm";
import { getAllSkills, getCategories, getSkillSchema } from "@/lib/registry";
import { CONTRIBUTING, SKILLS_REPO, repoFile, skillRequestUrl } from "@/lib/site";
import { rulesFromSchema } from "@/lib/skill-draft";

export const metadata: Metadata = {
  title: "Submit a Skill",
  description: "Contribute a skill to the Velonx open-source registry. Draft your SKILL.md here, then open a pull request on GitHub.",
  alternates: { canonical: "/submit" },
};

const FLOW = [
  ["pen", "Draft", "Fill in the form — it checks the same rules as CI."],
  ["github", "Open on GitHub", "GitHub forks the repo and opens a pull request."],
  ["check", "Automated checks", "CI validates the schema, links and safety patterns."],
  ["users", "Review", "A maintainer reads every file and may ask for changes."],
  ["spark", "Live", "After merge the registry updates and the site rebuilds."],
] as const;

const CLI = `git clone https://github.com/<you>/agent-skills
cd agent-skills && npm install
git checkout -b add-my-skill
mkdir skills/my-skill   # then write skills/my-skill/SKILL.md
npm run validate
git add skills/my-skill && git commit -m "Add my-skill" && git push -u origin add-my-skill`;

export default async function SubmitPage() {
  const [skills, categories, schema] = await Promise.all([getAllSkills(), getCategories(), getSkillSchema()]);
  const taken = { names: skills.map((s) => s.name), titles: skills.map((s) => s.title) };

  return (
    <>
      <header className="mb-6 mt-1.5">
        <h1 className="text-[clamp(36px,4vw,50px)] leading-tight">Submit a Skill</h1>
        <p className="mt-2 max-w-[68ch] text-[16.5px] text-ink-2">
          Every skill lives in <a href={SKILLS_REPO} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">velonx/agent-skills</a> on GitHub.
          Draft your <code>SKILL.md</code> here and we&apos;ll hand it to GitHub as a pull request — reviewed in the open, like any other code.
        </p>
      </header>

      <ol className="mb-[26px] grid grid-cols-5 gap-3 max-xl:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]" aria-label="How submitting works">
        {FLOW.map(([icon, title, text], i) => (
          <li key={title} className="rounded-wobbly relative border-[1.3px] border-dashed border-line-2 bg-paper/70 px-4 py-3.5">
            <span className="flex items-center gap-2 font-hand text-lg">
              <span className="font-script text-xl text-peach-ink">{i + 1}</span>
              <Icon name={icon} className="size-4 text-ink-2" />
              {title}
            </span>
            <p className="mt-1 text-[13px] leading-snug text-ink-2">{text}</p>
          </li>
        ))}
      </ol>

      <SkillSubmitForm rules={rulesFromSchema(schema)} categories={categories} taken={taken} />

      <div className="mt-[26px] grid grid-cols-[minmax(0,1fr)_340px] items-start gap-[26px] max-xl:grid-cols-[minmax(0,1fr)]">
        <PaperCard className="p-8 max-sm:px-[18px]">
          <NotebookSection title="Prefer the command line?" icon="terminal">
            <p className="text-ink-2">Fork the repo, add your folder and run the same validator CI runs:</p>
            <CodeBlock code={CLI} />
            <p className="text-sm text-ink-2">
              Then open a pull request from your fork. Full walkthrough in the{" "}
              <a href={CONTRIBUTING} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">contributing guide</a> and the{" "}
              <a href={repoFile("SPECIFICATION.md")} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">skill specification</a>.
            </p>
          </NotebookSection>
        </PaperCard>

        <div className="grid gap-[26px]">
          <PaperCard variant="sticky" tape className="p-6 pt-8">
            <h2 className="text-[22px]">Before you submit</h2>
            <ul className="mt-3 grid gap-2.5 text-sm">
              {[
                <>The description says <em>when</em> to use it</>,
                "You tried it with a real agent",
                "No secrets, tokens or passwords",
                "Irreversible actions ask for confirmation",
                "Scripts are readable, not minified",
                "You have the right to publish it",
              ].map((t, i) => (
                <li key={i} className="flex gap-2.5">
                  <Icon name="check" className="mt-0.5 size-4 text-green" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <a href={repoFile("SECURITY.md")} className="mt-3 inline-block text-[13px] text-ink-2 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              What reviewers reject
            </a>
          </PaperCard>
          <PaperCard className="p-6">
            <h2 className="text-[22px]">Have an idea, not a skill?</h2>
            <p className="mb-4 mt-1.5 text-sm text-ink-2">Describe what you need and someone in the community may build it.</p>
            <ButtonLink href={skillRequestUrl} variant="ghost" external><Icon name="plus" /> Request a skill</ButtonLink>
          </PaperCard>
        </div>
      </div>
    </>
  );
}
