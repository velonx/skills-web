import Link from "next/link";
import type { Category, Skill } from "@/lib/registry";
import { formatDate } from "@/lib/format";
import { Icon } from "./Icon";
import { PaperCard, Tag } from "./paper";

const TONE: Record<string, string> = {
  development: "bg-tone-blue",
  research: "bg-tone-green",
  data: "bg-tone-sand",
  writing: "bg-tone-peach",
  devops: "bg-tone-lilac",
  productivity: "bg-tone-rose",
  ai: "bg-tone-green",
  documents: "bg-tone-sand",
  other: "bg-tone-blue",
};

/** Coloured icon square. Colour comes from the category. */
export function SkillTile({ icon, category, size = "md" }: { icon?: string; category: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-[68px] max-sm:size-14" : "size-[42px]";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[11px_14px_10px_13px/13px_10px_14px_11px] border-[1.3px] border-ink/15 text-ink ${box} ${TONE[category] ?? TONE.other}`}
    >
      <Icon name={icon ?? "doc"} className={size === "lg" ? "size-8" : "size-[22px]"} />
    </span>
  );
}

export function SkillBadge({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "green" }) {
  const cls = tone === "green" ? "border-green/50 bg-green-soft text-green-2" : "border-line-2";
  return <span className={`rounded-pill inline-flex items-center gap-1 border-[1.2px] px-2.5 py-0.5 font-mono text-xs ${cls}`}>{children}</span>;
}

export function SkillCard({ skill, categoryTitle }: { skill: Skill; categoryTitle?: string }) {
  return (
    <PaperCard
      as={Link}
      href={`/skills/${skill.name}`}
      variant="flat"
      className="flex flex-col gap-2 p-5 transition-transform duration-300 hover:-translate-y-[3px] hover:-rotate-[.5deg] even:hover:rotate-[.5deg]"
    >
      <SkillTile icon={skill.icon} category={skill.category} />
      <h3 className="mt-1.5 text-[21px] leading-tight">{skill.title}</h3>
      <p className="line-clamp-3 text-[13.5px] leading-relaxed text-ink-2">{skill.description}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {skill.tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-dashed border-line-2 pt-3 gap-2 font-mono text-[12.5px] text-ink-2">
        <span className="truncate">{categoryTitle ?? skill.category}</span>
        <span>v{skill.version}</span>
      </div>
    </PaperCard>
  );
}

export function SkillGrid({ skills, categories }: { skills: Skill[]; categories: Category[] }) {
  const title = (id: string) => categories.find((c) => c.id === id)?.title;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-[18px]">
      {skills.map((s) => <SkillCard key={s.name} skill={s} categoryTitle={title(s.category)} />)}
    </div>
  );
}

/** Compact row for side lists (Latest Skills). */
export function SkillRow({ skill, categoryTitle }: { skill: Skill; categoryTitle?: string }) {
  return (
    <Link href={`/skills/${skill.name}`} className="group flex items-center gap-3.5 py-3">
      <SkillTile icon={skill.icon} category={skill.category} />
      <div className="min-w-0">
        <h4 className="truncate text-[14.5px] font-medium group-hover:underline group-hover:underline-offset-3">{skill.title}</h4>
        <div className="mt-0.5 flex items-center gap-2.5 font-mono text-xs text-muted">
          <Tag>{categoryTitle?.split(" ")[0] ?? skill.category}</Tag>v{skill.version}
        </div>
      </div>
      <time dateTime={skill.createdAt ?? undefined} className="ml-auto self-end whitespace-nowrap font-mono text-xs text-muted">
        {formatDate(skill.createdAt).replace(/, \d{4}$/, "")}
      </time>
    </Link>
  );
}

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="rounded-wobbly flex items-center gap-3 border-[1.3px] border-line bg-paper px-4 py-3 text-[14.5px] shadow-paper-sm transition hover:-translate-y-px hover:-rotate-[.4deg] hover:border-green hover:bg-green-soft"
    >
      <Icon name={category.icon} className="size-[18px] text-ink-2" />
      {category.title}
      <span className="ml-auto font-mono text-xs text-muted">{count}</span>
    </Link>
  );
}
