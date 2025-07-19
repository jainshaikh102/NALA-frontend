import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form className="space-y-6" action="#" method="POST">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email address"
          />
        </div>

        <Button type="submit" className="w-full">
          Send reset link
        </Button>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:text-primary/80"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
