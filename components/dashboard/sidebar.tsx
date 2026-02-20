"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bot,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Smartphone,
  BarChart3,
  Code,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Company {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  chat_count?: number;
  chat_limit?: number;
}

interface DashboardSidebarProps {
  company: Company | null;
  user: User;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: FileText },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/widget", label: "Widget", icon: Code },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: Smartphone },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const planConfig = {
  free: { label: "Free", icon: Sparkles, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50" },
  pro: { label: "Pro", icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  pro_plus: { label: "Pro+", icon: Crown, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
};

export function DashboardSidebar({ company, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const plan = (company?.plan || "free") as keyof typeof planConfig;
  const planInfo = planConfig[plan];
  const PlanIcon = planInfo.icon;
  const chatUsage = company?.chat_limit === -1 
    ? "Unlimited" 
    : `${company?.chat_count || 0} / ${company?.chat_limit || 50}`;

  return (
    <aside className="w-64 border-r border-border/50 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AgentHub</span>
        </Link>
      </div>

      {/* Plan Badge */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className={cn("rounded-xl p-4 border", planInfo.bg, planInfo.border)}>
          <div className="flex items-center gap-2 mb-2">
            <PlanIcon className={cn("w-4 h-4", planInfo.color)} />
            <span className={cn("text-sm font-semibold", planInfo.color)}>
              {planInfo.label} Plan
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Chats: {chatUsage}
          </div>
          {plan === "free" && (
            <Link href="/dashboard/settings?tab=billing">
              <Button size="sm" className="w-full mt-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-xs h-8">
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className="px-4 py-2 mb-2">
          <p className="text-xs text-muted-foreground">Company</p>
          <p className="text-sm font-medium text-foreground truncate">
            {company?.name || "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-medium text-foreground">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
