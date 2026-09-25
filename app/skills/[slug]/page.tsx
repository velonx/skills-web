import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { TableOfContents } from "@/components/client";
import { Markdown } from "@/components/Markdown";
import { PaperCard } from "@/components/paper";
import {
  ContributingBlock,
  DocSection,
  FilesBlock,
  InstallationBlock,
  RequirementsBlock,
  SkillHeader,
  SkillMetadata,
} from "@/components/skill-page";
import { splitSections, stripFrontmatter, type Section } from "@/lib/markdown";
import { getAllSkills, getCategories, getSkill, getSkillSource } from "@/lib/registry";
import { SITE_URL, skillIssueUrl, skillTree } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllSkills()).map((s) => ({ slug: s.name }));
}

export async function generateMetadata({ params }: PageProps<"/skills/[slug]">): Promise<Metadata> {
  const skill = await getSkill((await params).slug);
  if (!skill) return {};
  const description = skill.description.length > 200 ? skill.description.slice(0, 197) + "…" : skill.description;
  const url = `/skills/${skill.name}`;
  return {
    title: skill.title,
    description,
    keywords: skill.tags,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: `${skill.title} — Velonx Skills`, description },
    twitter: { card: "summary", title: `${skill.title} — Velonx Skills`, description },
    ...(skill.deprecated && { robots: { index: false } }),
  };
}

// Where each part goes. Sections the skill author wrote come from SKILL.md; the rest is generated from metadata.
const BEFORE_INSTALL = ["overview", "when to use"];
const AFTER_INSTALL = ["usage", "examples"];
const MERGED_INTO_REQUIREMENTS = ["requirements", "compatibility"];

export default async function SkillPage({ params }: PageProps<"/skills/[slug]">) {
  const skill = await getSkill((await params).slug);
  if (!skill) notFound();
  const [source, categories, all] = await Promise.all([getSkillSource(skill), getCategories(), getAllSkills()]);
  const category = categories.find((c) => c.id === skill.category);
  const { intro, sections } = splitSections(stripFrontmatter(source));

  const used = new Set<Section>();
  const take = (title: string) => {
    const s = sections.find((x) => x.title.toLowerCase() === title && !used.has(x));
    if (s) used.add(s);
    return s;
  };
  const md = (s?: Section) => (s?.body ? <Markdown source={s.body} skillName={skill.name} /> : null);
  const parts: { id: string; title: string; content: ReactNode }[] = [];
  const add = (s?: Section) => s && parts.push({ id: s.id, title: s.title, content: md(s) });

  const overview = take("overview");
  parts.push({
    id: overview?.id ?? "overview",
    title: "Overview",
    content: (
      <>
        {intro && <Markdown source={intro} skillName={skill.name} />}
        {md(overview) ?? (!intro && <p className="text-ink-2">{skill.description}</p>)}
      </>
    ),
  });
  BEFORE_INSTALL.slice(1).forEach((t) => add(take(t)));
  const installExtra = take("installation");
  parts.push({ id: "installation", title: "Installation", content: <><InstallationBlock skill={skill} />{md(installExtra)}</> });
  AFTER_INSTALL.forEach((t) => add(take(t)));
  const reqExtra = MERGED_INTO_REQUIREMENTS.map(take);
  const dependencies = all.filter((s) => skill.dependencies?.includes(s.name));
  parts.push({
    id: "requirements",
    title: "Requirements & compatibility",
    content: <><RequirementsBlock skill={skill} dependencies={dependencies} />{reqExtra.map((s) => s && <div key={s.id} className="mt-4">{md(s)}</div>)}</>,
  });
  const changelog = take("changelog");
  sections.filter((s) => !used.has(s)).forEach(add); // Limitations and anything custom, in the author's order
  parts.push({ id: "files", title: "Files", content: <FilesBlock skill={skill} /> });
  add(changelog);
  parts.push({ id: "contributing", title: "Contributing", content: <ContributingBlock skill={skill} issueUrl={skillIssueUrl(skill.name)} /> });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: skill.title,
    description: skill.description,
    url: `${SITE_URL}/skills/${skill.name}`,
    codeRepository: skillTree(skill.name),
    version: skill.version,
    license: `https://spdx.org/licenses/${skill.license}.html`,
    author: { "@type": "Organization", name: skill.author },
    keywords: skill.tags.join(", "),
    ...(skill.createdAt && { dateCreated: skill.createdAt }),
    ...(skill.updatedAt && { dateModified: skill.updatedAt }),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SkillHeader skill={skill} category={category} source={source} />
      <div className="mt-[26px] grid grid-cols-[minmax(0,1fr)_260px] items-start gap-[26px] max-xl:grid-cols-[minmax(0,1fr)]">
        <PaperCard className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 p-8 max-sm:px-[18px] max-sm:py-6">
          {parts.map((p) => (
            <DocSection key={p.id} id={p.id} title={p.title}>{p.content}</DocSection>
          ))}
        </PaperCard>
        <aside className="sticky top-[104px] grid gap-5 max-xl:static max-xl:row-start-1" aria-label="Skill details">
          <SkillMetadata skill={skill} category={category} />
          <div className="max-xl:hidden">
            <TableOfContents items={parts.map(({ id, title }) => ({ id, title }))} />
          </div>
        </aside>
      </div>
    </article>
  );
}
