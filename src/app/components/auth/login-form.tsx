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
import { Loader2, Mail, Lock, BookOpen } from "lucide-react";
import { loginSchema } from "@/lib/zod-schema";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth-context";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
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
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600 text-lg">
          Sign in to access Book Inventory
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold text-sm">Email Address</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      autoComplete="email"
                      className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500 focus:bg-white transition-all duration-200 rounded-xl"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between text-gray-700 font-semibold text-sm">
                  Password
                  <Link
                    href="/forget-password"
                    className="text-amber-600 hover:text-amber-700 hover:underline text-sm font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500 focus:bg-white transition-all duration-200 rounded-xl"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
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
        <div className="text-gray-600 mb-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors">
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
