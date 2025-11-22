"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useBookDetail } from "@/hooks/use-book-detail";
import { BookDetailView } from "@/components/books/book-detail-view";
import { Loader2 } from "lucide-react";

export default function BookDetailPage() {
    const params = useParams();
    // logic hook
    const logic = useBookDetail(params.id as string);

    if (logic.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin"><Loader2 className="w-8 h-8 text-[var(--primary)]" /></div>
            </div>
        );
    }

    if (logic.error || !logic.data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[var(--error)]">
                Error: {logic.error || "Book not found"}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <BookDetailView
                data={logic.data}
                lastPurchaseData={logic.lastPurchaseData}
                onEdit={() => logic.router.push(`/books/insert?edit=${params.id}`)}
                onMarkOutOfPrint={logic.markAsOutOfPrint}
                onAddPrice={() => logic.router.push(`/books/insert?bookId=${params.id}`)}
                onInsertNew={() => logic.router.push(`/books/insert`)}
            />
        </div>
    );
}