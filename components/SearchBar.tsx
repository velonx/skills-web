import { Icon } from "./Icon";

/** Plain GET form to /search — works without JavaScript. */
export function SearchBar({ variant = "header", defaultValue }: { variant?: "header" | "hero"; defaultValue?: string }) {
  const field =
    "flex flex-1 items-center gap-3 border-[1.5px] border-line-2 bg-paper px-4 text-muted transition focus-within:border-green focus-within:ring-4 focus-within:ring-green/15";
  const input = "min-w-0 flex-1 bg-transparent font-hand text-lg text-ink outline-none placeholder:text-muted";

  if (variant === "hero") {
    return (
      <form action="/search" role="search" className="mx-auto flex w-full max-w-[660px] max-sm:flex-col max-sm:gap-2.5">
        <label className={`${field} h-[52px] rounded-[12px_0_0_14px/14px_0_0_12px] sm:border-r-0 max-sm:rounded-wobbly`}>
          <Icon name="search" />
          <input type="search" name="q" defaultValue={defaultValue} placeholder="Search skills…" aria-label="Search skills" className={input} />
        </label>
        <button
          type="submit"
          className="btn-ink inline-flex h-[52px] items-center justify-center gap-2 rounded-[0_13px_11px_0/0_11px_13px_0] border-[1.5px] border-green-2 bg-green px-6 font-hand text-[19px] text-on-green hover:bg-green-2 max-sm:rounded-wobbly"
        >
          Search <Icon name="arrow" />
        </button>
      </form>
    );
  }

  return (
    <form action="/search" role="search" className={`${field} rounded-pill h-11 w-full max-w-[620px]`}>
      <Icon name="search" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search skills… (e.g. web research, code review, pdf)"
        aria-label="Search skills"
        className={input}
      />
      <kbd className="rounded border border-line-2 px-1.5 font-mono text-xs text-muted">/</kbd>
    </form>
  );
}
