import { CopyButton } from "./client";

/** One-line shell command with a copy button. */
export function CommandLine({ command }: { command: string }) {
  return (
    <div className="my-2.5 flex items-center gap-2.5 rounded-[8px_10px_7px_9px] border-[1.3px] border-dashed border-line-2 bg-paper-2 py-2 pl-3.5 pr-2 font-mono text-[13.5px]">
      <span className="font-medium text-green" aria-hidden>$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap !bg-transparent !p-0">{command}</code>
      <CopyButton text={command} label={`Copy: ${command}`} />
    </div>
  );
}

/** Multi-line code with an optional copy button. */
export function CodeBlock({ code, copy = true }: { code: string; copy?: boolean }) {
  return (
    <div className="relative my-3.5">
      <pre className="overflow-x-auto rounded-[6px_9px_6px_8px] border border-line bg-paper-2 p-5 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      {copy && (
        <div className="absolute right-2 top-2">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}
