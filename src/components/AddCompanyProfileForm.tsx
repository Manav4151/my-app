"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFunctions, ApiError } from "@/services/api.service";

interface CompanyProfileData {
    profileName: string;
    companyName: string;
    phone: string;
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

const initialState: CompanyProfileData = {
    profileName: "",
    companyName: "",
    phone: "",
    email: "",
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
    },
};

export function AddCompanyProfileForm() {
    const [formData, setFormData] = useState<CompanyProfileData>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const addressField = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await apiFunctions.createCompanyProfile(formData);
            if (response.success) {
                toast.success("Profile created successfully!");
                // Reset form
                setFormData(initialState);
            } else {
                throw new Error(response.message || "Failed to create profile");
            }
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : "Failed to create company profile";
            toast.error(errorMessage);
            console.error("Error creating company profile:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-10">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Company Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label htmlFor="profileName" className="text-[var(--text-primary)] font-medium">
                                Profile Name *
                            </Label>
                            <Input
                                id="profileName"
                                name="profileName"
                                type="text"
                                value={formData.profileName}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter profile name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="companyName" className="text-[var(--text-primary)] font-medium">
                                Company Name *
                            </Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter company name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-[var(--text-primary)] font-medium">
                                Phone *
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="text"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-[var(--text-primary)] font-medium">
                                Email *
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 my-6"></div>

                {/* Address */}
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div className="md:col-span-3">
                            <Label htmlFor="street" className="text-[var(--text-primary)] font-medium">
                                Street address *
                            </Label>
                            <Input
                                id="street"
                                name="address.street"
                                type="text"
                                value={formData.address.street}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter street address"
                            />
                        </div>

                        <div>
                            <Label htmlFor="city" className="text-[var(--text-primary)] font-medium">
                                City *
                            </Label>
                            <Input
                                id="city"
                                name="address.city"
                                type="text"
                                value={formData.address.city}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter city"
                            />
                        </div>

                        <div>
                            <Label htmlFor="state" className="text-[var(--text-primary)] font-medium">
                                State / Province *
                            </Label>
                            <Input
                                id="state"
                                name="address.state"
                                type="text"
                                value={formData.address.state}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter state"
                            />
                        </div>

                        <div>
                            <Label htmlFor="zipCode" className="text-[var(--text-primary)] font-medium">
                                ZIP / Postal code *
                            </Label>
                            <Input
                                id="zipCode"
                                name="address.zipCode"
                                type="text"
                                value={formData.address.zipCode}
                                onChange={handleChange}
                                required
                                className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                                placeholder="Enter zip code"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(initialState)}
                >
                    Clear
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                        </>
                    ) : (
                        "Create Profile"
                    )}
                </Button>
            </div>
        </form>
    );
}

