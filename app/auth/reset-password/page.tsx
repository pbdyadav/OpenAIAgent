"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
    setTimeout(() => router.push("/auth/login"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] px-4 text-[#1f1a17]">
      <div className="fixed inset-0 pointer-events-none paper-grid opacity-40" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center">
        <Card className="w-full max-w-md rounded-[2rem] border-[#1f1a17]/10 bg-[#fffaf3] shadow-[0_24px_80px_rgba(31,24,16,0.16)]">
          <CardHeader className="text-center">
            <div className="mb-6 flex justify-center">
              <BrandLogo imageClassName="h-8 w-auto" />
            </div>
            <CardTitle className="font-display text-4xl text-[#1f1a17]">Reset password</CardTitle>
            <CardDescription className="text-base text-[#6e6257]">
              Choose a new password for your AgentHub account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-[#6a4b19]">
                Password updated successfully. Redirecting to login...
              </div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-[#413831]">
                    New password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7665]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl border-[#1f1a17]/10 bg-[#f8f1e8] pl-10 text-[#1f1a17] placeholder:text-[#9a897b]"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword" className="text-[#413831]">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7665]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 rounded-2xl border-[#1f1a17]/10 bg-[#f8f1e8] pl-10 text-[#1f1a17] placeholder:text-[#9a897b]"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-full bg-[#1f1a17] text-[#fff7ef] hover:bg-[#3b312b]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update password
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-[#6e6257]">
                  Return to{" "}
                  <Link href="/auth/login" className="font-medium text-[#a54d2d] hover:text-[#8f4023]">
                    sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
