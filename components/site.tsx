import Link from "next/link";
import type { Category } from "@/lib/registry";
import { SKILLS_REPO, repoFile } from "@/lib/site";
import { Icon } from "./Icon";
import { Fern } from "./doodles";
import { SearchBar } from "./SearchBar";
import { NavLink, ThemeToggle } from "./client";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper [background-image:var(--noise)] shadow-[0_6px_18px_-16px_rgba(60,50,30,.6)]">
      <div className="mx-auto grid h-[74px] max-w-[1560px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-7 px-8 max-lg:h-16 max-lg:grid-cols-[auto_auto_minmax(0,1fr)_auto] max-lg:gap-3.5 max-lg:px-4">
        <button
          type="button"
          popoverTarget="mobile-nav"
          aria-label="Open menu"
          className="hidden size-10 place-items-center rounded-full text-ink-2 hover:bg-paper-3 max-lg:grid"
        >
          <Icon name="menu" className="size-[22px]" />
        </button>
        <Link href="/" className="flex items-center gap-4" aria-label="Velonx Skills home">
          <span className="font-hand text-[32px] leading-none tracking-wide max-sm:text-[28px]">
            velonx<sup className="ml-px text-base text-peach-ink">*</sup>
          </span>
          <span className="h-7 w-[1.5px] rotate-[4deg] rounded bg-line-2" aria-hidden />
          <span className="font-hand text-[17px] tracking-[2.5px] text-ink-2">SKILLS</span>
        </Link>
        <div className="flex justify-center max-md:hidden">
          <SearchBar />
        </div>
        <nav className="flex items-center gap-5 justify-self-end font-hand text-lg text-ink-2" aria-label="Site">
          <a href={SKILLS_REPO} className="inline-flex items-center gap-1.5 hover:text-ink max-md:hidden" target="_blank" rel="noopener noreferrer">
            <Icon name="github" /> GitHub
          </a>
          <Link href="/docs" className="underline underline-offset-4 hover:text-ink max-md:hidden">Docs</Link>
          <Link
            href="/submit"
            className="btn-ink rounded-wobbly inline-flex h-10 items-center gap-2 border-[1.5px] border-green-2 bg-green px-4 text-on-green hover:bg-green-2 max-xl:hidden"
          >
            <Icon name="send" className="size-4" /> Submit Skill
          </Link>
          <span className="h-7 w-[1.5px] rotate-[4deg] rounded bg-line-2 max-md:hidden" aria-hidden />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

const PRIMARY_NAV = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/skills", icon: "grid", label: "All Skills" },
  { href: "/categories", icon: "folder", label: "Categories" },
  { href: "/skills?sort=popular", icon: "flame", label: "Popular" },
  { href: "/skills?sort=newest", icon: "clock", label: "Recently Added" },
  { href: "/submit", icon: "send", label: "Submit Skill" },
  { href: "/docs", icon: "book", label: "Docs" },
];

export function Sidebar({ categories, className = "" }: { categories: Category[]; className?: string }) {
  return (
    <aside className={`paper flex flex-col overflow-hidden px-[18px] pt-[22px] ${className}`}>
      <nav className="ruled grid" aria-label="Main">
        {PRIMARY_NAV.map((n) => (
          <NavLink key={n.label} href={n.href} icon={n.icon}>{n.label}</NavLink>
        ))}
      </nav>
      <hr className="scribble my-[18px]" />
      <p className="mb-2 ml-3 font-hand text-lg">Popular Categories</p>
      <nav className="grid" aria-label="Categories">
        {categories.filter((c) => c.id !== "other").map((c) => (
          <NavLink key={c.id} href={`/categories/${c.id}`} icon={c.icon} small>{c.title}</NavLink>
        ))}
      </nav>
      <hr className="scribble my-[18px]" />
      <div className="relative mt-auto min-h-[170px] pl-[50px] pt-2 font-script text-[21px] leading-snug text-ink-2">
        <p className="-rotate-[4deg]">Better agents<br />build a brighter<br />future.</p>
        <span className="mt-2.5 ml-6 flex items-center gap-1 text-muted" aria-hidden>
          — <Icon name="heart" className="size-4 fill-heart/25 text-heart" /> —
        </span>
        <Fern className="-bottom-3.5 -left-1.5 h-[150px] w-[52px] -rotate-10" />
        <Fern className="-bottom-[18px] -right-0.5 h-32 w-11 -scale-x-100 rotate-[14deg]" />
      </div>
    </aside>
  );
}

const FOOTER_LINKS = [
  ["GitHub", SKILLS_REPO],
  ["License", repoFile("LICENSE")],
  ["Contributing", repoFile("CONTRIBUTING.md")],
  ["Code of Conduct", repoFile("CODE_OF_CONDUCT.md")],
  ["Security", repoFile("SECURITY.md")],
  ["Documentation", "/docs"],
  ["Changelog", "/changelog"],
] as const;

export function Footer() {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-dashed border-ink/20 pt-5 text-[13px] text-ink-2">
      <nav className="flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Footer">
        {FOOTER_LINKS.map(([label, href]) =>
          href.startsWith("/") ? (
            <Link key={label} href={href} className="hover:text-ink hover:underline">{label}</Link>
          ) : (
            <a key={label} href={href} className="hover:text-ink hover:underline" target="_blank" rel="noopener noreferrer">{label}</a>
          ),
        )}
      </nav>
      <span className="flex items-center gap-1.5 font-hand text-[17px]">
        Maintained by the Velonx open-source community
        <Icon name="heart" className="size-4 fill-heart/25 text-heart" />
      </span>
    </footer>
  );
}
