const TONES: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  ready_for_dispatch: "bg-indigo-100 text-indigo-800",
  delivered: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status] ?? "bg-neutral-100 text-neutral-700";
  const label = status.replace(/_/g, " ");

  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tone}`}>
      {label}
    </span>
  );
}
