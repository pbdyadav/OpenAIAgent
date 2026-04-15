import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DateFilter } from "@/components/dashboard/date-filter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  MessageSquare,
  ArrowRight,
  Smartphone,
  TrendingUp,
  Zap,
  CheckCircle2,
  Circle,
  BarChart3,
  Bot,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { date } = (await searchParams) || {};
  const selectedDate = date ? new Date(date) : null;
  const hasSelectedDate = !!selectedDate && !Number.isNaN(selectedDate.getTime());
  const rangeStart = hasSelectedDate ? new Date(selectedDate!) : null;
  const rangeEnd = hasSelectedDate ? new Date(selectedDate!) : null;

  if (rangeStart) rangeStart.setHours(0, 0, 0, 0);
  if (rangeEnd) rangeEnd.setHours(23, 59, 59, 999);

  // Get company with plan info
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: companyConversations } = await supabase
    .from("conversations")
    .select("id, started_at")
    .eq("company_id", company?.id);

  const conversationIds = (companyConversations || []).map((conversation) => conversation.id);

  // Get stats
  const { count: documentCount } = await supabase
    .from("knowledge_documents")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id);

  const { count: conversationCount } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id);

  const { count: messageCount } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
    : { count: 0 };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthConversationCount } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id)
    .gte("started_at", startOfMonth.toISOString());

  const { count: filteredConversationCount } = hasSelectedDate
    ? await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company?.id)
        .gte("started_at", rangeStart!.toISOString())
        .lte("started_at", rangeEnd!.toISOString())
    : { count: conversationCount };

  const { count: assistantMessageCount } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "assistant")
        .in("conversation_id", conversationIds)
        .gte("created_at", hasSelectedDate ? rangeStart!.toISOString() : startOfMonth.toISOString())
        .lte("created_at", hasSelectedDate ? rangeEnd!.toISOString() : new Date().toISOString())
    : { count: 0 };

  const { data: whatsappConfig } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("company_id", company?.id)
    .single();

  const chatCount = monthConversationCount ?? company?.chat_count ?? 0;
  const chatLimit = company?.chat_limit || 50;
  const chatUsagePercent = chatLimit === -1 ? 0 : (chatCount / chatLimit) * 100;

  const onboardingSteps = [
    {
      id: "documents",
      title: "Upload your knowledge base",
      description: "Add documents to train your AI agent",
      href: "/dashboard/knowledge",
      completed: (documentCount || 0) > 0,
    },
    {
      id: "widget",
      title: "Install the chat widget",
      description: "Add the widget to your website",
      href: "/dashboard/widget",
      completed: false,
    },
    {
      id: "whatsapp",
      title: "Connect WhatsApp",
      description: "Enable WhatsApp Business integration",
      href: "/dashboard/whatsapp",
      completed: whatsappConfig?.is_active || false,
    },
  ];

  const completedSteps = onboardingSteps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / onboardingSteps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{company?.name ? `, ${company.name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your AI agent&apos;s performance
        </p>
        <DateFilter value={hasSelectedDate ? date : null} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{filteredConversationCount || 0}</div>
            <Link
              href="/dashboard/conversations"
              className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 mt-2"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 hover:border-accent/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Responses Delivered
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{assistantMessageCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {hasSelectedDate ? "Selected day" : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Knowledge Documents
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{documentCount || 0}</div>
            <Link
              href="/dashboard/knowledge"
              className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 mt-2"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 hover:border-accent/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              WhatsApp Status
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  whatsappConfig?.is_active ? "bg-accent" : "bg-muted-foreground"
                }`}
              />
              <span className="text-lg font-semibold text-foreground">
                {whatsappConfig?.is_active ? "Connected" : "Disconnected"}
              </span>
            </div>
            <Link
              href="/dashboard/whatsapp"
              className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 mt-2"
            >
              {whatsappConfig?.is_active ? "Manage" : "Setup"} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Usage */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Chat Usage
                </CardTitle>
                <CardDescription className="mt-1">
                  Your monthly chat allocation
                </CardDescription>
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                {company?.plan || "free"} Plan
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {chatLimit === -1 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                <Sparkles className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Unlimited Chats</p>
                  <p className="text-sm text-muted-foreground">Pro+ unlimited plan active</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chats used this month</span>
                  <span className="font-medium text-foreground">
                    {chatCount} / {chatLimit}
                  </span>
                </div>
                <Progress value={chatUsagePercent} className="h-3 bg-muted" />
                {chatUsagePercent > 80 && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">
                      You&apos;re running low on chats this month
                    </p>
                    <Link href="/dashboard/settings?tab=billing">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                        Upgrade
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to manage your AI agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/dashboard/knowledge", label: "Upload Documents", icon: FileText },
              { href: "/dashboard/conversations", label: "View Conversations", icon: MessageSquare },
              { href: "/dashboard/analytics", label: "Check Analytics", icon: TrendingUp },
              { href: "/dashboard/settings", label: "Configure Settings", icon: Bot },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Progress */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Getting Started</CardTitle>
              <CardDescription className="mt-1">
                Complete these steps to get the most out of AgentHub
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{completedSteps}/{onboardingSteps.length}</p>
              <p className="text-xs text-muted-foreground">Steps completed</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 mt-4 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {onboardingSteps.map((step) => (
              <Link key={step.id} href={step.href}>
                <div className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  step.completed 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-secondary/30 border-border/50 hover:border-primary/30"
                }`}>
                  <div className="flex items-start gap-3">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${step.completed ? "text-primary" : "text-foreground"}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
