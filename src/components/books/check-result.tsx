import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertTriangle, Info, Loader2, ArrowLeft } from "lucide-react";
import { CheckResponse } from "@/hooks/use-book-form";
import { useRouter } from "next/navigation";

interface CheckResultProps {
  checkResponse: CheckResponse;
  loading: boolean;
  onAction: (action: string) => void;
  onBack: () => void;
}

export function CheckResult({ checkResponse, loading, onAction, onBack }: CheckResultProps) {
  const router = useRouter();
  const { bookStatus, pricingStatus, message, details } = checkResponse;

  // Determine styles based on status
  const statusConfig = {
    NEW: { color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", icon: CheckCircle, label: "New Book Detected" },
    DUPLICATE: { color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", icon: Info, label: "Duplicate Found" },
    CONFLICT: { color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", icon: AlertTriangle, label: "Conflict Detected" },
  }[bookStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
            <Button onClick={onBack} variant="outline" className="mb-6"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Form</Button>
            <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4"><Info className="w-8 h-8 text-white" /></div>
                <h1 className="text-3xl font-bold">Book Status Check</h1>
                <p className="text-[var(--text-secondary)]">Review results</p>
            </div>
        </div>

        <div className="space-y-6">
            {/* Status Card */}
            <div className={`p-6 rounded-2xl border ${statusConfig.bg} border-opacity-20`}>
                <div className="flex items-center gap-3 mb-2">
                    <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                    <h2 className="text-xl font-semibold">{statusConfig.label}</h2>
                </div>
                <p>{message}</p>
            </div>

            {/* Details: Conflict */}
            {bookStatus === "CONFLICT" && details?.conflictFields && (
                <div className="bg-[var(--surface)] rounded-2xl border p-6">
                    <h3 className="font-semibold mb-4">Conflict Details</h3>
                    <div className="space-y-4">
                        {Object.entries(details.conflictFields).map(([field, data]: [string, any]) => (
                            <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div><Label>Field</Label><p className="capitalize">{field}</p></div>
                                <div><Label>Existing</Label><p>{String(data.old)}</p></div>
                                <div><Label>New</Label><p>{String(data.new)}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Details: Pricing Diff */}
            {bookStatus === "DUPLICATE" && pricingStatus === "UPDATE_PRICE" && details?.differences && (
                <div className="bg-[var(--surface)] rounded-2xl border p-6">
                    <h3 className="font-semibold mb-4">Pricing Differences</h3>
                    <div className="space-y-4">
                        {Object.entries(details.differences).map(([field, data]: [string, any]) => (
                             <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div><Label>Field</Label><p className="capitalize">{field}</p></div>
                                <div><Label>Existing</Label><p>{data.old}</p></div>
                                <div><Label>New</Label><p>{data.new}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="bg-[var(--surface)] rounded-2xl border p-6">
                <h3 className="font-semibold mb-4">Choose Action</h3>
                <div className="flex gap-4">
                    
                    {bookStatus === "NEW" && (
                        <Button onClick={() => onAction("INSERT")} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white h-12 px-6">
                            {loading ? "Processing..." : "Insert Book"}
                        </Button>
                    )}

                    {bookStatus === "CONFLICT" && (
                        <Button onClick={onBack} variant="outline" className="h-12 px-6">Discard Changes</Button>
                    )}

                    {bookStatus === "DUPLICATE" && (
                        <>
                            {pricingStatus === "ADD_PRICE" && (
                                <Button onClick={() => onAction("ADD_PRICE")} disabled={loading} className="bg-[var(--primary)] text-white h-12">Add Price</Button>
                            )}
                            {pricingStatus === "UPDATE_PRICE" && (
                                <Button onClick={() => onAction("UPDATE_PRICE")} disabled={loading} className="bg-[var(--primary)] text-white h-12">Update Price</Button>
                            )}
                            {pricingStatus === "NO_CHANGE" && (
                                <Button onClick={() => router.push("/books")} className="bg-[var(--primary)] text-white h-12">Return to List</Button>
                            )}
                            {pricingStatus !== "NO_CHANGE" && (
                                <Button onClick={onBack} variant="outline" className="h-12 px-6">Discard</Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}