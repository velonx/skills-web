import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaperCard } from "@/components/paper";
import { SkillBrowser } from "@/components/SkillBrowser";
import { SkillGrid, SkillTile } from "@/components/skill";
import { getCategories, getSkills } from "@/lib/registry";
import { filterSkills } from "@/lib/search";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCategories()).find((x) => x.id === slug);
  if (!c) return {};
  return {
    title: `${c.title} skills`,
    description: `${c.description} Open-source AI agent skills in ${c.title}.`,
    alternates: { canonical: `/categories/${c.id}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const [skills, categories] = await Promise.all([getSkills(), getCategories()]);
  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();
  const inCat = skills.filter((s) => s.category === slug);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3.5 text-[13.5px] text-muted">
        <Link href="/categories" className="hover:text-ink hover:underline">Categories</Link> / <span className="text-ink-2">{category.title}</span>
      </nav>
      <PaperCard className="mb-[26px] flex items-center gap-5 p-7 max-sm:px-[18px]">
        <SkillTile icon={category.icon} category={category.id} size="lg" />
        <div>
          <h1 className="text-[clamp(34px,3.6vw,46px)] leading-tight">{category.title}</h1>
          <p className="mt-1 text-ink-2">{category.description}</p>
          <p className="mt-1 font-mono text-xs text-muted">{inCat.length} skill{inCat.length === 1 ? "" : "s"}</p>
        </div>
      </PaperCard>
      <Suspense fallback={<SkillGrid skills={filterSkills(inCat, {})} categories={categories} />}>
        <SkillBrowser skills={inCat} categories={categories} lockedCategory={category.id} />
      </Suspense>
    </>
  );
}
