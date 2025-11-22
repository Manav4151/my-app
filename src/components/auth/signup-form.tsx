"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, BookOpen, Eye, EyeOff } from "lucide-react";
import { signupSchema } from "@/lib/zod-schema";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "../auth-context";

export function SignUpForm() {
    const { fetchUser } = useAuth()
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const router = useRouter();
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
    async function onSubmit(values: z.infer<typeof signupSchema>) {
        setIsLoading(true);
        await authClient.signUp.email(
            {
                email: values.email,
                password: values.password,
                name: values.name,

            },
            {
                onSuccess: async () => {
                    await fetchUser();
                    toast.success("Sign up successful");
                    router.push("/");
                    setIsLoading(false);
                },
                onError: (error) => {
                    toast.error(error.error.message || error.error.statusText);
                    setIsLoading(false);
                },
            },
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Create Your Account</h2>
                <p className="text-[var(--text-secondary)] text-lg">
                    Start building your digital book collection today
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {form.formState.errors.root && (
                        <div className="p-3 text-sm text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-md">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[var(--text-primary)] font-semibold text-sm">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-[var(--primary)] transition-colors" />
                                                <Input
                                                    placeholder="Enter your full name"
                                                    className="pl-12 h-12 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:bg-[var(--surface)] transition-all duration-200 rounded-xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600 text-sm" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[var(--text-primary)] font-semibold text-sm">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-[var(--primary)] transition-colors" />
                                                <Input
                                                    placeholder="Enter your email"
                                                    type="email"
                                                    className="pl-12 h-12 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:bg-[var(--surface)] transition-all duration-200 rounded-xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600 text-sm" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>


                    {/* Password */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[var(--text-primary)] font-semibold text-sm">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-[var(--primary)] transition-colors" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a password"
                                                    className="pl-12 pr-12 h-12 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:bg-[var(--surface)] transition-all duration-200 rounded-xl"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors focus:outline-none"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600 text-sm" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[var(--text-primary)] font-semibold text-sm">Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-[var(--primary)] transition-colors" />
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm your password"
                                                    className="pl-12 pr-12 h-12 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:bg-[var(--surface)] transition-all duration-200 rounded-xl"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors focus:outline-none"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600 text-sm" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormDescription className="text-[var(--text-secondary)] text-sm bg-[var(--warning)]/10 p-3 rounded-lg border border-[var(--warning)]/20">
                            <strong>Password requirements:</strong> At least 8 characters with uppercase, lowercase, number and special character
                        </FormDescription>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Your Account...
                            </>
                        ) : (
                            <>
                                <BookOpen className="mr-2 h-5 w-5" />
                                Create Account
                            </>
                        )}
                    </Button>
                </form>
            </Form>
            <div className="text-center">
                <div className="text-[var(--text-secondary)] mb-4">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-semibold hover:underline transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                    Start organizing your book collection in minutes
                </div>
            </div>
        </div>
    );
}
