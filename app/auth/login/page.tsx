"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Mail, Lock, ArrowRight, RefreshCcw } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setIsResetting(true);
    setError(null);
    setResetMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsResetting(false);
      return;
    }

    setResetMessage("Password reset email sent. Please check your inbox.");
    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] text-[#1f1a17]">
      <div className="fixed inset-0 pointer-events-none paper-grid opacity-40" />
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden flex-1 items-center justify-center p-12 lg:flex">
          <div className="max-w-lg">
            <div className="mb-8">
              <BrandLogo imageClassName="h-10 w-auto" />
            </div>
            <p className="text-sm uppercase tracking-[0.26em] text-[#8a7665]">Sign in</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">
              Come back to the workspace where each company gets its own AI support setup.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#5f564e]">
              Review conversations, update knowledge, and manage website plus WhatsApp support from one place.
            </p>
            <div className="mt-10 grid gap-4">
              {[
                "See what the assistant answered and where customers needed handoff.",
                "Keep knowledge files, policies, and company tone up to date.",
                "Move clients from setup to live support without changing tools.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-[#1f1a17]/10 bg-[#fffaf3] p-5 text-base leading-7 text-[#413831]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md rounded-[2rem] border-[#1f1a17]/10 bg-[#fffaf3] shadow-[0_24px_80px_rgba(31,24,16,0.16)]">
            <CardHeader className="pb-8 text-center">
              <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
                <BrandLogo imageClassName="h-8 w-auto" />
              </div>
              <CardTitle className="font-display text-4xl text-[#1f1a17]">Sign in</CardTitle>
              <CardDescription className="text-base text-[#6e6257]">
                Access your dashboard and continue setting up support for your clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-[#413831]">
                    Email
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl border-[#1f1a17]/10 bg-[#f8f1e8] pl-10 text-[#1f1a17] placeholder:text-[#9a897b]"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-[#7a6d61]">
                      Forgot your password? Reset it from here.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-0 text-[#a54d2d] hover:bg-transparent hover:text-[#8f4023]"
                      onClick={handleForgotPassword}
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                          Forgot password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {resetMessage && (
                  <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-[#6a4b19]">
                    {resetMessage}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-full bg-[#1f1a17] text-[#f7f1e8] hover:bg-[#3b312b]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-[#6e6257]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-[#a54d2d] hover:text-[#8f4023]"
                >
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
