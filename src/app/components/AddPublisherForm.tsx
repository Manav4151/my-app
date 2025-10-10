// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { CheckCircle, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// interface PublisherData {
//     name: string;
//     email: string;
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

// export function AddPublisherForm() {
//     const router = useRouter();
//     const [loading, setLoading] = useState(false);
//     const [publisherData, setPublisherData] = useState<PublisherData>({
//         name: "",
//         email: "",
//         address: {
//             street: "",
//             city: "",
//             state: "",
//             zipCode: "",
//             country: "USA",
//         },
//         contactPerson: "",
//         contactPersonEmail: "",
//         contactPersonPhone: "",
//     });

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setPublisherData({ ...publisherData, [name]: value });
//     };

//     const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setPublisherData({
//             ...publisherData,
//             address: {
//                 ...publisherData.address,
//                 [name]: value,
//             },
//         });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         console.log("Submitting Publisher Data:", publisherData);
//         try {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             toast.success("Publisher added successfully!");
//             router.push("/books"); 
//         } catch (error) {
//             console.error("Error adding publisher:", error);
//             toast.error("Failed to add publisher");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Publisher Information */}
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Publisher Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                             <Label htmlFor="name" className="text-gray-700 font-medium">Name *</Label>
//                             <Input id="name" name="name" value={publisherData.name} onChange={handleInputChange} required placeholder="e.g., Tech Knowledge Press" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div>
//                             <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
//                             <Input id="email" name="email" type="email" value={publisherData.email} onChange={handleInputChange} required placeholder="e.g., info@techknowledge.com" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Address Information */}
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Address</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="md:col-span-2">
//                             <Label htmlFor="street" className="text-gray-700 font-medium">Street</Label>
//                             <Input id="street" name="street" value={publisherData.address.street} onChange={handleAddressChange} placeholder="e.g., 123 Innovation Drive" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div>
//                             <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
//                             <Input id="city" name="city" value={publisherData.address.city} onChange={handleAddressChange} placeholder="e.g., Silicon Valley" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div>
//                             <Label htmlFor="state" className="text-gray-700 font-medium">State</Label>
//                             <Input id="state" name="state" value={publisherData.address.state} onChange={handleAddressChange} placeholder="e.g., CA" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div>
//                             <Label htmlFor="zipCode" className="text-gray-700 font-medium">Zip Code</Label>
//                             <Input id="zipCode" name="zipCode" value={publisherData.address.zipCode} onChange={handleAddressChange} placeholder="e.g., 94043" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div>
//                             <Label htmlFor="country" className="text-gray-700 font-medium">Country</Label>
//                             <Input id="country" name="country" value={publisherData.address.country} onChange={handleAddressChange} placeholder="e.g., USA" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Contact Person Information */}
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Person</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                             <Label htmlFor="contactPerson" className="text-gray-700 font-medium">Name</Label>
//                             <Input id="contactPerson" name="contactPerson" value={publisherData.contactPerson} onChange={handleInputChange} placeholder="e.g., Sarah Chen" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div>
//                             <Label htmlFor="contactPersonEmail" className="text-gray-700 font-medium">Email</Label>
//                             <Input id="contactPersonEmail" name="contactPersonEmail" type="email" value={publisherData.contactPersonEmail} onChange={handleInputChange} placeholder="e.g., sarah.chen@techknowledge.com" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                         <div className="md:col-span-2">
//                             <Label htmlFor="contactPersonPhone" className="text-gray-700 font-medium">Phone</Label>
//                             <Input id="contactPersonPhone" name="contactPersonPhone" type="tel" value={publisherData.contactPersonPhone} onChange={handleInputChange} placeholder="e.g., 1-800-555-0102" className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
//                     <Button type="button" variant="outline" onClick={() => router.push("/books")} className="border-gray-300 text-gray-700 hover:bg-gray-50">
//                         Cancel
//                     </Button>
//                     <Button type="submit" disabled={loading} className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
//                         {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Add Publisher</>}
//                     </Button>
//                 </div>
//             </form>
//         </div>
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

// Interface for PublisherData
interface PublisherData {
    name: string;
    email: string;
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

// Validation utility functions
const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Initial state for easy form resetting
const initialState: PublisherData = {
    name: "",
    email: "",
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    },
    contactPerson: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
};

export function AddPublisherForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [publisherData, setPublisherData] = useState<PublisherData>(initialState);

    // State to hold validation errors
    const [errors, setErrors] = useState({
        email: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPublisherData(prev => ({ ...prev, [name]: value }));

        // Real-time validation
        if (name === "email" || name === "contactPersonEmail") {
            if (value && !validateEmail(value)) {
                setErrors(prev => ({ ...prev, [name]: "Please enter a valid email address." }));
            } else {
                setErrors(prev => ({ ...prev, [name]: "" }));
            }
        }

        if (name === "contactPersonPhone") {
            if (value && !validatePhone(value)) {
                setErrors(prev => ({ ...prev, contactPersonPhone: "Phone number must be between 10 and 15 digits." }));
            } else {
                setErrors(prev => ({ ...prev, contactPersonPhone: "" }));
            }
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPublisherData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };

    const validateForm = (): boolean => {
        const newErrors = { email: "", contactPersonEmail: "", contactPersonPhone: "" };
        let isValid = true;

        if (!validateEmail(publisherData.email)) {
            newErrors.email = "A valid publisher email is required.";
            isValid = false;
        }
        
        if (publisherData.contactPersonEmail && !validateEmail(publisherData.contactPersonEmail)) {
            newErrors.contactPersonEmail = "Please enter a valid email for the contact person.";
            isValid = false;
        }

        if (publisherData.contactPersonPhone && !validatePhone(publisherData.contactPersonPhone)) {
            newErrors.contactPersonPhone = "Phone number must be between 10 and 15 digits.";
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
            const response = await fetch('http://localhost:8000/api/addPublisher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(publisherData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: `API Error: ${response.status} ${response.statusText}`
                }));
                throw new Error(errorData.message || "An unknown error occurred.");
            }

            const result = await response.json();
            toast.success(result.message || "Publisher added successfully!");
            
            // Reset form fields
            setPublisherData(initialState);
            setErrors({ email: "", contactPersonEmail: "", contactPersonPhone: "" });

        } catch (error) {
            console.error("Error submitting publisher data:", error);
            toast.error(error instanceof Error ? error.message : "Failed to add publisher.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-10">
                {/* Publisher Details Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Publisher Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="name">Publisher Name *</Label>
                            <Input id="name" name="name" value={publisherData.name} onChange={handleInputChange} required placeholder="e.g., Tech Knowledge Press" />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={publisherData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., info@techknowledge.com"
                                className={cn(errors.email && "border-red-500 focus:border-red-500")}
                            />
                            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="street">Street</Label>
                            <Input id="street" name="street" value={publisherData.address.street} onChange={handleAddressChange} placeholder="e.g., 123 Innovation Drive" />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={publisherData.address.city} onChange={handleAddressChange} placeholder="e.g., Silicon Valley" />
                        </div>
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input id="state" name="state" value={publisherData.address.state} onChange={handleAddressChange} placeholder="e.g., CA" />
                        </div>
                        <div>
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input id="zipCode" name="zipCode" value={publisherData.address.zipCode} onChange={handleAddressChange} placeholder="e.g., 94043" />
                        </div>
                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" name="country" value={publisherData.address.country} onChange={handleAddressChange} placeholder="e.g., USA" />
                        </div>
                    </div>
                </div>

                {/* Contact Person Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="contactPerson">Full Name</Label>
                            <Input id="contactPerson" name="contactPerson" value={publisherData.contactPerson} onChange={handleInputChange} placeholder="e.g., Sarah Chen" />
                        </div>
                        <div>
                            <Label htmlFor="contactPersonEmail">Email Address</Label>
                            <Input
                                id="contactPersonEmail"
                                name="contactPersonEmail"
                                type="email"
                                value={publisherData.contactPersonEmail}
                                onChange={handleInputChange}
                                placeholder="e.g., sarah.chen@techknowledge.com"
                                className={cn(errors.contactPersonEmail && "border-red-500 focus:border-red-500")}
                            />
                            {errors.contactPersonEmail && <p className="text-sm text-red-600 mt-1">{errors.contactPersonEmail}</p>}
                        </div>
                        <div>
                            <Label htmlFor="contactPersonPhone">Phone Number</Label>
                            <Input
                                id="contactPersonPhone"
                                name="contactPersonPhone"
                                type="tel"
                                value={publisherData.contactPersonPhone}
                                onChange={handleInputChange}
                                placeholder="e.g., 1-800-555-0102"
                                className={cn(errors.contactPersonPhone && "border-red-500 focus:border-red-500")}
                            />
                            {errors.contactPersonPhone && <p className="text-sm text-red-600 mt-1">{errors.contactPersonPhone}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-8 mt-8 border-t">
                <Button type="button" variant="outline" onClick={() => router.push("/books")}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Save Publisher</>}
                </Button>
            </div>
        </form>
    );
}