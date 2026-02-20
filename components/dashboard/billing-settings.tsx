"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  plan: string;
  chat_count: number;
  chat_limit: number;
}

interface BillingSettingsProps {
  company: Company;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out AgentHub",
    features: ["50 chats per month", "1 AI agent", "Website widget", "Basic analytics", "Email support"],
    icon: Sparkles,
    color: "muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing businesses",
    features: ["10,000 chats per month", "3 AI agents", "WhatsApp integration", "Advanced analytics", "Priority support", "Custom branding"],
    icon: Zap,
    color: "primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: "$149",
    period: "/month",
    description: "Unlimited scale for enterprises",
    features: ["Unlimited chats", "Unlimited AI agents", "All integrations", "Custom AI training", "Dedicated support", "SLA guarantee", "API access"],
    icon: Crown,
    color: "accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
  },
];

export function BillingSettings({ company }: BillingSettingsProps) {
  const currentPlan = plans.find(p => p.id === company.plan) || plans[0];
  const chatUsagePercent = company.chat_limit === -1 ? 0 : (company.chat_count / company.chat_limit) * 100;

  return (
    <div className="space-y-8">
      {/* Current Plan Usage */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentPlan.bg)}>
                <currentPlan.icon className={cn("w-5 h-5", `text-${currentPlan.color}`)} />
              </div>
              <div>
                <CardTitle className="text-foreground">Current Plan: {currentPlan.name}</CardTitle>
                <CardDescription>
                  {currentPlan.description}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{currentPlan.price}</p>
              <p className="text-sm text-muted-foreground">{currentPlan.period}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Chat usage this month</span>
              <span className="text-sm font-medium text-foreground">
                {company.chat_limit === -1 ? "Unlimited" : `${company.chat_count} / ${company.chat_limit}`}
              </span>
            </div>
            {company.chat_limit !== -1 && (
              <Progress value={chatUsagePercent} className="h-2 bg-muted" />
            )}
            {company.chat_limit === -1 && (
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent">Unlimited chats with Pro+ plan</span>
              </div>
            )}
          </div>
          {chatUsagePercent > 80 && company.chat_limit !== -1 && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
              <p className="text-sm text-destructive">
                You&apos;re running low on chats. Upgrade to continue uninterrupted service.
              </p>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                Upgrade Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === company.plan;
            const PlanIcon = plan.icon;
            
            return (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative transition-all duration-300",
                  isCurrent ? "border-2 border-primary/50 bg-primary/5" : "bg-card border-border/50 hover:border-border"
                )}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Current Plan
                  </div>
                )}
                <CardHeader className="pt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", plan.bg)}>
                      <PlanIcon className={cn("w-4 h-4", `text-${plan.color}`)} />
                    </div>
                    <CardTitle className="text-lg text-foreground">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", plan.bg)}>
                          <Check className={cn("w-2.5 h-2.5", `text-${plan.color}`)} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button disabled className="w-full bg-muted text-muted-foreground">
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className={cn(
                        "w-full",
                        plan.id === "pro" 
                          ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      )}
                    >
                      {plans.findIndex(p => p.id === company.plan) < plans.findIndex(p => p.id === plan.id) 
                        ? "Upgrade" 
                        : "Downgrade"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing Info Note */}
      <Card className="bg-secondary/30 border-border/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Plan changes take effect immediately. Upgrading will prorate your billing cycle.
            Contact support for custom enterprise pricing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
