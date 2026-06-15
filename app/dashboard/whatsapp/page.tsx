import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WhatsAppConfigForm from "@/components/dashboard/whatsapp-config-form";
import { Smartphone, Sparkles, Link2 } from "lucide-react";
import { headers } from "next/headers";

export default async function WhatsAppPage() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Company fetch
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Company not created yet</h2>
        <p className="text-muted-foreground mt-2">
          Please create your company from Settings to enable WhatsApp.
        </p>
      </div>
    );
  }

  const { data: config } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("company_id", company.id)
    .maybeSingle();

  // Construct webhook url
  const headersList = await headers();
  const host = headersList.get("host") || "your-domain.com";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/webhooks/whatsapp`;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-accent" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">
              WhatsApp Integration
            </h1>

            <p className="text-muted-foreground">
              Connect to the official Meta WhatsApp Cloud API.
            </p>
          </div>

        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-accent" />

        <p className="text-sm text-foreground">
          Your AI agent will automatically reply to incoming WhatsApp webhooks using your Knowledge Base.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-xl border flex flex-col gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5 text-muted-foreground" />
            Meta API Configuration
          </h2>
          <WhatsAppConfigForm companyId={company.id} initialConfig={config} />
        </div>

        <div className="p-6 bg-card rounded-xl border flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Webhook URL</h2>
          <p className="text-sm text-muted-foreground">
            Provide this URL to your Meta App when setting up the WhatsApp Webhook subscription.
          </p>
          <div className="p-3 bg-muted rounded-md border text-sm break-all font-mono">
            {webhookUrl}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            If testing locally, use a tool like ngrok to expose your localhost to the internet.
          </p>
        </div>
      </div>

    </div>
  );
}
