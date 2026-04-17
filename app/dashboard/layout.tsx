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

  const { count: totalConversationCount } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id)

  return (
    <div className="min-h-screen flex bg-[#f5efe6] text-[#1f1a17]">
      <div className="fixed inset-0 pointer-events-none paper-grid opacity-35" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_right,_rgba(202,123,69,0.16),_transparent_55%)] pointer-events-none" />
      <DashboardSidebar company={company} user={user} usageCount={totalConversationCount || 0} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
