export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
