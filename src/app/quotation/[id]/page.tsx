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
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFunctions } from "@/services/api.service";
import { toast } from "sonner";
import ComposeEmail from "@/components/email/compose-email";
import { RoleGate } from "@/lib/use-role";
import { ROLE_GROUPS } from "@/lib/role";

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

type EmailInfo = {
  messageId: string;
  sender: string;
  subject: string;
  receivedAt: string;
  snippet?: string;
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
  emailInfo?: EmailInfo;
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
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    if (quotationId) {
      fetchQuotationDetails();
      fetchCompanyProfiles();
    }
  }, [quotationId]);
  const handleComposeClose = () => {
    setShowCompose(false);
  };
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

  const handlePreviewPDF = async () => {
    if (!selectedProfileId) {
      toast.error("Please select a profile first");
      return;
    }
    const blob = await apiFunctions.downloadQuotationPDF(quotationId, selectedProfileId);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await apiFunctions.downloadQuotationPDF(quotationId, selectedProfileId);

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4 animate-pulse" />
          <p className="text-[var(--muted-foreground)]">Loading quotation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="bg-[var(--input)] shadow-lg rounded-2xl p-8 max-w-md border border-[var(--border)]">
          <div className="text-center">
            <p className="text-[var(--destructive)] mb-4">Error: {error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/quotation")} variant="outline">
                Back to List
              </Button>
              <Button onClick={fetchQuotationDetails} className="bg-[var(--primary)] hover:opacity-90">
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="bg-[var(--input)] shadow-lg rounded-2xl p-8 border border-[var(--border)]">
          <p className="text-[var(--muted-foreground)]">No quotation data available</p>
        </div>
      </div>
    );
  }

  const customerName = quotation.customer?.customerName || quotation.customer?.name || "N/A";
  const customerAddress = quotation.customer?.address;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/quotation")}
            className="mb-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotations
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Quotation Details
              </h1>
              <p className="text-[var(--muted-foreground)]">Quotation ID: {quotation.quotationId}</p>
            </div>
            <div className="flex gap-3">
              {(quotation.status === "Draft" || quotation.status === "Sent") && (
                <RoleGate allow={ROLE_GROUPS.QUOTATION_MANAGERS}>
                  <Button
                    onClick={() => router.push(`/quotation/${quotationId}/edit`)}
                    variant="outline"
                    className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--muted)]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Quotation
                  </Button>
                </RoleGate>
              )}
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading || !selectedProfileId}
                className="bg-[var(--primary)] hover:opacity-90 text-white"
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
            <div className="bg-[var(--input)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--primary)]" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Name</p>
                  <p className="font-medium text-[var(--foreground)]">{customerName}</p>
                </div>
                {quotation.customer?.email && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                    <p className="font-medium text-[var(--foreground)]">{quotation.customer.email}</p>
                  </div>
                )}
                {quotation.customer?.phone && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Phone</p>
                    <p className="font-medium text-[var(--foreground)]">{quotation.customer.phone}</p>
                  </div>
                )}
                {customerAddress && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Address</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {customerAddress.street && `${customerAddress.street}, `}
                      {customerAddress.city && `${customerAddress.city}, `}
                      {customerAddress.state && `${customerAddress.state}`}
                      {customerAddress.zipCode && ` ${customerAddress.zipCode}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Email Information */}
            {quotation.emailInfo && (
              <div className="bg-[var(--input)] rounded-xl shadow-sm border border-[var(--border)] p-6">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[var(--primary)]" />
                  Email Information
                </h2>
                <div className="space-y-3">
                  {quotation.emailInfo.sender && (
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Sender</p>
                      <p className="font-medium text-[var(--foreground)]">{quotation.emailInfo.sender}</p>
                    </div>
                  )}
                  {quotation.emailInfo.subject && (
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Subject</p>
                      <p className="font-medium text-[var(--foreground)]">{quotation.emailInfo.subject}</p>
                    </div>
                  )}
                  {quotation.emailInfo.receivedAt && (
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Received At</p>
                      <p className="font-medium text-[var(--foreground)] flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(quotation.emailInfo.receivedAt)}
                      </p>
                    </div>
                  )}
                  {quotation.emailInfo.snippet && (
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Snippet</p>
                      <p className="font-medium text-[var(--foreground)] text-sm">{quotation.emailInfo.snippet}</p>
                    </div>
                  )}
                  {quotation.emailInfo.messageId && (
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Message ID</p>
                      <p className="font-medium text-[var(--foreground)] text-xs font-mono break-all">{quotation.emailInfo.messageId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="bg-[var(--input)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
              <div className="p-6 border-b border-[var(--border)]">
                <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[var(--primary)]" />
                  Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--input)] divide-y divide-[var(--border)]">
                    {quotation.items.map((item, index) => {
                      const book = typeof item.book === "object" ? item.book : null;
                      return (
                        <tr key={item._id || index} className="hover:bg-[var(--muted)]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-[var(--foreground)]">
                                {book?.title || "Unknown Book"}
                              </p>
                              {book?.isbn && (
                                <p className="text-sm text-[var(--muted-foreground)]">ISBN: {book.isbn}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                            {item.discount}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-[var(--foreground)]">
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
            <div className="bg-[var(--input)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="text-[var(--muted-foreground)]">Status</span>
                  <QuotationStatusBadge status={quotation.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Created</span>
                  <span className="font-medium text-[var(--foreground)] flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(quotation.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Valid Until</span>
                  <span className="font-medium text-[var(--foreground)] flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(quotation.validUntil)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Subtotal</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatCurrency(quotation.subTotal)}
                    </span>
                  </div>
                  {quotation.totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-[var(--destructive)]">
                      <span>Discount</span>
                      <span className="font-medium">
                        -{formatCurrency(quotation.totalDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-lg font-semibold text-[var(--foreground)]">Grand Total</span>
                    <span className="text-xl font-bold text-[var(--primary)]">
                      {formatCurrency(quotation.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="bg-[var(--input)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[var(--primary)]" />
                PDF Preview
              </h2>

              {/* Profile Selection */}
              <div className="mb-4 space-y-3">
                <div>
                  <label htmlFor="profile-select" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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
                    <SelectContent className="max-h-[200px] overflow-y-auto bg-[var(--input)]">
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
                  className="w-full bg-[var(--primary)] hover:opacity-90 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
                <RoleGate allow={ROLE_GROUPS.QUOTATION_MANAGERS}>
                  <Button
                    onClick={() => setShowCompose(true)}
                    disabled={!selectedProfileId || loadingProfiles}
                    className="w-full bg-[var(--primary)] hover:opacity-90 text-white"
                  >
                    Share PDF
                  </Button>
                </RoleGate>
              </div>
              {/* Compose Email Modal */}
              {showCompose && (
                <ComposeEmail
                  onClose={handleComposeClose}
                  onEmailSent={handleComposeClose}
                  attachmentInfo={{
                    type: "quotation",
                    fileName: `quotation-${quotation.quotationId}.pdf`,
                    quotationId: quotationId,     // your variable
                    profileId: selectedProfileId          // another variable you must provide
                  }}
                />
              )}
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
