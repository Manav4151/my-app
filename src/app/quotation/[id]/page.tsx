"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Calendar,
  User,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Edit,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { apiFunctions } from "@/services/api.service";
import { toast } from "sonner";

// Type Definitions
type Customer = {
  _id: string;
  name?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

type Book = {
  _id: string;
  title: string;
  isbn: string;
  author?: string;
  publisher?: string;
  edition?: string;
};

type QuotationItem = {
  _id: string;
  book: Book | string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
};

type Quotation = {
  _id: string;
  quotationId: string;
  customer: Customer;
  items: QuotationItem[];
  subTotal: number;
  totalDiscount: number;
  grandTotal: number;
  status: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
};

// Helper Functions
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

function QuotationStatusBadge({ status }: { status: string }) {
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
      className={`capitalize text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-x-1.5 w-fit ${statusStyles[status]}`}
    >
      {statusIcons[status]}
      <span>{status}</span>
    </Badge>
  );
}

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [profiles, setProfiles] = useState<Array<{ _id: string; profileName: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    if (quotationId) {
      fetchQuotationDetails();
      fetchCompanyProfiles();
    }
  }, [quotationId]);

  const fetchQuotationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunctions.getQuotationById(quotationId);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch quotation details");
      }

      setQuotation(response.quotation);
    } catch (err) {
      console.error("Error fetching quotation details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch quotation details");
      toast.error("Failed to load quotation details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const response = await apiFunctions.getCompanyProfiles();
      if (response.success && response.data) {
        setProfiles(response.data);
      }
    } catch (err) {
      console.error("Error fetching company profiles:", err);
      // Don't show error toast for profiles, just log it
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handlePreviewPDF = () => {
    if (!selectedProfileId) {
      toast.error("Please select a profile first");
      return;
    }
    const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5050";
    const previewUrl = `${API_URL}/api/quotations/${quotationId}/preview?profileId=${selectedProfileId}`;
    window.open(previewUrl, '_blank');
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await apiFunctions.downloadQuotationPDF(quotationId ,selectedProfileId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${quotation?.quotationId || quotationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("Error downloading PDF:", err);
      toast.error(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading quotation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/quotation")} variant="outline">
                Back to List
              </Button>
              <Button onClick={fetchQuotationDetails} className="bg-purple-600 hover:bg-purple-700">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <p className="text-gray-500">No quotation data available</p>
        </div>
      </div>
    );
  }

  const customerName = quotation.customer?.customerName || quotation.customer?.name || "N/A";
  const customerAddress = quotation.customer?.address;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/quotation")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotations
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quotation Details
              </h1>
              <p className="text-gray-600">Quotation ID: {quotation.quotationId}</p>
            </div>
            <div className="flex gap-3">
              {(quotation.status === "Draft" || quotation.status === "Sent") && (
                <Button
                  onClick={() => router.push(`/quotation/${quotationId}/edit`)}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Quotation
                </Button>
              )}
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading || !selectedProfileId}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quotation Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{customerName}</p>
                </div>
                {quotation.customer?.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{quotation.customer.email}</p>
                  </div>
                )}
                {quotation.customer?.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{quotation.customer.phone}</p>
                  </div>
                )}
                {customerAddress && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {customerAddress.street && `${customerAddress.street}, `}
                      {customerAddress.city && `${customerAddress.city}, `}
                      {customerAddress.state && `${customerAddress.state}`}
                      {customerAddress.zipCode && ` ${customerAddress.zipCode}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotation.items.map((item, index) => {
                      const book = typeof item.book === "object" ? item.book : null;
                      return (
                        <tr key={item._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900">
                                {book?.title || "Unknown Book"}
                              </p>
                              {book?.isbn && (
                                <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {item.discount}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Summary and Preview */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <QuotationStatusBadge status={quotation.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(quotation.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valid Until</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(quotation.validUntil)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(quotation.subTotal)}
                    </span>
                  </div>
                  {quotation.totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-red-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        -{formatCurrency(quotation.totalDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(quotation.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                PDF Preview
              </h2>
              
              {/* Profile Selection */}
              <div className="mb-4 space-y-3">
                <div>
                  <label htmlFor="profile-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Company Profile
                  </label>
                  <Select
                    value={selectedProfileId}
                    onValueChange={setSelectedProfileId}
                    disabled={loadingProfiles}
                  >
                    <SelectTrigger id="profile-select" className="w-full">
                      <SelectValue placeholder={loadingProfiles ? "Loading profiles..." : "Select a profile"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto bg-white">
                      {profiles.map((profile) => (
                        <SelectItem key={profile._id} value={profile._id}>
                          {profile.profileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handlePreviewPDF}
                  disabled={!selectedProfileId || loadingProfiles}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
              </div>

              {/* <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-[600px] border-0"
                  title="Quotation PDF Preview"
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


