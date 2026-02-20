import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Clock, Globe, Smartphone, Users } from "lucide-react";

export default async function ConversationsPage() {
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

  if (!company) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Company not created yet</h2>
        <p className="text-muted-foreground mt-2">
          Please create your company first to use Knowledge Base.
        </p>
      </div>
    );
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      *,
      messages:messages(count)
    `
    )
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
            <p className="text-muted-foreground">
              View and manage customer conversations
            </p>
          </div>
        </div>
      </div>

      {/* Conversations Card */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-foreground">Recent Conversations</CardTitle>
              <CardDescription>
                All conversations from your AI agent
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!conversations || conversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Conversations will appear here when customers start chatting with your AI agent
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {conversations.map((conv) => (
                <li key={conv.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 -mx-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                        {conv.channel === "whatsapp" ? (
                          <Smartphone className="w-5 h-5 text-accent" />
                        ) : (
                          <Globe className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {conv.visitor_id.substring(0, 8)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-secondary">
                            {conv.channel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(conv.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        conv.status === "active"
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "bg-muted text-muted-foreground border border-border/50"
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
