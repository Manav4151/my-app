import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
