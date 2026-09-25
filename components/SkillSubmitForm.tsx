"use client";
// Builds a SKILL.md and hands it to GitHub. Nothing is stored or sent anywhere by this site.
import { useId, useState, type ReactNode } from "react";
import type { Category } from "@/lib/registry";
import { MAX_URL, buildSkillMd, emptyDraft, githubNewFileUrl, toSlug, validateDraft, type Draft, type Rules } from "@/lib/skill-draft";
import { PLATFORMS, REQUIREMENTS } from "@/lib/site";
import { CopyButton } from "./client";
import { Icon } from "./Icon";

type Props = { rules: Rules; categories: Category[]; taken: { names: string[]; titles: string[] } };

const input =
  "rounded-wobbly w-full border-[1.5px] border-line-2 bg-paper px-3.5 py-2.5 outline-none transition placeholder:text-muted focus:border-green focus:ring-4 focus:ring-green/15 aria-[invalid=true]:border-peach-ink";

// Field order for "jump to the first problem".
const ORDER: (keyof Draft)[] = ["title", "name", "description", "category", "tags", "author", "license", "platforms"];

export function SkillSubmitForm({ rules, categories, taken }: Props) {
  const uid = useId();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [nameEdited, setNameEdited] = useState(false);
  const [touched, setTouched] = useState<Set<keyof Draft>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const d: Draft = { ...draft, name: nameEdited ? draft.name : toSlug(draft.title) };
  const errors = validateDraft(d, rules, taken, categories.map((c) => c.id));
  const valid = Object.keys(errors).length === 0;
  const content = buildSkillMd(d);
  const fullUrl = githubNewFileUrl(d.name, content);
  const tooLong = fullUrl.length > MAX_URL;
  const url = tooLong ? githubNewFileUrl(d.name) : fullUrl;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((x) => ({ ...x, [k]: v }));
  const touch = (k: keyof Draft) => setTouched((t) => new Set(t).add(k));
  const err = (k: keyof Draft) => (showAll || touched.has(k) ? errors[k] : undefined);
  const id = (k: string) => `${uid}-${k}`;
  const toggle = (k: "platforms" | "requirements", v: string) =>
    set(k, draft[k].includes(v) ? draft[k].filter((x) => x !== v) : [...draft[k], v]);

  const openGitHub = (e: React.MouseEvent) => {
    if (valid) return;
    e.preventDefault();
    setShowAll(true);
    const first = ORDER.find((k) => errors[k]);
    if (first) document.getElementById(id(first))?.focus();
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/markdown" }));
    a.download = "SKILL.md";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const field = (k: keyof Draft, label: string, control: ReactNode, hint?: ReactNode) => (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id(k)} className="font-hand text-[19px]">{label}</label>
      {control}
      {err(k) ? (
        <p id={`${id(k)}-e`} className="text-[13px] text-peach-ink">{err(k)}</p>
      ) : (
        hint && <p id={`${id(k)}-h`} className="text-[12.5px] text-muted">{hint}</p>
      )}
    </div>
  );
  const a11y = (k: keyof Draft) => ({
    id: id(k),
    "aria-invalid": !!err(k),
    "aria-describedby": err(k) ? `${id(k)}-e` : `${id(k)}-h`,
    onBlur: () => touch(k),
  });

  const checkboxes = (k: "platforms" | "requirements", options: string[], labels: Record<string, string>) => (
    <fieldset className="grid gap-1.5" aria-describedby={err(k) ? `${id(k)}-e` : undefined}>
      <legend className="mb-1.5 font-hand text-[19px]">{k === "platforms" ? "Written for" : "The agent needs"}</legend>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-4 gap-y-1">
        {options.map((o, i) => (
          <label key={o} className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-ink-2">
            <input
              id={i === 0 ? id(k) : undefined}
              type="checkbox"
              checked={draft[k].includes(o)}
              onChange={() => toggle(k, o)}
              className="size-4 accent-green"
            />
            {labels[o] ?? o}
          </label>
        ))}
      </div>
      {err(k) && <p id={`${id(k)}-e`} className="text-[13px] text-peach-ink">{err(k)}</p>}
    </fieldset>
  );

  const body = (k: "overview" | "whenToUse" | "usage" | "example", label: string, placeholder: string, rows = 3) =>
    field(k, label, <textarea {...a11y(k)} rows={rows} value={draft[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} className={`${input} font-mono text-[13.5px] leading-relaxed`} />);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,420px)] items-start gap-[26px] max-xl:grid-cols-[minmax(0,1fr)]">
      <form className="paper grid gap-6 p-8 max-sm:px-[18px] max-sm:py-6" onSubmit={(e) => e.preventDefault()} noValidate aria-label="New skill">
        <p className="font-script text-xl text-peach-ink -rotate-1">1 · the basics</p>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {field("title", "Title", <input {...a11y("title")} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Meeting Notes" className={input} maxLength={rules.titleMax} />)}
          {field(
            "name",
            "Name",
            <input
              {...a11y("name")}
              value={d.name}
              onChange={(e) => {
                setNameEdited(true);
                set("name", e.target.value.toLowerCase());
              }}
              placeholder="meeting-notes"
              className={`${input} font-mono text-[14px]`}
              spellCheck={false}
            />,
            <>Folder and id: <code>skills/{d.name || "…"}/</code>. Filled in from the title.</>,
          )}
        </div>
        {field(
          "description",
          "Description",
          <textarea
            {...a11y("description")}
            rows={3}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Turn a meeting transcript into decisions, owners and dates. Use when the user shares a transcript or asks to summarise a meeting."
            className={input}
          />,
          <>
            What it does <strong>and</strong> when to use it — agents decide from this line alone. {draft.description.trim().length}/{rules.descMax}
          </>,
        )}
        <div className="grid grid-cols-3 gap-5 max-2xl:grid-cols-2 max-md:grid-cols-1">
          {field(
            "category",
            "Category",
            <select {...a11y("category")} value={draft.category} onChange={(e) => set("category", e.target.value)} className={input}>
              <option value="">Choose one…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>,
          )}
          {field("tags", "Tags", <input {...a11y("tags")} value={draft.tags} onChange={(e) => set("tags", e.target.value)} placeholder="meetings, notes, summaries" className={input} />, `Comma-separated, up to ${rules.tagsMax}.`)}
          {field("author", "Author", <input {...a11y("author")} value={draft.author} onChange={(e) => set("author", e.target.value)} placeholder="Your name or @handle" className={input} autoComplete="name" />)}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_200px] gap-5 max-md:grid-cols-1">
          {checkboxes("platforms", rules.platforms, PLATFORMS)}
          {field(
            "license",
            "License",
            <select {...a11y("license")} value={draft.license} onChange={(e) => set("license", e.target.value)} className={input}>
              {rules.licenses.map((l) => <option key={l}>{l}</option>)}
            </select>,
            "Permissive licenses only.",
          )}
        </div>
        {checkboxes("requirements", rules.requirements, REQUIREMENTS)}

        <hr className="scribble" />
        <p className="font-script text-xl text-peach-ink -rotate-1">2 · the instructions <span className="font-sans text-sm text-muted">(optional here — you can write them on GitHub)</span></p>
        {body("overview", "Overview", "One or two sentences on what the skill does.")}
        {body("whenToUse", "When to use", "- \"Summarise this meeting\"\n- A transcript is attached\nNot for: live note-taking")}
        {body("usage", "Usage — steps for the agent", "1. Read the whole transcript first.\n2. List decisions with who made them.\n3. …", 5)}
        {body("example", "Example", "**Prompt:** \"Summarise today's standup.\"\nThe agent returns …")}
      </form>

      <aside className="sticky top-[104px] grid gap-4 max-xl:static" aria-label="Result">
        <div className="paper grid gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-hand text-xl">
              <code className="!bg-transparent !p-0 font-mono text-sm text-ink-2">skills/{d.name || "my-skill"}/</code>SKILL.md
            </p>
            <CopyButton text={content} label="Copy SKILL.md" />
          </div>
          <pre className="max-h-[420px] overflow-auto rounded-[6px_9px_6px_8px] border border-line bg-paper-2 p-4 font-mono text-[12.5px] leading-relaxed" tabIndex={0} aria-label="SKILL.md preview">
            {content}
          </pre>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openGitHub}
            aria-disabled={!valid}
            className={`btn-ink rounded-wobbly inline-flex min-h-12 items-center justify-center gap-2 border-[1.5px] border-green-2 bg-green px-5 font-hand text-[19px] text-on-green hover:bg-green-2 ${valid ? "" : "opacity-70"}`}
          >
            <Icon name="github" /> Continue on GitHub <Icon name="arrow" />
          </a>
          <button type="button" onClick={download} className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
            or download SKILL.md
          </button>
          {showAll && !valid && (
            <p role="alert" className="text-[13px] text-peach-ink">
              Fix {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s" : ""} above first.
            </p>
          )}
          {tooLong && (
            <p className="text-[13px] text-muted">
              This file is too long to pre-fill through a link. Copy it, then paste it into the GitHub editor that opens.
            </p>
          )}
          <p className="text-[12.5px] leading-snug text-muted">
            GitHub opens its editor with this file. If you can&apos;t write to the repo, it forks it and opens a pull request for you. Nothing is sent to Velonx.
          </p>
        </div>
      </aside>
    </div>
  );
}
