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
import { Loader2, Mail, Lock, BookOpen, Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@/lib/zod-schema";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const { login } = useAuth(); // <-- use login from context
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const result = await login(values.email, values.password);
    setIsLoading(false);
    if (result.success) {
      toast.success("Sign in successful");
      router.push("/");
    } else {
      console.log(result.error, "test login");
      toast.error(result.error || "Login failed");
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome Back</h2>
        <p className="text-[var(--text-secondary)] text-lg">
          Sign in to access Book Inventory
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="p-3 text-sm text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}

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
                      autoComplete="email"
                      className="pl-12 h-12 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:bg-[var(--surface)] transition-all duration-200 rounded-xl"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[var(--error)] text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between text-[var(--text-primary)] font-semibold text-sm">
                  Password
                  <Link
                    href="/forget-password"
                    className="text-[var(--primary)] hover:text-[var(--primary-dark)] hover:underline text-sm font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-[var(--primary)] transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
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
                <FormMessage className="text-[var(--error)] text-sm" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <div className="text-[var(--text-secondary)] mb-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-semibold hover:underline transition-colors">
            Create your account
          </Link>
        </div>
        {/* <div className="text-xs text-gray-500">
          Join thousands of book lovers managing their digital collections
        </div> */}
      </div>
    </div>
  );
}
