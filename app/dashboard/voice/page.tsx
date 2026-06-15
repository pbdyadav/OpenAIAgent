import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CallsTable from "@/components/dashboard/voice/calls-table";
import { Mic, PhoneIncoming, Users } from "lucide-react";

export default async function VoiceAIPage() {
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
          Please create your company from Settings to access the Voice AI Dashboard.
        </p>
      </div>
    );
  }

  // Fetch call sessions
  const { data: calls } = await supabase
    .from("call_sessions")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const totalCalls = calls?.length || 0;
  const totalLeads = calls?.filter(c => c.lead_name || c.lead_phone || c.lead_requirement).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Mic className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Inbound Voice AI
            </h1>
            <p className="text-muted-foreground">
              Monitor calls answered by your AI Receptionist.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-secondary rounded-full">
            <PhoneIncoming className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total AI Calls</p>
            <p className="text-3xl font-bold">{totalCalls}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-full">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Extracted Leads</p>
            <p className="text-3xl font-bold">{totalLeads}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Call Logs</h2>
        <CallsTable calls={calls || []} />
      </div>
    </div>
  );
}
