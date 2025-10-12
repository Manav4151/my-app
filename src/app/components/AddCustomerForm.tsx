
// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { CheckCircle, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

// // --- UPDATED: Interface now includes contact person details ---
// interface CustomerData {
//     name: string;
//     email: string;
//     phone: string;
//     address: {
//         street: string;
//         city: string;
//         state: string;
//         zipCode: string;
//         country: string;
//     };
//     contactPerson: string;
//     contactPersonEmail: string;
//     contactPersonPhone: string;
// }

// // Validation utility functions
// const validateEmail = (email: string): boolean => {
//     if (!email) return false;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
// };

// const validatePhone = (phone: string): boolean => {
//     if (!phone) return true; // Phone is optional
//     const phoneRegex = /^\d{10,15}$/;
//     return phoneRegex.test(phone.replace(/\D/g, ''));
// };

// // --- UPDATED: Initial state includes new fields ---
// const initialState: CustomerData = {
//     name: "",
//     email: "",
//     phone: "",
//     address: {
//         street: "",
//         city: "",
//         state: "",
//         zipCode: "",
//         country: "",
//     },
//     contactPerson: "",
//     contactPersonEmail: "",
//     contactPersonPhone: "",
// };

// export function AddCustomerForm() {
//     const router = useRouter();
//     const [loading, setLoading] = useState(false);
//     const [customerData, setCustomerData] = useState<CustomerData>(initialState);

//     // --- UPDATED: Error state includes new fields ---
//     const [errors, setErrors] = useState({
//         email: "",
//         phone: "",
//         contactPersonEmail: "",
//         contactPersonPhone: "",
//     });

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setCustomerData(prev => ({ ...prev, [name]: value }));

//         // Real-time validation
//         if (name === "email" || name === "contactPersonEmail") {
//             if (value && !validateEmail(value)) {
//                 setErrors(prev => ({ ...prev, [name]: "Please enter a valid email." }));
//             } else {
//                 setErrors(prev => ({ ...prev, [name]: "" }));
//             }
//         }

//         if (name === "phone" || name === "contactPersonPhone") {
//             if (value && !validatePhone(value)) {
//                 setErrors(prev => ({ ...prev, [name]: "Phone must be 10-15 digits." }));
//             } else {
//                 setErrors(prev => ({ ...prev, [name]: "" }));
//             }
//         }
//     };

//     const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setCustomerData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
//     };

//     // --- UPDATED: Validation logic includes new fields ---
//     const validateForm = (): boolean => {
//         const newErrors = { email: "", phone: "", contactPersonEmail: "", contactPersonPhone: "" };
//         let isValid = true;

//         if (!validateEmail(customerData.email)) {
//             newErrors.email = "Please enter a valid primary email address.";
//             isValid = false;
//         }
//         if (!validatePhone(customerData.phone)) {
//             newErrors.phone = "Primary phone must be 10-15 digits.";
//             isValid = false;
//         }
//         if (customerData.contactPersonEmail && !validateEmail(customerData.contactPersonEmail)) {
//             newErrors.contactPersonEmail = "Please enter a valid email for the contact person.";
//             isValid = false;
//         }
//         if (customerData.contactPersonPhone && !validatePhone(customerData.contactPersonPhone)) {
//             newErrors.contactPersonPhone = "Contact person's phone must be 10-15 digits.";
//             isValid = false;
//         }

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             toast.error("Please fix the errors before submitting.");
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await fetch('http://localhost:8000/api/addCustomer', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(customerData),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({
//                     message: `API Error: ${response.status}`
//                 }));
//                 throw new Error(errorData.message);
//             }

//             const result = await response.json();
//             toast.success(result.message || "Customer added successfully!");

//             setCustomerData(initialState);
//             setErrors({ email: "", phone: "", contactPersonEmail: "", contactPersonPhone: "" });

//         } catch (error) {
//             toast.error(error instanceof Error ? error.message : "Failed to add customer.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <div className="space-y-10">
//                 {/* Customer Details Section */}
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Primary Information</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                         <div>
//                             <Label htmlFor="name">Customer Name / Company *</Label>
//                             <Input id="name" name="name" value={customerData.name} onChange={handleInputChange} required placeholder="e.g., John Doe or ACME Inc." />
//                         </div>
//                         <div>
//                             <Label htmlFor="email">Email Address *</Label>
//                             <Input id="email" name="email" type="email" value={customerData.email} onChange={handleInputChange} required placeholder="e.g., contact@example.com" className={cn(errors.email && "border-red-500")} />
//                             {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
//                         </div>
//                         <div className="md:col-span-2">
//                             <Label htmlFor="phone">Phone Number</Label>
//                             <Input id="phone" name="phone" type="tel" value={customerData.phone} onChange={handleInputChange} placeholder="e.g., (123) 456-7890" className={cn(errors.phone && "border-red-500")} />
//                             {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
//                         </div>
//                     </div>
//                 </div>

//                 {/* --- NEW: Contact Person Section --- */}
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Person (Optional)</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                         <div className="md:col-span-2">
//                             <Label htmlFor="contactPerson">Full Name</Label>
//                             <Input id="contactPerson" name="contactPerson" value={customerData.contactPerson} onChange={handleInputChange} placeholder="e.g., Jane Smith" />
//                         </div>
//                         <div>
//                             <Label htmlFor="contactPersonEmail">Email Address</Label>
//                             <Input id="contactPersonEmail" name="contactPersonEmail" type="email" value={customerData.contactPersonEmail} onChange={handleInputChange} placeholder="e.g., jane.smith@example.com" className={cn(errors.contactPersonEmail && "border-red-500")} />
//                             {errors.contactPersonEmail && <p className="text-sm text-red-600 mt-1">{errors.contactPersonEmail}</p>}
//                         </div>
//                         <div>
//                             <Label htmlFor="contactPersonPhone">Phone Number</Label>
//                             <Input id="contactPersonPhone" name="contactPersonPhone" type="tel" value={customerData.contactPersonPhone} onChange={handleInputChange} placeholder="e.g., (987) 654-3210" className={cn(errors.contactPersonPhone && "border-red-500")} />
//                             {errors.contactPersonPhone && <p className="text-sm text-red-600 mt-1">{errors.contactPersonPhone}</p>}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Address Section */}
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                         <div className="md:col-span-2">
//                             <Label htmlFor="street">Street</Label>
//                             <Input id="street" name="street" value={customerData.address.street} onChange={handleAddressChange} placeholder="e.g., 456 Oak Avenue" />
//                         </div>
//                         <div>
//                             <Label htmlFor="city">City</Label>
//                             <Input id="city" name="city" value={customerData.address.city} onChange={handleAddressChange} placeholder="e.g., Springfield" />
//                         </div>
//                         <div>
//                             <Label htmlFor="state">State</Label>
//                             <Input id="state" name="state" value={customerData.address.state} onChange={handleAddressChange} placeholder="e.g., IL" />
//                         </div>
//                         <div>
//                             <Label htmlFor="zipCode">Zip Code</Label>
//                             <Input id="zipCode" name="zipCode" value={customerData.address.zipCode} onChange={handleAddressChange} placeholder="e.g., 62704" />
//                         </div>
//                         <div>
//                             <Label htmlFor="country">Country</Label>
//                             <Input id="country" name="country" value={customerData.address.country} onChange={handleAddressChange} placeholder="e.g., USA" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-4 pt-8 mt-8 border-t">
//                 <Button type="button" variant="outline" onClick={() => router.push("/books")}>
//                     Cancel
//                 </Button>
//                 <Button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
//                     {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Save Customer</>}
//                 </Button>
//             </div>
//         </form>
//     );
// }
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomerData {
    name: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    contactPerson: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
}

const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

const initialState: CustomerData = {
    name: "",
    email: "",
    phone: "",
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
    },
    contactPerson: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
};

export function AddCustomerForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerData>(initialState);
    const [errors, setErrors] = useState({
        email: "",
        phone: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));

        if (name === "email" || name === "contactPersonEmail") {
            setErrors(prev => ({ ...prev, [name]: (value && !validateEmail(value)) ? "Please enter a valid email." : "" }));
        }
        if (name === "phone" || name === "contactPersonPhone") {
            setErrors(prev => ({ ...prev, [name]: (value && !validatePhone(value)) ? "Phone must be 10-15 digits." : "" }));
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };

    const validateForm = (): boolean => {
        const newErrors = { email: "", phone: "", contactPersonEmail: "", contactPersonPhone: "" };
        let isValid = true;

        if (!validateEmail(customerData.email)) {
            newErrors.email = "Please enter a valid primary email address.";
            isValid = false;
        }
        if (customerData.phone && !validatePhone(customerData.phone)) {
            newErrors.phone = "Primary phone must be 10-15 digits.";
            isValid = false;
        }
        if (customerData.contactPersonEmail && !validateEmail(customerData.contactPersonEmail)) {
            newErrors.contactPersonEmail = "Please enter a valid email for the contact person.";
            isValid = false;
        }
        if (customerData.contactPersonPhone && !validatePhone(customerData.contactPersonPhone)) {
            newErrors.contactPersonPhone = "Contact person's phone must be 10-15 digits.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/addCustomer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
                throw new Error(errorData.message);
            }
            const result = await response.json();
            toast.success(result.message || "Customer added successfully!");
            setCustomerData(initialState);
            setErrors({ email: "", phone: "", contactPersonEmail: "", contactPersonPhone: "" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add customer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-10">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" name="name" value={customerData.name} onChange={handleInputChange} required placeholder="Enter customer name" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" name="email" type="email" value={customerData.email} onChange={handleInputChange} required placeholder="Enter customer email" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                        </div>
                        <div >
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" value={customerData.phone} onChange={handleInputChange} placeholder="Enter customer phone" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl " />
                            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                        </div>

                    </div>
                </div>
                <div className="border-t border-slate-200 my-6"></div>

                {/* Address */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div className="md:col-span-3">
                            <Label htmlFor="street">Street address</Label>
                            <Input id="street" name="street" value={customerData.address.street} onChange={handleAddressChange} placeholder="123 Main St"
                                className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={customerData.address.city} onChange={handleAddressChange} placeholder="Anytown" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="state">State / Province</Label>
                            <Input id="state" name="state" value={customerData.address.state} onChange={handleAddressChange} placeholder="CA" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="zipCode">ZIP / Postal code</Label>
                            <Input id="zipCode" name="zipCode" value={customerData.address.zipCode} onChange={handleAddressChange} placeholder="12345" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                        </div>
                        <div >
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" name="country" value={customerData.address.country} onChange={handleAddressChange} placeholder="United States" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                        </div>
                    </div>
                </div>
                {/* contect person */}
                <div className="border-t border-slate-200 my-6"></div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label htmlFor="contactPerson">Name</Label>
                            <Input id="contactPerson" name="contactPerson" value={customerData.contactPerson} onChange={handleInputChange} placeholder="Enter contact person name" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="contactPersonEmail">Email</Label>
                            <Input id="contactPersonEmail" name="contactPersonEmail" type="email" value={customerData.contactPersonEmail} onChange={handleInputChange} placeholder="Enter contact person email" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                            {errors.contactPersonEmail && <p className="text-sm text-red-600 mt-1">{errors.contactPersonEmail}</p>}
                        </div>
                        <div >
                            <Label htmlFor="contactPersonPhone">Phone</Label>
                            <Input id="contactPersonPhone" name="contactPersonPhone" type="tel" value={customerData.contactPersonPhone} onChange={handleInputChange} placeholder="Enter contact person phone" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
                            {errors.contactPersonPhone && <p className="text-sm text-red-600 mt-1">{errors.contactPersonPhone}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 mt-8 ">
                <Button type="button" variant="outline" onClick={() => setCustomerData(initialState)}>
                    Clear
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Customer"}
                </Button>
            </div>
        </form>
    );
}