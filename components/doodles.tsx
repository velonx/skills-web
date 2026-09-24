// Hand-drawn illustrations. Decorative only (aria-hidden).

/** SVG filters used by .paper (torn edges) and doodles (wobbly lines). Render once in the layout. */
export function PaperFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves={2} seed={4} />
        <feDisplacementMap in="SourceGraphic" scale={5} />
      </filter>
      <filter id="wobble">
        <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves={1} seed={2} />
        <feDisplacementMap in="SourceGraphic" scale={2.2} />
      </filter>
    </svg>
  );
}

export function Robot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 140" className={`text-ink ${className}`} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" filter="url(#wobble)">
        <path d="M26 14l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
        <path d="M16 96l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" />
        <path d="M130 70h8M134 66v8" />
        <g transform="rotate(9 130 30)">
          <rect x="110" y="6" width="36" height="42" rx="3" fill="var(--paper)" />
          <path d="M117 16h22M117 23h22M117 30h14" />
          <rect x="117" y="36" width="8" height="5" />
        </g>
        <rect x="30" y="41" width="7" height="16" rx="3" fill="var(--paper)" />
        <rect x="89" y="41" width="7" height="16" rx="3" fill="var(--paper)" />
        <rect x="36" y="24" width="54" height="46" rx="21" fill="var(--paper)" />
        <rect x="43" y="34" width="40" height="26" rx="12" fill="var(--ink)" />
        <ellipse cx="56" cy="47" rx="3.2" ry="4.4" fill="var(--paper)" stroke="none" />
        <ellipse cx="70" cy="47" rx="3.2" ry="4.4" fill="var(--paper)" stroke="none" />
        <path d="M42 74c10-4 32-4 42 0l6 42H38z" fill="var(--paper)" />
        <path d="M62 84l56-8-3 38-56 6z" fill="var(--paper)" />
        <circle cx="89" cy="97" r="3" />
        <path d="M52 124l74-7 7 4-74 8z" fill="var(--paper)" />
        <path d="M44 90c3 12 10 16 20 16" />
      </g>
    </svg>
  );
}

const LEAVES = [
  "M30 132c-10-2-18-9-22-18 10 1 18 8 22 18z", "M31 124c9-3 17-11 20-20-10 2-17 9-20 20z",
  "M30 110c-9-2-16-9-20-17 9 1 16 7 20 17z", "M31 101c8-3 15-10 18-18-9 2-15 8-18 18z",
  "M31 88c-8-2-14-8-17-15 8 1 14 6 17 15z", "M32 80c7-3 13-9 15-16-8 2-13 7-15 16z",
  "M32 66c-7-2-12-7-14-13 7 1 12 5 14 13z", "M33 58c6-3 11-8 13-14-7 2-11 6-13 14z",
  "M33 44c-6-2-10-6-12-11 6 1 10 4 12 11z", "M34 37c5-2 9-6 10-11-5 1-9 5-10 11z",
  "M34 25c-4-2-7-5-8-9 4 1 7 3 8 9z", "M35 19c4-2 6-5 7-8-4 1-6 3-7 8z",
];

export function Fern({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 150" className={`pointer-events-none absolute ${className}`} aria-hidden>
      <path d="M31 148C29 110 29 64 35 4" fill="none" stroke="#7c8b5c" strokeWidth={1.5} strokeLinecap="round" />
      <g fill="#8d9c6c" opacity={0.92}>
        {LEAVES.map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}

export function PaperPlane({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 50" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 8L56 4 50 22z" />
        <path d="M40 8l10 14" />
        <path d="M36 14C22 18 12 28 8 44" strokeDasharray="3 4" />
      </g>
    </svg>
  );
}
