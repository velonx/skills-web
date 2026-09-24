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

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="grid size-[30px] shrink-0 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink"
    >
      <Icon name={copied ? "check" : "copy"} className="size-4" />
      <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
    </button>
  );
}
