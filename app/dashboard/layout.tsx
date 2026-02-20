import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get or create company for this user with plan info
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, plan, chat_count, chat_limit")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Subtle gradient background for dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>
      <DashboardSidebar company={company} user={user} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
