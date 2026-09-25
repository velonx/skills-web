import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillBrowser } from "@/components/SkillBrowser";
import { SkillGrid } from "@/components/skill";
import { getCategories, getSkills } from "@/lib/registry";
import { filterSkills } from "@/lib/search";

export const metadata: Metadata = {
  title: "All Skills",
  description: "Browse every open-source AI agent skill in the Velonx registry. Filter by category, platform and license.",
  alternates: { canonical: "/skills" },
};

export default async function SkillsPage() {
  const [skills, categories] = await Promise.all([getSkills(), getCategories()]);
  return (
    <>
      <header className="mb-6 mt-1.5">
        <h1 className="text-[clamp(36px,4vw,50px)] leading-tight">All Skills</h1>
        <p className="mt-2 max-w-[62ch] text-[16.5px] text-ink-2">
          Every skill is a folder with a <code>SKILL.md</code>. Read it before you install it.
        </p>
      </header>
      {/* Server-rendered list for crawlers and no-JS; the browser takes over once URL filters are known. */}
      <Suspense fallback={<SkillGrid skills={filterSkills(skills, {})} categories={categories} />}>
        <SkillBrowser skills={skills} categories={categories} />
      </Suspense>
    </>
  );
}
