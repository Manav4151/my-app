"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { forgetPasswordSchema } from "@/lib/zod-schema";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ForgetPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter(); // <-- use login from context
  const form = useForm<z.infer<typeof forgetPasswordSchema>>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  async function onSubmit(values: z.infer<typeof forgetPasswordSchema>) {
    setIsLoading(true);
    authClient
      .forgetPassword({
        email: values.email,
        redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password`,
      })
      .then(() => {
        setIsLoading(false);
        toast.success("Password reset link sent if email exists.");
        router.push("/login");
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(error.error.message || error.error.statusText);
      });
  }

  return (
    <div className="space-y-6 w-md">
      <div>
        <h2 className="text-2xl font-bold">Forget Password</h2>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      autoComplete="email"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
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
