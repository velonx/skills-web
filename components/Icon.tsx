// Stroke icons, 24×24. Registry skills pick one by name via `metadata.icon`.
const PATHS = {
  home: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  send: "M21 3L10 14M21 3l-6.5 18-4.5-7-7-4.5z",
  book: "M2.5 5.5c3-1.5 6.5-1.5 9.5 1 3-2.5 6.5-2.5 9.5-1v13.5c-3-1.5-6.5-1.5-9.5 1-3-2.5-6.5-2.5-9.5-1zM12 6.5V20",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20.5 20.5L16 16",
  chart: "M4 20h16M6.5 20v-5h3v5M10.5 20V9h3v11M14.5 20V5h3v15",
  pen: "M4 20l4.5-1 11-11-3.5-3.5-11 11zM14 6.5L17.5 10",
  cloud: "M7 18.5a4.2 4.2 0 0 1-.6-8.4 6 6 0 0 1 11.6 1.6 3.4 3.4 0 0 1-.4 6.8z",
  bolt: "M13 2.5L4.5 14H11l-1 7.5L18.5 10H12z",
  spark: "M12 3l1.8 5.6L19.5 10.5 13.8 12.4 12 18l-1.8-5.6L4.5 10.5l5.7-1.9zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z",
  github:
    "M15 21.5v-3.8a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 18.9 5a4.9 4.9 0 0 0-.1-3.6s-1.1-.4-3.7 1.4a12.6 12.6 0 0 0-6.6 0C5.9 1 4.8 1.4 4.8 1.4A4.9 4.9 0 0 0 4.7 5a5.2 5.2 0 0 0-1.4 3.5c0 5.1 3.1 6.3 6.1 6.7a3.4 3.4 0 0 0-.9 2.5v3.8M9 18.5c-4.3 1.3-4.3-2.2-6-2.6",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z",
  clock: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2",
  doc: "M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h5",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  mail: "M3 6h18v12H3zM3.5 6.5l8.5 6.5 8.5-6.5",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  check: "M5 12.5l4.5 4.5L19 7",
  arrow: "M4 12h15M13.5 6.5L19 12l-5.5 5.5",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  heart: "M12 20s-7.5-4.6-9.2-9.4A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 9.2 3.4C19.5 15.4 12 20 12 20z",
  menu: "M4 7h16M4 12h16M4 17h10",
  terminal: "M3.5 5h17v14h-17zM7.5 10l3 2-3 2M13 15h3.5",
  users: "M9 11a3.8 3.8 0 1 0 0-7.6A3.8 3.8 0 0 0 9 11zM2.5 20.5c0-3.8 2.9-6 6.5-6s6.5 2.2 6.5 6M16 3.6a3.8 3.8 0 0 1 0 7.2M21.5 20.5c0-2.8-1.4-4.8-3.8-5.6",
  flame: "M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.3 2.4-5.3 3.6-8.3.6 2 1.8 3 2.9 3.4 0-2.7 1.1-5.4 3.3-7.4.3 3.4 3.2 5.4 3.2 10.2 0 5-2.6 8.3-6.5 8.3z",
  plus: "M12 5v14M5 12h14",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-[18px]", label }: { name: string; className?: string; label?: string }) {
  const d = PATHS[name as IconName] ?? PATHS.doc;
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "dots" ? 3.2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} />
    </svg>
  );
}
