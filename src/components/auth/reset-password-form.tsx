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
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { resetPasswordSchema } from "@/lib/zod-schema";
import { useRouter } from "next/navigation";
import { resetPasswordWithToken } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    React.useEffect(() => {
        if (!token) {
            toast.error("Invalid token");
            router.replace("/forget-password");
        }
    }, [token, router]);
    const [isLoading, setIsLoading] = React.useState(false);
    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });
    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
        setIsLoading(true);
        try {
            if (!token) return;
            await resetPasswordWithToken({ newPassword: values.newPassword, token });
            toast.success("Password reset successfully");
            router.push("/login");
        } catch (error) {
            const message = (error as { error?: { message?: string } })?.error?.message || "Failed to reset password";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6 w-md">
            <div>
                <h2 className="text-2xl font-bold">Reset Password</h2>
                <p className="text-muted-foreground mt-2">
                    Enter your email to reset your password
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {form.formState.errors.root && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="New Password"
                                            type="password"
                                            autoComplete="new-password"
                                            className="pl-9"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Confirm Password"
                                            type="password"
                                            autoComplete="confirm-password"
                                            className="pl-9"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reset Password...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
