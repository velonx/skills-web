import { ButtonLink, PaperCard } from "@/components/paper";

export default function NotFound() {
  return (
    <PaperCard variant="sticky" tape className="mx-auto mt-10 max-w-md -rotate-1 px-8 pb-8 pt-10 text-center">
      <h1 className="text-4xl">This page got torn out.</h1>
      <p className="mt-2 text-ink-2">It may not exist yet — Velonx Skills is still being written.</p>
      <div className="mt-5 flex justify-center gap-2.5">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/skills" variant="ghost">All skills</ButtonLink>
      </div>
    </PaperCard>
  );
}
