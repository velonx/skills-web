"use client";
// Filter + search UI shared by /skills, /search and /categories/[slug]. State lives in the URL.
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { Category, Skill } from "@/lib/registry";
import { SORTS, filterSkills, parseFilters, type SortKey } from "@/lib/search";
import { PLATFORMS, skillRequestUrl } from "@/lib/site";
import { Icon } from "./Icon";
import { Tag } from "./paper";
import { SkillCard, SkillTile } from "./skill";

type Props = {
  skills: Skill[];
  categories: Category[];
  mode?: "browse" | "search";
  /** Category pages fix the category and hide that filter. */
  lockedCategory?: string;
};

const selectCls = "rounded-wobbly min-h-10 border-[1.3px] border-line-2 bg-paper px-3 text-sm text-ink";

export function SkillBrowser({ skills, categories, mode = "browse", lockedCategory }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const listId = useId();
  const [active, setActive] = useState(-1);

  const f = parseFilters(params);
  if (lockedCategory) f.category = lockedCategory;
  const results = filterSkills(skills, f, categories);
  const sort: SortKey = f.sort ?? (f.q?.trim() ? "relevance" : "popular");
  const licenses = [...new Set(skills.map((s) => s.license))].sort();
  const titleOf = (id: string) => categories.find((c) => c.id === id)?.title ?? id;
  const filtered = !!(f.q || f.license || f.platforms?.length || (!lockedCategory && f.category));

  const set = (key: string, value?: string | string[]) => {
    const sp = new URLSearchParams(params.toString());
    sp.delete(key);
    for (const v of [value ?? []].flat()) if (v) sp.append(key, v);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    setActive(-1);
  };
  const clear = () => {
    window.history.replaceState(null, "", pathname);
    setActive(-1);
  };

  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && active >= 0 && results[active]) {
      e.preventDefault();
      router.push(`/skills/${results[active].name}`);
    } else if (e.key === "Escape" && f.q) {
      set("q");
    }
  };

  const searchInput = (
    <label
      className={`flex items-center gap-3 border-[1.5px] border-line-2 bg-paper px-4 text-muted transition focus-within:border-green focus-within:ring-4 focus-within:ring-green/15 ${
        mode === "search" ? "rounded-wobbly h-14" : "rounded-pill h-11"
      }`}
    >
      <Icon name="search" className={mode === "search" ? "size-[22px]" : undefined} />
      <input
        type="search"
        value={f.q ?? ""}
        onChange={(e) => set("q", e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={mode === "search"}
        placeholder={lockedCategory ? `Search ${titleOf(lockedCategory)}…` : "Search by name, tag, category or author…"}
        aria-label="Search skills"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className={`min-w-0 flex-1 bg-transparent font-hand text-ink outline-none placeholder:text-muted ${mode === "search" ? "text-[22px]" : "text-lg"}`}
      />
      {mode === "search" && <kbd className="rounded border border-line-2 px-1.5 font-mono text-xs max-sm:hidden">↑ ↓ ↵</kbd>}
    </label>
  );

  const sortSelect = (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort
      <select value={sort} onChange={(e) => set("sort", e.target.value)} className={selectCls}>
        {(Object.keys(SORTS) as SortKey[])
          .filter((k) => k !== "relevance" || f.q?.trim())
          .map((k) => <option key={k} value={k}>{SORTS[k]}</option>)}
      </select>
    </label>
  );

  // Compact filters: always in search mode, and on small screens in browse mode.
  const filterSelects = (
    <div className={`flex flex-wrap gap-2.5 ${mode === "browse" ? "lg:hidden" : ""}`}>
      {!lockedCategory && (
        <select aria-label="Category" value={f.category ?? ""} onChange={(e) => set("category", e.target.value)} className={selectCls}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      )}
      <select aria-label="Platform" value={f.platforms?.[0] ?? ""} onChange={(e) => set("platform", e.target.value)} className={selectCls}>
        <option value="">Any platform</option>
        {Object.entries(PLATFORMS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
      <select aria-label="License" value={f.license ?? ""} onChange={(e) => set("license", e.target.value)} className={selectCls}>
        <option value="">Any license</option>
        {licenses.map((l) => <option key={l}>{l}</option>)}
      </select>
    </div>
  );

  const count = (
    <p className="font-hand text-xl" aria-live="polite">
      {results.length} skill{results.length === 1 ? "" : "s"}
      {f.q?.trim() && <> matching “{f.q.trim()}”</>}
      {!lockedCategory && f.category && <> in {titleOf(f.category)}</>}
    </p>
  );

  const empty = (
    <div className="paper px-5 py-12 text-center">
      <p className="font-hand text-[26px]">Nothing on this page yet.</p>
      <p className="mt-1 text-muted">
        Try fewer words or filters —{" "}
        {filtered && (
          <>
            <button type="button" onClick={clear} className="underline underline-offset-4 hover:text-ink">clear them</button>, or{" "}
          </>
        )}
        <a href={skillRequestUrl} className="underline underline-offset-4 hover:text-ink" target="_blank" rel="noopener noreferrer">
          request this skill
        </a>
        .
      </p>
    </div>
  );

  const option = (i: number) => ({
    id: `${listId}-${i}`,
    role: "option" as const,
    "aria-selected": i === active,
  });

  const list =
    mode === "browse" ? (
      <ul id={listId} role="listbox" aria-label="Skills" className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
        {results.map((s, i) => (
          <li key={s.name} {...option(i)} className={`grid rounded-md ${i === active ? "ring-2 ring-green ring-offset-4 ring-offset-bg" : ""}`}>
            <SkillCard skill={s} categoryTitle={titleOf(s.category)} />
          </li>
        ))}
      </ul>
    ) : (
      <ul id={listId} role="listbox" aria-label="Search results" className="paper divide-y divide-dashed divide-line-2 px-2 py-1">
        {results.map((s, i) => (
          <li key={s.name} {...option(i)}>
            <Link
              href={`/skills/${s.name}`}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-4 rounded-md px-3 py-3.5 ${i === active ? "bg-green-soft" : "hover:bg-paper-2"}`}
            >
              <SkillTile icon={s.icon} category={s.category} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-hand text-xl leading-tight">{s.title}</span>
                  <Tag>{titleOf(s.category)}</Tag>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[13.5px] text-ink-2">{s.description}</p>
              </div>
              <span className="font-mono text-xs text-muted max-sm:hidden">v{s.version}</span>
              <Icon name="arrow" className="size-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    );

  if (mode === "search") {
    return (
      <div className="grid gap-4">
        {searchInput}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {filterSelects}
          {sortSelect}
        </div>
        {count}
        {results.length ? list : empty}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-[26px] max-lg:grid-cols-[minmax(0,1fr)]">
      <aside className="paper sticky top-[104px] grid gap-5 px-5 py-[22px] max-lg:hidden" aria-label="Filters">
        {!lockedCategory && (
          <fieldset>
            <legend className="mb-2 font-hand text-lg">Category</legend>
            <div className="grid gap-0.5">
              {[{ id: "", title: "All", icon: "grid" }, ...categories].map((c) => {
                const on = (f.category ?? "") === c.id;
                const n = c.id ? skills.filter((s) => s.category === c.id).length : skills.length;
                return (
                  <button
                    key={c.id || "all"}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("category", c.id)}
                    className={`rounded-wobbly flex items-center gap-2.5 px-2.5 py-1.5 text-left text-sm ${
                      on ? "bg-green-soft font-medium text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                    }`}
                  >
                    <Icon name={c.icon} className="size-4" />
                    {c.title}
                    <span className="ml-auto font-mono text-xs text-muted">{n}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
        <fieldset>
          <legend className="mb-2 font-hand text-lg">Works with</legend>
          {Object.entries(PLATFORMS).map(([id, label]) => (
            <label key={id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={!!f.platforms?.includes(id)}
                onChange={(e) => set("platform", e.target.checked ? [...(f.platforms ?? []), id] : f.platforms?.filter((p) => p !== id))}
                className="size-4 accent-green"
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-hand text-lg">License</legend>
          {["", ...licenses].map((l) => (
            <label key={l || "any"} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-2">
              <input type="radio" name="license" checked={(f.license ?? "") === l} onChange={() => set("license", l)} className="size-4 accent-green" />
              {l || "Any"}
            </label>
          ))}
        </fieldset>
        {filtered && (
          <button type="button" onClick={clear} className="justify-self-start text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
            Clear all filters
          </button>
        )}
      </aside>

      <div className="grid min-w-0 gap-4">
        {searchInput}
        {filterSelects}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {count}
          {sortSelect}
        </div>
        {results.length ? list : empty}
      </div>
    </div>
  );
}
