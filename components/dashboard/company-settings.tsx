"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_COMPANY_SETTINGS } from "@/lib/constants/companySettings";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Building2, Bot, Palette, CheckCircle2, Save } from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  settings: {
    welcome_message?: string;
    ai_personality?: string;
    primary_color?: string;
  } | null;
}

interface CompanySettingsProps {
  company: Company;
}

export function CompanySettings({ company }: CompanySettingsProps) {
  const settings = {
  ...DEFAULT_COMPANY_SETTINGS,
  ...(company.settings ?? {}),
  company_profile: {
    ...DEFAULT_COMPANY_SETTINGS.company_profile,
    ...(company.settings?.company_profile ?? {}),
  },
  contact: {
    ...DEFAULT_COMPANY_SETTINGS.contact,
    ...(company.settings?.contact ?? {}),
  },
  widget: {
    ...DEFAULT_COMPANY_SETTINGS.widget,
    ...(company.settings?.widget ?? {}),
  },
};

  const [name, setName] = useState(company.name ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(settings.widget.welcome_message
);
  
  const [aiPersonality, setAiPersonality] = useState(settings.ai.personality);

  const [primaryColor, setPrimaryColor] = useState(settings.widget.primary_color);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    console.log("RAW COMPANY DATA:", company);

    console.log("Updating company", {
      companyId: company.id,
      userId: (await supabase.auth.getUser()).data.user?.id,
    });

    const { data: checkData, error: checkError } = await supabase
      .from("companies")
      .select("id, user_id, name")
      .eq("id", company.id)
      .single();

    console.log("CHECK COMPANY ROW:", checkData, checkError);

    try {
      const { data, error } = await supabase
        .from("companies")
        .update({
          name,
          settings: {
            welcome_message: welcomeMessage,
            ai_personality: aiPersonality,
            primary_color: primaryColor,
          },
        })
        .eq("id", company.id)
        .select(); // 🔥 THIS LINE

      console.log("UPDATE RESULT:", { data, error });

      setMessage({ type: "success", text: "Settings saved successfully" });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Company Information</CardTitle>
              <CardDescription>Basic details about your company</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-foreground">Company Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-input border-border focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug" className="text-foreground">Slug</Label>
            <Input
              id="slug"
              value={company.slug ?? ""}
              disabled
              className="bg-muted/50 border-border/50"
            />
            <p className="text-xs text-muted-foreground">
              Used for widget integration. Cannot be changed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-foreground">AI Agent Settings</CardTitle>
              <CardDescription>Customize how your AI agent behaves</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="welcome" className="text-foreground">Welcome Message</Label>
            <Textarea
              id="welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              disabled={isLoading}
              rows={2}
              className="bg-input border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground">
              The first message your AI agent will send
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="personality" className="text-foreground">AI Personality</Label>
            <Textarea
              id="personality"
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
              disabled={isLoading}
              rows={2}
              placeholder="e.g., friendly and casual, professional and formal"
              className="bg-input border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describe how you want your AI to communicate
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Widget Appearance</CardTitle>
              <CardDescription>Customize the chat widget colors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="color" className="text-foreground">Primary Color</Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  id="color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={isLoading}
                  className="w-14 h-14 p-1 cursor-pointer rounded-xl border-border"
                />
              </div>
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-input border-border focus:border-primary font-mono"
              />
            </div>
          </div>
          {/* Color Preview */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Chat Widget Button</p>
                <p className="text-xs text-muted-foreground">This is how the widget will look</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl ${message.type === "success"
          ? "bg-accent/10 border border-accent/20"
          : "bg-destructive/10 border border-destructive/20"
          }`}>
          {message.type === "success" && <CheckCircle2 className="w-5 h-5 text-accent" />}
          <p className={`text-sm ${message.type === "success" ? "text-accent" : "text-destructive"
            }`}>
            {message.text}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </form>
  );
}
