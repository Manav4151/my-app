"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";
import ExcelImport from "@/components/books/excel-import";
import { ROLE_GROUPS } from "@/lib/role";
import { RoleGate } from "@/lib/use-role";

// Import our new clean parts
import { useBookInventory } from "@/hooks/use-book-inventory";
import { BookStats } from "@/components/books/book-stats";
import { BookFilterBar } from "@/components/books/book-filters";
import { BookTable } from "@/components/books/book-table";

export default function Home() {
  const { session, pending } = useAuth();
  const logic = useBookInventory(); // All the brain power is here

  // Simple Loading/Error UI
  if (logic.loading || pending) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (logic.error) return <div className="p-8 text-center text-red-500">Error: {logic.error}</div>;
  if (!logic.data) return <div className="p-8 text-center">No data</div>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Book Inventory</h1>
            <p className="text-[var(--text-secondary)]">Manage your digital library</p>
          </div>
          {session && (
            <div className="flex gap-3">
              <RoleGate allow={ROLE_GROUPS.BOOKS_MANAGERS}>
                <ExcelImport onImportComplete={logic.refresh} />
                <Button onClick={() => logic.router.push('/books/insert')} className="bg-[var(--primary)] text-white">
                  <Plus className="w-4 h-4 mr-2" /> Insert Book
                </Button>
              </RoleGate>
            </div>
          )}
        </div>

        {/* Components */}
        <BookStats pagination={logic.data.pagination} />

        <BookFilterBar
          show={logic.showFilters}
          onToggle={() => logic.setShowFilters(!logic.showFilters)}
          filters={logic.pendingFilters}
          setFilters={logic.setPendingFilters}
          onApply={logic.applyFilters}
          onClear={logic.clearFilters}
        />

        {/* Context Bar (Delete) */}
        {logic.selectionMode && logic.selectedBooks.length > 0 && (
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl p-4 flex items-center justify-between mb-8">
            <p className="text-[var(--primary)] font-semibold">{logic.selectedBooks.length} selected</p>
            <Button onClick={logic.handleDeleteSelected} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
            </Button>
          </div>
        )}

        {/* Table */}
        <BookTable
          books={logic.data.books}
          pagination={logic.data.pagination}
          selectionMode={logic.selectionMode}
          selectedBooks={logic.selectedBooks}
          onSelectBook={logic.handleSelectBook}
          onSelectAll={logic.handleSelectAll}
          onCancelSelection={() => { logic.setSelectionMode(false); logic.setSelectedBooks([]); }}
          onStartSelection={() => logic.setSelectionMode(true)}
          onPageChange={logic.setPage}
          onView={(id) => logic.router.push(`/books/${id}`)}
        />

      </div>
    </div>
  );
}