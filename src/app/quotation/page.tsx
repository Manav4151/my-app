"use client";

import {
  FileText,
  Plus,
  Eye,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  User,
  ArrowUpDown, // New icon for sorting
  MoreVertical, // New icon for card menu
  ArrowDown,
  ArrowUp,
  Mail,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge"; // Assuming you have a Badge component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { apiFunctions } from "@/services/api.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/lib/use-role";
import { BookSelectionDialog } from "../components/BookSelectionDialog";
import { ROLE_GROUPS } from "@/lib/role";

// --- Type Definitions (Unchanged) ---
type Customer = {
  _id: string;
  name: string;
};

type Quotation = {
  _id: string;
  customer: Customer;
  subTotal: number;
  totalDiscount: number;
  grandTotal: number;
  status: string;
  validUntil: string;
  quotationId: string;
  createdAt: string;
  emailInfo?: {
    messageId: string;
    sender: string;
    subject: string;
    receivedAt: string;
    snippet?: string;
  };
};
type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
};


// --- Helper Functions (Unchanged) ---

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// --- Helper Components ---

// =================================================================
// === CHANGED: Updated Badge styling to match reference ===
// =================================================================
function QuotationStatusBadge({
  status,
}: {
  status: string;
}) {
  const statusStyles: { [key: string]: string } = {
    Draft: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    Sent: "bg-[var(--primary)]/20 text-[var(--primary)]",
    Accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Rejected: "bg-[var(--destructive)]/20 text-[var(--destructive)]",
  };

  const statusIcons: { [key: string]: React.ReactNode } = {
    Draft: <Clock className="w-3.5 h-3.5" />,
    Sent: <Send className="w-3.5 h-3.5" />,
    Accepted: <CheckCircle className="w-3.5 h-3.5" />,
    Rejected: <XCircle className="w-3.5 h-3.5" />,
  };

  return (
    <Badge
      // Note: Removed variant="outline" to apply background colors directly
      className={`capitalize text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-x-1.5 w-fit ${statusStyles[status]}`}
    >
      {statusIcons[status]}
      <span>{status}</span>
    </Badge>
  );
}

// (QuotationStats component is unchanged)
function QuotationStats({
  stats,
}: {
  stats: {
    total: number;
    totalValue: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-[var(--primary)]/10 rounded-xl p-4 text-center border border-[var(--primary)]/20">
        <FileText className="w-8 h-8 text-[var(--primary)] mx-auto mb-2" />
        <div className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</div>
        <div className="text-sm text-[var(--muted-foreground)]">Total Quotes</div>
      </div>
      <div className="bg-[var(--success)]/10 rounded-xl p-4 text-center border border-[var(--success)]/20">
        <DollarSign className="w-8 h-8 text-[var(--success)] mx-auto mb-2" />
        <div className="text-2xl font-bold text-[var(--text-primary)]">
          {formatCurrency(stats.totalValue)}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">Total Value</div>
      </div>
      <div className="bg-[var(--warning)]/10 rounded-xl p-4 text-center border border-[var(--warning)]/20">
        <Clock className="w-8 h-8 text-[var(--warning)] mx-auto mb-2" />
        <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.draft}</div>
        <div className="text-sm text-[var(--text-secondary)]">Draft</div>
      </div>
      <div className="bg-[var(--primary)]/10 rounded-xl p-4 text-center border border-[var(--primary)]/20">
        <CheckCircle className="w-8 h-8 text-[var(--primary)] mx-auto mb-2" />
        <div className="text-2xl font-bold text-[var(--foreground)]">
          {stats.accepted}
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">Accepted</div>
      </div>
    </div>
  );
}

// =================================================================
// === CHANGED: New QuotationCard component based on HTML reference ===
// =================================================================
function QuotationCard({ quotation }: { quotation: Quotation }) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/quotation/${quotation._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-[var(--input)] rounded-xl shadow-sm border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >

      {/* Main Info Grid */}
      <div className="flex-1 flex flex-wrap justify-between gap-4 w-full">

        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--muted-foreground)]">Quote ID</p>
          <p className="font-semibold text-[var(--foreground)]">{quotation.quotationId}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--muted-foreground)]">Customer</p>
          <p className="font-medium text-[var(--foreground)]">{quotation.customer.name}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--muted-foreground)]">Created</p>
          <p className="font-medium text-[var(--foreground)]">
            {formatDate(quotation.createdAt)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--muted-foreground)]">Valid Until</p>
          <p className="font-medium text-[var(--foreground)]">
            {formatDate(quotation.validUntil)}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-right sm:text-left">
          <p className="text-sm text-[var(--muted-foreground)]">Grand Total</p>
          <p className="font-bold text-lg text-[var(--foreground)]">
            {formatCurrency(quotation.grandTotal)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Show email icon only if emailInfo is NOT empty */}
          {quotation.emailInfo && Object.keys(quotation.emailInfo).length > 0 && (
            <Mail size={20} className="text-blue-500" />
          )}

        </div>
        <div className="flex col-span-2 sm:col-span-1 sm:justify-start justify-end items-center">
          <QuotationStatusBadge status={quotation.status} />
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] ml-auto md:ml-0 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click when clicking button
        }}
      >
        <MoreVertical className="w-5 h-5" />
      </Button>
    </div>
  );
}

// --- Main Page Component ---

export default function QuotationPage() {
  // In a real app, you would fetch this data using useEffect and useState
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Book selection dialog state
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [allQuotations, setAllQuotations] = useState<Quotation[]>([]); // Store all quotations for filtering

  const handleBooksSelected = (bookIds: string[]) => {
    const params = new URLSearchParams();
    bookIds.forEach(id => params.append("id", id));
    router.push(`/quotation/preview?${params.toString()}`);
  };

  // =================================================================
  // === NEW: useEffect to fetch data on component mount ===
  // =================================================================
  useEffect(() => {
    // Define the async function to fetch data
    async function fetchQuotations() {
      try {
        setLoading(true);
        setError(null);

        // Replace with your actual API endpoint
        const response = await apiFunctions.getQuotation();

        if (!response.success) {
          throw new Error("Failed to fetch quotations");
        }



        setAllQuotations(response.quotations); // Store all quotations
        setQuotations(response.quotations);
        setPagination(response.pagination);
      } catch (err) {
        console.error("Error fetching quotations:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    // Call the function
    fetchQuotations();
  }, []); // The empty array [] means this effect runs once when the component mounts

  // Filter and sort quotations based on search and sort state
  useEffect(() => {
    let filtered = [...allQuotations];

    // Apply search filter (by quotation ID)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((quotation) =>
        quotation.quotationId.toLowerCase().includes(query)
      );
    }

    // Apply sort (by created date)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setQuotations(filtered);
  }, [searchQuery, sortOrder, allQuotations]);

  // =================================================================
  // === UPDATED: Calculate stats from all quotations (not filtered) ===
  // =================================================================
  const stats = {
    total: pagination?.totalItems || 0,
    totalValue: allQuotations.reduce((acc, q) => acc + q.grandTotal, 0),
    draft: allQuotations.filter((q) => q.status === "Draft").length,
    sent: allQuotations.filter((q) => q.status === "Sent").length,
    accepted: allQuotations.filter((q) => q.status === "Accepted").length,
    rejected: allQuotations.filter((q) => q.status === "Rejected").length,
  };

  // =================================================================
  // === NEW: Add Loading and Error UI ===
  // =================================================================
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-[var(--destructive)]">Error: {error}</h1>
      </div>
    );
  }


  return (
    // =================================================================
    // === CHANGED: Updated main wrapper to match reference layout ===
    // =G===============================================================
    // Removed bg-gradient, min-h-screen, etc. This component
    // is now designed to fit inside a main layout container.
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ======================================================== */}
      {/* === CHANGED: New Header from HTML reference === */}
      {/* ======================================================== */}
      <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Quotations
          </h1>
          <p className="text-[var(--muted-foreground)] text-base">
            Manage and track all your quotations.
          </p>
        </div>
        <RoleGate allow={ROLE_GROUPS.QUOTATION_MANAGERS}>
          <Button className="bg-[var(--primary)] hover:opacity-90 text-white flex items-center space-x-2" onClick={() => setBookDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Create New Quotation</span>
          </Button>
        </RoleGate>
      </header>

      {/* ======================================================== */}
      {/* === CHANGED: New Filter/Search Bar from HTML reference === */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-[var(--input)] rounded-xl shadow-sm mb-6 border border-[var(--border)]">
        {/* Search Input */}
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-4 h-4" />
            <Input
              placeholder="Search by quotation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-[var(--background)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-lg"
            />
          </div>
        </div>
        {/* Filter/Sort Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-[var(--muted-foreground)]"
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          >
            {sortOrder === "newest" ? (
              <ArrowDown className="w-4 h-4 mr-2" />
            ) : (
              <ArrowUp className="w-4 h-4 mr-2" />
            )}
            <span>Sort by Date</span>
          </Button>
        </div>
      </div>

      {/* Quotation Stats (Unchanged, kept as requested) */}
      <QuotationStats stats={stats} />

      {/* Quotation List */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6">
          {searchQuery.trim()
            ? `Search Results (${quotations.length})`
            : `All Quotations (${pagination?.totalItems || 0})`}
        </h2>

        {quotations.length > 0 ? (
          // ========================================================
          // === CHANGED: New list layout (flex-col) ===
          // ========================================================
          <div className="flex flex-col gap-4">
            {quotations.map((quotation) => (
              <QuotationCard key={quotation._id} quotation={quotation} />
            ))}
          </div>
        ) : (
          // (Empty state placeholder is unchanged)
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
              No Quotations Found
            </h3>
            <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
              Get started by creating your first quotation.
            </p>
            <RoleGate allow={ROLE_GROUPS.QUOTATION_MANAGERS}>
              <Button className="bg-[var(--primary)] hover:opacity-90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New Quotation
              </Button>
            </RoleGate>
          </div>
        )}
      </div>

      {/* Book Selection Dialog for Creating Quotation */}
      <BookSelectionDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
        onBooksSelected={handleBooksSelected}
        mode="create"
        buttonText="Generate Quotation"
      />
    </div>
  );
}