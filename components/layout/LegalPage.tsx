export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      <div className="prose-legal mt-6 space-y-4 text-sm leading-relaxed text-neutral-700">{children}</div>
    </div>
  );
}
