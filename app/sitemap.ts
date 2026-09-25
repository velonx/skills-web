import type { MetadataRoute } from "next";
import { getCategories, getSkills } from "@/lib/registry";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [skills, categories] = await Promise.all([getSkills(), getCategories()]);
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/skills`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.6 },
    ...categories.map((c) => ({ url: `${SITE_URL}/categories/${c.id}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...skills.map((s) => ({ url: `${SITE_URL}/skills/${s.name}`, lastModified: s.updatedAt ?? undefined, priority: 0.8 })),
  ];
}
