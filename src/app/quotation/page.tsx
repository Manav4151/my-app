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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge"; // Assuming you have a Badge component
import { apiFunctions } from "@/services/api.service";
import { useEffect, useState } from "react";

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
    Draft: "bg-gray-100 text-gray-800",
    Sent: "bg-blue-100 text-blue-800",
    Accepted: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
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
      <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        <div className="text-sm text-blue-700">Total Quotes</div>
      </div>
      <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-green-900">
          {formatCurrency(stats.totalValue)}
        </div>
        <div className="text-sm text-green-700">Total Value</div>
      </div>
      <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
        <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-yellow-900">{stats.draft}</div>
        <div className="text-sm text-yellow-700">Draft</div>
      </div>
      <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
        <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-purple-900">
          {stats.accepted}
        </div>
        <div className="text-sm text-purple-700">Accepted</div>
      </div>
    </div>
  );
}

// =================================================================
// === CHANGED: New QuotationCard component based on HTML reference ===
// =================================================================
function QuotationCard({ quotation }: { quotation: Quotation }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-purple-200 hover:shadow-lg transition-all duration-300">

      {/* Main Info Grid */}
      <div className="flex-1 flex flex-wrap justify-between gap-4 w-full">

        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">Quote ID</p>
          <p className="font-semibold text-gray-800">{quotation.quotationId}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-medium text-gray-800">{quotation.customer.name}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">Created</p>
          <p className="font-medium text-gray-800">
            {formatDate(quotation.createdAt)}
          </p>
        </div>


        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="font-medium text-gray-800">
            {formatDate(quotation.createdAt)}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-right sm:text-left">
          <p className="text-sm text-gray-500">Grand Total</p>
          <p className="font-bold text-lg text-gray-900">
            {formatCurrency(quotation.grandTotal)}
          </p>
        </div>

        <div className="flex col-span-2 sm:col-span-1 sm:justify-start justify-end items-center">
          <QuotationStatusBadge status={quotation.status} />
        </div>
      </div>

      {/* Action Button */}
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600 ml-auto md:ml-0 flex-shrink-0">
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

  // =================================================================
  // === UPDATED: Calculate stats from state, with defaults ===
  // =================================================================
  const stats = {
    total: pagination?.totalItems || 0,
    totalValue: quotations.reduce((acc, q) => acc + q.grandTotal, 0),
    draft: quotations.filter((q) => q.status === "Draft").length,
    sent: quotations.filter((q) => q.status === "Sent").length,
    accepted: quotations.filter((q) => q.status === "Accepted").length,
    rejected: quotations.filter((q) => q.status === "Rejected").length,
  };

  // =================================================================
  // === NEW: Add Loading and Error UI ===
  // =================================================================
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-red-600">Error: {error}</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Quotations
          </h1>
          <p className="text-gray-600 text-base">
            Manage and track all your quotations.
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </Button>
      </header>

      {/* ======================================================== */}
      {/* === CHANGED: New Filter/Search Bar from HTML reference === */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-xl shadow-sm mb-6">
        {/* Search Input */}
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search quotations..."
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
            />
          </div>
        </div>
        {/* Filter/Sort Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" className="text-gray-600">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <span>Sort</span>
          </Button>
        </div>
      </div>

      {/* Quotation Stats (Unchanged, kept as requested) */}
      <QuotationStats stats={stats} />

      {/* Quotation List */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          All Quotations ({pagination?.totalItems})
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
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Quotations Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first quotation.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Quotation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
// "use client";

// import {
//   FileText,
//   Plus,
//   Download,
//   Edit,
//   Eye,
//   Trash2,
//   Search,
//   Filter,
//   Calendar,
//   DollarSign,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Send,
//   User,
//   CalendarDays,
// } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { Badge } from "../components/ui/badge"; // Assuming you have a Badge component

// // --- Type Definitions (Unchanged) ---
// type Customer = {
//   _id: string;
//   name: string;
// };

// type Quotation = {
//   _id: string;
//   customer: Customer;
//   subTotal: number;
//   totalDiscount: number;
//   grandTotal: number;
//   status: "Draft" | "Sent" | "Accepted" | "Rejected";
//   validUntil: string;
//   quotationId: string;
//   createdAt: string;
// };

// // --- Mock API Data (Unchanged) ---
// const mockApiResponse = {
//   message: "Quotations fetched successfully",
//   quotations: [
//     {
//       _id: "6905e49090d06ce92d94abb6",
//       customer: {
//         _id: "6905e0b0c0ec2a753c0a182a",
//         name: "Acme Innovations",
//       },
//       subTotal: 1597,
//       totalDiscount: 0,
//       grandTotal: 1676.85,
//       status: "Draft",
//       validUntil: "2025-12-01T10:44:32.118Z",
//       quotationId: "QT-2025-002",
//       createdAt: "2025-11-01T10:44:32.139Z",
//     },
//     {
//       _id: "6905e2be90d06ce92d94ab99",
//       customer: {
//         _id: "6905e0b0c0ec2a753c0a182a",
//         name: "Acme Innovations",
//       },
//       subTotal: 2032.05,
//       totalDiscount: 115.805,
//       grandTotal: 2026.969875,
//       status: "Accepted",
//       validUntil: "2025-12-01T10:36:46.269Z",
//       quotationId: "QT-2025-001",
//       createdAt: "2025-11-01T10:36:46.469Z",
//     },
//     {
//       _id: "6905e2bf90d06ce92d94ab9a",
//       customer: {
//         _id: "6905e0b0c0ec2a753c0a182b",
//         name: "Quantum Solutions",
//       },
//       subTotal: 500,
//       totalDiscount: 50,
//       grandTotal: 472.5,
//       status: "Rejected",
//       validUntil: "2025-11-15T10:36:46.269Z",
//       quotationId: "QT-2025-003",
//       createdAt: "2025-11-02T11:30:00.000Z",
//     },
//     {
//       _id: "6905e2bg90d06ce92d94ab9c",
//       customer: {
//         _id: "6905e0b0c0ec2a753c0a182c",
//         name: "Pinnacle Enterprises",
//       },
//       subTotal: 3200,
//       totalDiscount: 0,
//       grandTotal: 3360,
//       status: "Sent",
//       validUntil: "2025-11-30T10:36:46.269Z",
//       quotationId: "QT-2025-004",
//       createdAt: "2025-11-03T14:15:00.000Z",
//     },
//   ],
//   pagination: {
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 4,
//   },
// };

// // --- Helper Functions (Unchanged) ---

// function formatCurrency(amount: number) {
//   return amount.toLocaleString("en-US", {
//     style: "currency",
//     currency: "USD",
//   });
// }

// function formatDate(dateString: string) {
//   return new Date(dateString).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// }

// // --- Helper Components ---

// function QuotationStatusBadge({
//   status,
// }: {
//   status: Quotation["status"];
// }) {
//   const statusStyles = {
//     Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
//     Sent: "bg-blue-100 text-blue-800 border-blue-200",
//     Accepted: "bg-green-100 text-green-800 border-green-200",
//     Rejected: "bg-red-100 text-red-800 border-red-200",
//   };

//   const statusIcons = {
//     Draft: <Clock className="w-3.5 h-3.5" />,
//     Sent: <Send className="w-3.5 h-3.5" />,
//     Accepted: <CheckCircle className="w-3.5 h-3.5" />,
//     Rejected: <XCircle className="w-3.5 h-3.5" />,
//   };

//   return (
//     <Badge
//       variant="outline"
//       className={`capitalize text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${statusStyles[status]}`}
//     >
//       {statusIcons[status]}
//       <span>{status}</span>
//     </Badge>
//   );
// }

// // (QuotationStats component is unchanged)
// function QuotationStats({
//   stats,
// }: {
//   stats: {
//     total: number;
//     totalValue: number;
//     draft: number;
//     sent: number;
//     accepted: number;
//     rejected: number;
//   };
// }) {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//       <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
//         <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
//         <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
//         <div className="text-sm text-blue-700">Total Quotes</div>
//       </div>
//       <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
//         <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
//         <div className="text-2xl font-bold text-green-900">
//           {formatCurrency(stats.totalValue)}
//         </div>
//         <div className="text-sm text-green-700">Total Value</div>
//       </div>
//       <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
//         <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
//         <div className="text-2xl font-bold text-yellow-900">{stats.draft}</div>
//         <div className="text-sm text-yellow-700">Draft</div>
//       </div>
//       <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
//         <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
//         <div className="text-2xl font-bold text-purple-900">
//           {stats.accepted}
//         </div>
//         <div className="text-sm text-purple-700">Accepted</div>
//       </div>
//     </div>
//   );
// }

// // =================================================================
// // === CHANGED: New, more compact QuotationCard component ===
// // =================================================================
// function QuotationCard({ quotation }: { quotation: Quotation }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md hover:border-purple-200">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

//         {/* Left Side: Info */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-3">
//             {/* Icon */}
//             <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
//               <FileText className="w-5 h-5" />
//             </div>
//             {/* ID and Customer */}
//             <div>
//               <span className="font-bold text-base text-purple-700 block truncate">
//                 {quotation.quotationId}
//               </span>
//               <span className="text-sm text-gray-600 truncate flex items-center gap-1.5">
//                 <User className="w-3.5 h-3.5" />
//                 {quotation.customer.name}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Middle: Status & Total */}
//         <div className="flex flex-row sm:flex-col md:flex-row items-center gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-6 sm:ml-6">
//           <div className="flex-1 sm:flex-none">
//             <QuotationStatusBadge status={quotation.status} />
//           </div>

//           <div className="flex-1 sm:flex-none text-left sm:text-right">
//             <div className="text-lg font-bold text-gray-900">
//               {formatCurrency(quotation.grandTotal)}
//             </div>
//             <div className="text-sm text-gray-500 flex items-center gap-1.5 justify-start sm:justify-end">
//               <Calendar className="w-3.5 h-3.5" />
//               <span>{formatDate(quotation.createdAt)}</span>
//             </div>
//           </div>
//         </div>

//         {/* Right Side: Actions */}
//         <div className="flex gap-2 sm:ml-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
//           <Button className="w-full sm:w-auto flex items-center gap-2">
//             <Eye className="w-4 h-4" />
//             View
//           </Button>
//           <Button variant="outline" size="icon" className="text-gray-500 hover:text-red-600 hover:border-red-300">
//             <Trash2 className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- Main Page Component ---

// export default function QuotationPage() {
//   const { quotations, pagination } = mockApiResponse;

//   const stats = {
//     total: pagination.totalItems,
//     totalValue: quotations.reduce((acc, q) => acc + q.grandTotal, 0),
//     draft: quotations.filter((q) => q.status === "Draft").length,
//     sent: quotations.filter((q) => q.status === "Sent").length,
//     accepted: quotations.filter((q) => q.status === "Accepted").length,
//     rejected: quotations.filter((q) => q.status === "Rejected").length,
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header (Unchanged) */}
//         <div className="mb-8">
//           <div className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//               <FileText className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Quotation Management
//             </h1>
//             <p className="text-gray-600 text-lg">
//               Create and manage quotations for your book sales and services
//             </p>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
//           {/* Search and Filter Bar (Unchanged) */}
//           <div className="mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <Input
//                     placeholder="Search quotations..."
//                     className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Button variant="outline" className="flex items-center space-x-2">
//                   <Filter className="w-4 h-4" />
//                   <span>Filter</span>
//                 </Button>
//                 <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2">
//                   <Plus className="w-4 h-4" />
//                   <span>New Quotation</span>
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Quotation Stats (Unchanged) */}
//           <QuotationStats stats={stats} />

//           {/* Quotation List */}
//           <div className="mt-12">
//             <h2 className="text-2xl font-semibold text-gray-900 mb-6">
//               All Quotations ({pagination.totalItems})
//             </h2>

//             {quotations.length > 0 ? (
//               // ========================================================
//               // === CHANGED: New grid layout for the compact list ===
//               // ========================================================
//               <div className="grid grid-cols-1 gap-4">
//                 {quotations.map((quotation) => (
//                   <QuotationCard key={quotation._id} quotation={quotation} />
//                 ))}
//               </div>
//             ) : (
//               // (Empty state placeholder is unchanged)
//               <div className="text-center py-12">
//                 <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <FileText className="w-12 h-12 text-purple-600" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-3">No Quotations Found</h3>
//                 <p className="text-gray-600 mb-6 max-w-md mx-auto">
//                   Get started by creating your first quotation.
//                 </p>
//                 <Button className="bg-purple-600 hover:bg-purple-700 text-white">
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create New Quotation
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }