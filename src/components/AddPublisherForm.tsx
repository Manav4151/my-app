"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFunctions } from "@/services/api.service";

interface PublisherData {
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

const initialState: PublisherData = {
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

export function AddPublisherForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [publisherData, setPublisherData] = useState<PublisherData>(initialState);
    const [errors, setErrors] = useState({
        email: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
        phone: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPublisherData(prev => ({ ...prev, [name]: value }));

        if (name === "email" || name === "contactPersonEmail") {
            setErrors(prev => ({ ...prev, [name]: (value && !validateEmail(value)) ? "Please enter a valid email." : "" }));
        }
        if (name === "contactPersonPhone") {
            setErrors(prev => ({ ...prev, [name]: (value && !validatePhone(value)) ? "Phone must be 10-15 digits." : "" }));
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPublisherData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };

    const validateForm = (): boolean => {
        const newErrors = { email: "", contactPersonEmail: "", contactPersonPhone: "", phone: "" };
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
            const response = await apiFunctions.addPublisher(publisherData);
            if (!response.success) {
                throw new Error(response.message);
            }

            toast.success(response.message || "Publisher added successfully!");
            setPublisherData(initialState);
            setErrors({ email: "", contactPersonEmail: "", contactPersonPhone: "", phone: "" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add publisher.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-10">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Publisher Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" name="name" value={publisherData.name} onChange={handleInputChange} required placeholder="Enter publisher name" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" name="email" type="email" value={publisherData.email} onChange={handleInputChange} required placeholder="Enter publisher email" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                            {errors.email && <p className="text-sm text-[var(--error)] mt-1">{errors.email}</p>}
                        </div>
                        <div >
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" value={publisherData.phone} onChange={handleInputChange} placeholder="Enter publisher phone" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl " />
                            {errors.phone && <p className="text-sm text-[var(--error)] mt-1">{errors.phone}</p>}
                        </div>

                    </div>
                </div>
                <div className="border-t border-[var(--border)] my-6"></div>

                {/* Address */}
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div className="md:col-span-3">
                            <Label htmlFor="street">Street address</Label>
                            <Input id="street" name="street" value={publisherData.address.street} onChange={handleAddressChange} placeholder="123 Main St"
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={publisherData.address.city} onChange={handleAddressChange} placeholder="Anytown" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="state">State / Province</Label>
                            <Input id="state" name="state" value={publisherData.address.state} onChange={handleAddressChange} placeholder="CA" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="zipCode">ZIP / Postal code</Label>
                            <Input id="zipCode" name="zipCode" value={publisherData.address.zipCode} onChange={handleAddressChange} placeholder="12345" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                        </div>
                        <div >
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" name="country" value={publisherData.address.country} onChange={handleAddressChange} placeholder="United States" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                        </div>
                    </div>
                </div>
                {/* contect person */}
                <div className="border-t border-[var(--border)] my-6"></div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label htmlFor="contactPerson">Name</Label>
                            <Input id="contactPerson" name="contactPerson" value={publisherData.contactPerson} onChange={handleInputChange} placeholder="Enter contact person name" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                        </div>
                        <div>
                            <Label htmlFor="contactPersonEmail">Email</Label>
                            <Input id="contactPersonEmail" name="contactPersonEmail" type="email" value={publisherData.contactPersonEmail} onChange={handleInputChange} placeholder="Enter contact person email" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                            {errors.contactPersonEmail && <p className="text-sm text-[var(--error)] mt-1">{errors.contactPersonEmail}</p>}
                        </div>
                        <div >
                            <Label htmlFor="contactPersonPhone">Phone</Label>
                            <Input id="contactPersonPhone" name="contactPersonPhone" type="tel" value={publisherData.contactPersonPhone} onChange={handleInputChange} placeholder="Enter contact person phone" className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl" />
                            {errors.contactPersonPhone && <p className="text-sm text-[var(--error)] mt-1">{errors.contactPersonPhone}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 mt-8 ">
                <Button type="button" variant="outline" onClick={() => setPublisherData(initialState)}>
                    Clear
                </Button>
                <Button type="submit" disabled={loading} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Publisher"}
                </Button>
            </div>
        </form>
    );
}
