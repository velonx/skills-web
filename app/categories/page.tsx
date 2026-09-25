import type { Metadata } from "next";
import Link from "next/link";
import { PaperCard, Tag } from "@/components/paper";
import { SkillTile } from "@/components/skill";
import { getCategories, getSkills } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Categories",
  description: "AI agent skills grouped by what they do: development, research, data, writing, DevOps and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const [skills, categories] = await Promise.all([getSkills(), getCategories()]);
  return (
    <>
      <header className="mb-6 mt-1.5">
        <h1 className="text-[clamp(36px,4vw,50px)] leading-tight">Categories</h1>
        <p className="mt-2 text-[16.5px] text-ink-2">Skills, sorted into drawers. Pick one and start rummaging.</p>
      </header>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6">
        {categories.map((c) => {
          const inCat = skills.filter((s) => s.category === c.id);
          return (
            <li key={c.id} className="grid">
              <PaperCard
                as={Link}
                href={`/categories/${c.id}`}
                variant="flat"
                className="flex flex-col gap-2.5 p-6 transition-transform duration-300 hover:-translate-y-[3px] hover:-rotate-[.4deg]"
              >
                <div className="flex items-center gap-3.5">
                  <SkillTile icon={c.icon} category={c.id} />
                  <div>
                    <h2 className="text-2xl leading-tight">{c.title}</h2>
                    <span className="font-mono text-xs text-muted">{inCat.length} skill{inCat.length === 1 ? "" : "s"}</span>
                  </div>
                </div>
                <p className="text-sm text-ink-2">{c.description}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-dashed border-line-2 pt-2.5">
                  {inCat.length ? inCat.slice(0, 3).map((s) => <Tag key={s.name}>{s.name}</Tag>) : <Tag>be the first</Tag>}
                </div>
              </PaperCard>
            </li>
          );
        })}
      </ul>
    </>
  );
}
