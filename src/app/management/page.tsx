// "use client";

// import React, { useState, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/app/components/ui/button";
// import { ArrowLeft, Building, User } from "lucide-react";
// import { AddPublisherForm } from "../components/AddPublisherForm";
// import { AddCustomerForm } from "../components/AddCustomerForm";
// // ... (imports remain the same)
// import { cn } from "@/lib/utils"; // Ensure this utility is available

// type ActiveTab = "publisher" | "customer";

// function ManagementPageContent() {
//     const router = useRouter();
//     const [activeTab, setActiveTab] = useState<ActiveTab>("publisher");

//     // This function now generates class names for the tab *items* (the text/buttons)
//     // The underline will be handled separately.
//     const getTabItemClassName = (tabName: ActiveTab) => {
//         return cn(
//             "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
//             activeTab === tabName
//                 ? "text-gray-900 font-semibold" // Active tab text color and weight
//                 : "text-gray-600 hover:text-gray-900" // Inactive tab text color and hover
//         );
//     };

//     // This function generates class names for the underline element
//     const getUnderlineClassName = (tabName: ActiveTab) => {
//         return cn(
//             "absolute bottom-0 left-0 h-0.5 w-full bg-amber-600 transition-transform duration-200 ease-out",
//             activeTab === tabName ? "scale-x-100" : "scale-x-0"
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
//             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-lg shadow-lg" >
//                 {/* Header (remains the same) */}
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

//                 {/* --- Tab Switcher - Updated UI --- */}
//                 <div className="relative mb-8    rounded-lg overflow-hidden">
//                     <div className="flex justify-start max-w-lg mx-auto"> {/* Adjusted max-width for cleaner look */}
//                         {/* Publisher Tab */}
//                         <button
//                             onClick={() => setActiveTab("publisher")}
//                             className="flex-1 text-center relative focus:outline-none"
//                         >
//                             <span className={getTabItemClassName("publisher")}>
//                                 <Building className="w-4 h-4 mr-2 inline-block" />
//                                 Publisher
//                             </span>
//                             <span className={getUnderlineClassName("publisher")} />
//                         </button>

//                         {/* Customer Tab */}
//                         <button
//                             onClick={() => setActiveTab("customer")}
//                             className="flex-1 text-center relative focus:outline-none"
//                         >
//                             <span className={getTabItemClassName("customer")}>
//                                 <User className="w-4 h-4 mr-2 inline-block" />
//                                 Customer
//                             </span>
//                             <span className={getUnderlineClassName("customer")} />
//                         </button>
//                     </div>
//                 </div>
//                 {/* --- End Tab Switcher Update --- */}


//                 {/* Form Display Area (remains the same) */}
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
import { cn } from "@/lib/utils";

type ActiveTab = "publisher" | "customer";

function ManagementPageContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>("publisher");

    const getTabClassName = (tabName: ActiveTab) => {
        return cn(
            "flex-1 justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all",
            activeTab === tabName
                ? "bg-amber-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => router.push("/books")}
                        variant="outline"
                        className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'publisher' ? <Building className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Data Management
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Add a new publisher or customer to the system.
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="mb-8 flex justify-center">
                    <div className="flex w-full max-w-sm items-center space-x-2 rounded-xl bg-gray-200 p-1">
                        <Button onClick={() => setActiveTab("publisher")} className={getTabClassName("publisher")}>
                            <Building className="w-4 h-4 mr-2" />
                            Publisher
                        </Button>
                        <Button onClick={() => setActiveTab("customer")} className={getTabClassName("customer")}>
                            <User className="w-4 h-4 mr-2" />
                            Customer
                        </Button>
                    </div>
                </div>

                {/* Form Display Area */}
                <div>
                    {activeTab === "publisher" && <AddPublisherForm />}
                    {activeTab === "customer" && <AddCustomerForm />}
                </div>

            </div>
        </div>
    );
}

export default function ManagementPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                </div>
            </div>
        }>
            <ManagementPageContent />
        </Suspense>
    );
}