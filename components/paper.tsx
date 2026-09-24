import Link from "next/link";
import type { ComponentProps, ElementType, ReactNode } from "react";
import { Icon } from "./Icon";

type PaperProps<T extends ElementType> = {
  as?: T;
  variant?: "torn" | "flat" | "sticky";
  tape?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<T>, "as" | "className" | "children">;

/** The basic surface. `torn` for page sections, `flat` for cards inside them, `sticky` for notes. */
export function PaperCard<T extends ElementType = "div">({ as, variant = "torn", tape, className = "", children, ...rest }: PaperProps<T>) {
  const Tag = as ?? "div";
  const v = variant === "flat" ? "paper-flat" : variant === "sticky" ? "paper-sticky" : "";
  return (
    <Tag className={`paper ${v} ${className}`} {...rest}>
      {tape && <span className="tape" aria-hidden />}
      {children}
    </Tag>
  );
}

/** A section heading with a hand-written title, optional icon and a "View all" link. */
export function NotebookSection({
  title,
  icon,
  href,
  linkLabel = "View all",
  level = 2,
  children,
  className = "",
}: {
  title: string;
  icon?: string;
  href?: string;
  linkLabel?: string;
  level?: 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <H className={`flex items-center gap-2.5 ${level === 2 ? "text-[27px]" : "text-[22px]"} leading-tight`}>
          {icon && <Icon name={icon} className={level === 2 ? "size-6" : "size-5"} />}
          {title}
        </H>
        {href && <ArrowLink href={href}>{linkLabel}</ArrowLink>}
      </div>
      {children}
    </section>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 font-hand text-[16.5px] text-ink-2 underline decoration-1 underline-offset-4 hover:text-ink">
      {children}
      <Icon name="arrow" className="size-[15px] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-[6px_8px_6px_7px] border border-line bg-paper-2 px-2 py-px text-[12.5px] text-ink-2">
      {children}
    </span>
  );
}

export function Chip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-pill inline-flex items-center border-[1.4px] border-line-2 bg-paper px-3.5 py-0.5 font-hand text-[16.5px] text-ink-2 transition hover:-rotate-2 hover:border-green hover:bg-green-soft hover:text-ink"
    >
      {children}
    </Link>
  );
}

const BUTTON = {
  primary: "btn-ink border-green-2 bg-green text-on-green hover:bg-green-2",
  ghost: "border-line-2 bg-paper hover:border-ink-2",
};

export function ButtonLink({
  href,
  variant = "primary",
  external,
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof BUTTON;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const cls = `rounded-wobbly inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border-[1.5px] px-5 font-medium ${BUTTON[variant]} ${className}`;
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}

export function GitHubButton({ href, children = "GitHub" }: { href: string; children?: ReactNode }) {
  return (
    <ButtonLink href={href} variant="ghost" external>
      <Icon name="github" /> {children}
    </ButtonLink>
  );
}
