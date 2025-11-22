import { PaginationData } from "@/types/books";

export function BookStats({ pagination }: { pagination: PaginationData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <StatCard label="Total Books" value={pagination.totalBooks} color="text-[var(--primary)]" />
      <StatCard label="Current Page" value={`${pagination.currentPage} / ${pagination.totalPages}`} color="text-[var(--secondary)]" />
      <StatCard label="Showing" value={`${pagination.showing.from}-${pagination.showing.to}`} color="text-[var(--success)]" />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 text-center">
      <p className="text-sm text-[var(--text-secondary)] mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}