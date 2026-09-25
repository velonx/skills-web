import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillBrowser } from "@/components/SkillBrowser";
import { SkillGrid } from "@/components/skill";
import { getCategories, getSkills } from "@/lib/registry";
import { filterSkills } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search open-source AI agent skills by name, tag, category or author.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  const [skills, categories] = await Promise.all([getSkills(), getCategories()]);
  return (
    <>
      <h1 className="mb-5 mt-1.5 text-[clamp(36px,4vw,50px)] leading-tight">Search skills</h1>
      <Suspense fallback={<SkillGrid skills={filterSkills(skills, {})} categories={categories} />}>
        <SkillBrowser skills={skills} categories={categories} mode="search" />
      </Suspense>
    </>
  );
}
