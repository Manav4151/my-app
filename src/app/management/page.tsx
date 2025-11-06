
// "use client";

// import React, { useState, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/app/components/ui/button";
// import { ArrowLeft, Building, User } from "lucide-react";
// import { AddPublisherForm } from "../components/AddPublisherForm";
// import { AddCustomerForm } from "../components/AddCustomerForm";
// import { cn } from "@/lib/utils";

// type ActiveTab = "publisher" | "customer";

// function ManagementPageContent() {
//     const router = useRouter();
//     const [activeTab, setActiveTab] = useState<ActiveTab>("publisher");

//     const getTabClassName = (tabName: ActiveTab) => {
//         return cn(
//             "flex-1 justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all",
//             activeTab === tabName
//                 ? "bg-amber-600 text-white shadow"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
//             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <Button
//                         onClick={() => router.push("/books")}
//                         variant="outline"
//                         className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-50"
//                     >
//                         <ArrowLeft className="w-4 h-4 mr-2" />
//                         Back to Home
//                     </Button>

//                     <div className="text-center">
//                         <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                             {activeTab === 'publisher' ? <Building className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
//                         </div>
//                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                             Data Management
//                         </h1>
//                         <p className="text-gray-600 text-lg">
//                             Add a new publisher or customer to the system.
//                         </p>
//                     </div>
//                 </div>

//                 {/* Tab Switcher */}
//                 <div className="mb-8 flex justify-center">
//                     <div className="flex w-full max-w-sm items-center space-x-2 rounded-xl bg-gray-200 p-1">
//                         <Button onClick={() => setActiveTab("publisher")} className={getTabClassName("publisher")}>
//                             <Building className="w-4 h-4 mr-2" />
//                             Publisher
//                         </Button>
//                         <Button onClick={() => setActiveTab("customer")} className={getTabClassName("customer")}>
//                             <User className="w-4 h-4 mr-2" />
//                             Customer
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Form Display Area */}
//                 <div>
//                     {activeTab === "publisher" && <AddPublisherForm />}
//                     {activeTab === "customer" && <AddCustomerForm />}
//                 </div>

//             </div>
//         </div>
//     );
// }

// export default function ManagementPage() {
//     return (
//         <Suspense fallback={
//             <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
//                 <div className="bg-white shadow-lg rounded-2xl p-8">
//                     <div className="flex justify-center items-center">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
//                     </div>
//                 </div>
//             </div>
//         }>
//             <ManagementPageContent />
//         </Suspense>
//     );
// }

"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Building, User } from "lucide-react";
import { AddPublisherForm } from "../components/AddPublisherForm";
import { AddCustomerForm } from "../components/AddCustomerForm";
import { AddCompanyProfileForm } from "../components/AddCompanyProfileForm";
import { cn } from "@/lib/utils";

type ActiveTab = "publisher" | "customer" | "company";

function ManagementPageContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>("customer");

    const getTabItemClassName = (tabName: ActiveTab) => {
        return cn(
            "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
            activeTab === tabName
                ? "text-gray-900 font-semibold"
                : "text-gray-600 hover:text-gray-900"
        );
    };

    const getUnderlineClassName = (tabName: ActiveTab) => {
        return cn(
            "absolute bottom-0 left-0 h-0.5 w-full bg-amber-600 transition-transform duration-300 ease-out",
            activeTab === tabName ? "scale-x-100" : "scale-x-0"
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Customer and Publisher Management
                    </h1>
                    <p className="text-gray-600">
                        Easily add and manage customer and publisher information.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="relative mb-8 border-b border-gray-200">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
        }>
            <ManagementPageContent />
        </Suspense>
    );
}