import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { SKILLS_RAW, SKILLS_REPO } from "@/lib/site";
import { CopyButton } from "./client";

// Skill content is untrusted: raw HTML is not rendered (react-markdown default), and
// defaultUrlTransform still strips javascript: and similar URLs after we resolve relative links.

const text = (node: React.ReactNode): string =>
  typeof node === "string" ? node : Array.isArray(node) ? node.map(text).join("") : "";

const components: Components = {
  h3: ({ children }) => <h3 className="mb-2 mt-6 text-[22px]">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-1.5 mt-5 font-semibold">{children}</h4>,
  p: ({ children }) => <p className="my-3 text-ink-2">{children}</p>,
  ul: ({ children }) => <ul className="my-3 grid grid-cols-[minmax(0,1fr)] list-disc gap-1.5 pl-6 text-ink-2 marker:text-muted">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 grid grid-cols-[minmax(0,1fr)] list-decimal gap-1.5 pl-6 text-ink-2 marker:font-hand marker:text-muted">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&>ol]:my-1.5 [&>ul]:my-1.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  blockquote: ({ children }) => <blockquote className="my-4 border-l-[3px] border-peach bg-paper-2 px-5 py-1">{children}</blockquote>,
  hr: () => <hr className="scribble my-6" />,
  a: ({ href = "", children }) => {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className="text-ink underline decoration-green/60 decoration-1 underline-offset-4 hover:decoration-green"
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    );
  },
  // eslint-disable-next-line @next/next/no-img-element -- remote user content, sizes unknown
  img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="my-4 max-w-full rounded" />,
  pre: ({ children }) => {
    const code = text((children as React.ReactElement<{ children?: React.ReactNode }>)?.props?.children).replace(/\n$/, "");
    return (
      <div className="relative my-4">
        <pre className="overflow-x-auto rounded-[6px_9px_6px_8px] border border-line bg-paper-2 p-4 pr-12 font-mono text-[13px] leading-relaxed [&_code]:!bg-transparent [&_code]:!p-0">
          {children}
        </pre>
        <div className="absolute right-2 top-2"><CopyButton text={code} label="Copy code" /></div>
      </div>
    );
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b-[1.5px] border-line-2 px-3 py-2 text-left font-hand text-lg font-normal">{children}</th>,
  td: ({ children }) => <td className="border-b border-dashed border-line px-3 py-2 align-top text-ink-2">{children}</td>,
};

/** Render Markdown from a skill. Relative links point at the skill's folder on GitHub; images load from raw. */
export function Markdown({ source, skillName }: { source: string; skillName: string }) {
  const base = `skills/${skillName}/`;
  const urlTransform = (url: string, key: string) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)) return defaultUrlTransform(url);
    const root = key === "src" ? `${SKILLS_RAW}/` : `${SKILLS_REPO}/blob/main/`;
    return defaultUrlTransform(new URL(url, root + base).href);
  };
  return (
    <div className="min-w-0 text-[15px] leading-relaxed [overflow-wrap:anywhere] [&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlTransform}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
