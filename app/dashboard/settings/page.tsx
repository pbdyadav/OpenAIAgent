import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CompanySettings } from "@/components/dashboard/company-settings";
import { BillingSettings } from "@/components/dashboard/billing-settings";
import { CompanyCreateForm } from "@/components/dashboard/company-create-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard } from "lucide-react";


export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ✅ SAFE company fetch
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const params = await searchParams;
  const defaultTab = params.tab || "general";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your company and AI agent settings
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* ✅ GENERAL TAB */}
        <TabsContent value="general">
          {!company ? (
            <CompanyCreateForm userId={user.id} />
          ) : (
            <CompanySettings company={company} />
          )}
        </TabsContent>

        {/* ✅ BILLING TAB */}
        <TabsContent value="billing">
          {!company ? (
            <p className="text-muted-foreground">
              Please create a company first.
            </p>
          ) : (
            <BillingSettings company={company} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
