"use client";

import React from "react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { Loader2, Check, Mail, Lock, Building2, ArrowRight, Sparkles } from "lucide-react";

const planFeatures = {
  free: ["50 chats/month", "1 AI agent", "Website widget", "Basic analytics"],
  pro: ["10,000 chats/month", "3 AI agents", "WhatsApp integration", "Priority support"],
  pro_plus: ["Unlimited chats", "Unlimited agents", "All integrations", "Dedicated support"],
};

function SignUpForm() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: {
          company_name: companyName,
          plan: selectedPlan,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  const features = planFeatures[selectedPlan as keyof typeof planFeatures] || planFeatures.free;
  const planLabel =
    selectedPlan === "pro_plus"
      ? "Pro+"
      : selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f5efe6] px-4 text-[#1f1a17]">
        <div className="fixed inset-0 pointer-events-none paper-grid opacity-40" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md rounded-[2rem] border-[#1f1a17]/10 bg-[#fffaf3]">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7d5c4]">
                  <Check className="h-8 w-8 text-[#a54d2d]" />
                </div>
              </div>
              <CardTitle className="font-display text-4xl text-[#1f1a17]">Check your email</CardTitle>
              <CardDescription className="text-base text-[#6e6257]">
                We&apos;ve sent a confirmation link to <strong className="text-[#1f1a17]">{email}</strong>.
                Please click the link to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-[#6e6257]">
                Already confirmed?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-[#a54d2d] hover:text-[#8f4023]"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] text-[#1f1a17]">
      <div className="fixed inset-0 pointer-events-none paper-grid opacity-40" />
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md rounded-[2rem] border-[#1f1a17]/10 bg-[#fffaf3] shadow-[0_24px_80px_rgba(31,24,16,0.16)]">
            <CardHeader className="pb-8 text-center">
              <div className="mb-6 flex items-center justify-center gap-3">
                <BrandLogo imageClassName="h-8 w-auto" />
              </div>
              <CardTitle className="font-display text-4xl text-[#1f1a17]">Create your account</CardTitle>
              <CardDescription className="text-base text-[#6e6257]">
                Start building your support workflow with a plan that matches your current stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="rounded-3xl border border-[#a54d2d]/15 bg-[#f7ecdf] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#a54d2d]" />
                      <span className="text-sm font-medium text-[#7b4b2c]">{planLabel} Plan</span>
                    </div>
                    <Link href="/#pricing" className="text-xs text-[#6e6257] hover:text-[#1f1a17]">
                      Change plan
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="company" className="text-[#413831]">
                    Company name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7665]" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-12 rounded-2xl border-[#1f1a17]/10 bg-[#f8f1e8] pl-10 text-[#1f1a17] placeholder:text-[#9a897b]"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-[#413831]">
                    Work Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7665]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-2xl border-[#1f1a17]/10 bg-[#f8f1e8] pl-10 text-[#1f1a17] placeholder:text-[#9a897b]"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-[#413831]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7665]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl border-[#1f1a17]/10 bg-[#f8f1e8] pl-10 text-[#1f1a17] placeholder:text-[#9a897b]"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-[#7a6d61]">Must be at least 8 characters</p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-full bg-[#a54d2d] text-[#fff7ef] hover:bg-[#8f4023]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-[#7a6d61]">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
              <p className="mt-6 text-center text-sm text-[#6e6257]">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-[#a54d2d] hover:text-[#8f4023]"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="hidden flex-1 items-center justify-center p-12 lg:flex">
          <div className="max-w-lg">
            <p className="text-sm uppercase tracking-[0.26em] text-[#8a7665]">Selected plan</p>
            <h2 className="mt-4 font-display text-5xl leading-tight">
              {planLabel} gives you a cleaner starting point than a generic AI demo stack.
            </h2>
            <div className="mt-10 space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-3xl border border-[#1f1a17]/10 bg-[#fffaf3] p-5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7d5c4]">
                    <Check className="h-4 w-4 text-[#a54d2d]" />
                  </div>
                  <span className="text-base text-[#413831]">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-[2rem] border border-dashed border-[#a54d2d]/30 bg-[#f7ecdf] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-[#8a7665]">Setup note</p>
              <p className="mt-3 text-base leading-7 text-[#413831]">
                Use website chat as the fastest path to launch, then add WhatsApp through the official business onboarding flow when each client is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
