"use client";
// Small interactive bits. Everything else renders on the server.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

export function NavLink({ href, icon, children, small }: { href: string; icon: string; children: ReactNode; small?: boolean }) {
  const path = usePathname();
  const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-wobbly flex items-center px-3 transition-colors ${
        small ? "h-9 gap-3 text-sm" : "h-11 gap-3.5 font-hand text-xl"
      } ${active ? "-rotate-[.6deg] bg-peach" : "hover:bg-paper-3/70"}`}
    >
      <Icon name={icon} className={`${small ? "size-[18px]" : "size-[22px]"} ${active ? "text-ink" : "text-ink-2"}`} />
      {children}
    </Link>
  );
}

/** Closes the mobile nav popover after client-side navigation. */
export function CloseNavOnRouteChange() {
  const path = usePathname();
  useEffect(() => {
    const el = document.getElementById("mobile-nav");
    if (el?.matches(":popover-open")) el.hidePopover();
  }, [path]);
  return null;
}

/** Press "/" anywhere to focus the first visible search box. */
export function SlashToSearch() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return;
      const input = [...document.querySelectorAll<HTMLInputElement>('input[type="search"]')].find((i) => i.offsetParent);
      if (!input) return;
      e.preventDefault();
      input.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  return null;
}

/** Icon follows the data-theme attribute via CSS, so no state and no hydration mismatch. */
export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("vx-theme", next);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark theme"
      className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-paper-3 hover:text-ink"
    >
      <Icon name="sun" className="size-[22px] dark:hidden" />
      <Icon name="moon" className="hidden size-[22px] dark:block" />
    </button>
  );
}

/** Icon-only by default; pass children for a labelled button. */
export function CopyButton({ text, label = "Copy", children }: { text: string; label?: string; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  const status = <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>;
  if (children)
    return (
      <button
        type="button"
        onClick={copy}
        className="rounded-wobbly inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border-[1.5px] border-line-2 bg-paper px-5 font-medium hover:border-ink-2"
      >
        <Icon name={copied ? "check" : "copy"} />
        {copied ? "Copied" : children}
        {status}
      </button>
    );
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="grid size-[30px] shrink-0 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink"
    >
      <Icon name={copied ? "check" : "copy"} className="size-4" />
      {status}
    </button>
  );
}

/** Accessible tabs (arrow keys, Home/End). Panels are rendered on the server and only hidden here. */
export function Tabs({ label, tabs }: { label: string; tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const onKey = (e: React.KeyboardEvent) => {
    const next = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = (next + tabs.length) % tabs.length;
    setActive(i);
    document.getElementById(`tab-${tabs[i].id}`)?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="mb-5 flex gap-1 overflow-x-auto border-b-[1.5px] border-line-2">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`relative whitespace-nowrap px-4 pb-2.5 pt-2 font-hand text-[19px] ${
              i === active ? "text-ink after:absolute after:inset-x-2 after:-bottom-[3px] after:h-[3px] after:rounded-full after:bg-peach-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={i !== active}>
          {t.content}
        </div>
      ))}
    </div>
  );
}

/** Sticky "On this page" list that highlights the section in view. */
export function TableOfContents({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const key = items.map((i) => i.id).join(",");
  useEffect(() => {
    const ids = key.split(",");
    // Active = last section whose top has passed just under the sticky header; the final one once at the bottom.
    const update = () => {
      let current = ids[0];
      for (const id of ids) if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 140) current = id;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = ids.at(-1)!;
      setActive(current);
    };
    const frame = requestAnimationFrame(update);
    addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
    };
  }, [key]);
  return (
    <nav aria-label="On this page">
      <p className="mb-2 font-hand text-lg">On this page</p>
      <ul className="grid">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={`block border-l-[1.5px] py-1 pl-3.5 text-sm ${
                active === i.id ? "border-peach-ink font-medium text-ink" : "border-line-2 text-ink-2 hover:border-ink-2 hover:text-ink"
              }`}
            >
              {i.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
