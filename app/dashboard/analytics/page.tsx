import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Users, Clock, TrendingUp, BarChart3, Zap } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: company } = await supabase
  .from("companies")
  .select("*")
  .eq("user_id", user.id)
  .maybeSingle();

if (!company) {
  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-semibold">Company not set up</h2>
      <p className="text-muted-foreground mt-2">
        Please complete company setup from Settings.
      </p>
    </div>
  );
}

  // Get analytics data
  const { count: totalConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id);

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id);

  // Get conversations from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .gte("created_at", sevenDaysAgo.toISOString());

  const stats = [
    {
      label: "Total Conversations",
      value: totalConversations || 0,
      icon: MessageSquare,
      description: "All time",
      color: "primary",
    },
    {
      label: "Total Messages",
      value: totalMessages || 0,
      icon: Users,
      description: "All time",
      color: "accent",
    },
    {
      label: "Last 7 Days",
      value: recentConversations || 0,
      icon: Clock,
      description: "Conversations",
      color: "primary",
    },
    {
      label: "Avg. Messages",
      value:
        totalConversations && totalMessages
          ? Math.round(totalMessages / totalConversations)
          : 0,
      icon: TrendingUp,
      description: "Per conversation",
      color: "accent",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track your AI agent&apos;s performance and engagement
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Activity Overview</CardTitle>
              <CardDescription>
                Conversation trends over time
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {totalConversations === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No data yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Analytics will populate as customers interact with your AI agent
              </p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center rounded-xl bg-secondary/30 border border-border/50">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
