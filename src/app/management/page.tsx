"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, User } from "lucide-react";
import { AddPublisherForm } from "@/components/AddPublisherForm";
import { AddCustomerForm } from "@/components/AddCustomerForm";
import { AddCompanyProfileForm } from "@/components/AddCompanyProfileForm";
import { cn } from "@/lib/utils";

type ActiveTab = "publisher" | "customer" | "company";

function ManagementPageContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>("customer");

    const getTabItemClassName = (tabName: ActiveTab) => {
        return cn(
            "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
            activeTab === tabName
                ? "text-[var(--text-primary)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        );
    };

    const getUnderlineClassName = (tabName: ActiveTab) => {
        return cn(
            "absolute bottom-0 left-0 h-0.5 w-full bg-[var(--primary)] transition-transform duration-300 ease-out",
            activeTab === tabName ? "scale-x-100" : "scale-x-0"
        );
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Customer and Publisher Management
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Easily add and manage customer and publisher information.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="relative mb-8 border-b border-[var(--border)]">
                    <div className="flex justify-start max-w-md">
                        <button onClick={() => setActiveTab("customer")} className="flex-1 text-center relative focus:outline-none py-2">
                            <span className={getTabItemClassName("customer")}>
                                Customer
                            </span>
                            <span className={getUnderlineClassName("customer")} />
                        </button>
                        <button onClick={() => setActiveTab("publisher")} className="flex-1 text-center relative focus:outline-none py-2">
                            <span className={getTabItemClassName("publisher")}>
                                Publisher
                            </span>
                            <span className={getUnderlineClassName("publisher")} />
                        </button>
                        <button onClick={() => setActiveTab("company")} className="flex-1 text-center relative focus:outline-none py-2">
                            <span className={getTabItemClassName("company")}>
                                Company Profile
                            </span>
                            <span className={getUnderlineClassName("company")} />
                        </button>
                    </div>
                </div>

                {/* Form Display Area */}
                <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-8">
                    {activeTab === "publisher" && <AddPublisherForm />}
                    {activeTab === "customer" && <AddCustomerForm />}
                    {activeTab === "company" && <AddCompanyProfileForm />}
                </div>

            </div>
        </div>
    );
}

export default function ManagementPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        }>
            <ManagementPageContent />
        </Suspense>
    );
}