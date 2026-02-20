"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Copy, Check, ExternalLink, Smartphone } from "lucide-react";

interface WhatsAppConfig {
  id: string;
  phone_number_id: string | null;
  access_token: string | null;
  verify_token: string;
  is_active: boolean;
}

interface WhatsAppSetupProps {
  companyId: string;
  config: WhatsAppConfig | null;
}

export function WhatsAppSetup({ companyId, config }: WhatsAppSetupProps) {
  const [phoneNumberId, setPhoneNumberId] = useState(config?.phone_number_id || "");
  const [accessToken, setAccessToken] = useState(config?.access_token || "");
  const [verifyToken] = useState(
    config?.verify_token || crypto.randomUUID().replace(/-/g, "")
  );
  const [isActive, setIsActive] = useState(config?.is_active || false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/whatsapp/webhook`
    : "";

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const data = {
        company_id: companyId,
        phone_number_id: phoneNumberId || null,
        access_token: accessToken || null,
        verify_token: verifyToken,
        is_active: isActive && !!phoneNumberId && !!accessToken,
      };

      if (config) {
        const { error } = await supabase
          .from("whatsapp_config")
          .update(data)
          .eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("whatsapp_config").insert(data);
        if (error) throw error;
      }

      setMessage({ type: "success", text: "WhatsApp settings saved successfully" });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            {config?.is_active
              ? "Your WhatsApp Business is connected and active"
              : "Connect your WhatsApp Business account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  config?.is_active ? "bg-accent" : "bg-muted-foreground"
                }`}
              />
              <span className="font-medium">
                {config?.is_active ? "Connected" : "Not connected"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="active" className="text-sm text-muted-foreground">
                Enable
              </Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={!phoneNumberId || !accessToken}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Use these values when setting up your WhatsApp webhook in the Meta Developer Console
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(webhookUrl, "webhook")}
              >
                {copied === "webhook" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Verify Token</Label>
            <div className="flex gap-2">
              <Input value={verifyToken} readOnly className="font-mono text-sm" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(verifyToken, "verify")}
              >
                {copied === "verify" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business API Credentials</CardTitle>
          <CardDescription>
            Enter your credentials from the Meta Developer Console
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone Number ID</Label>
            <Input
              id="phone"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="Enter your WhatsApp Phone Number ID"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="token">Access Token</Label>
            <Input
              id="token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your WhatsApp Access Token"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Your access token is encrypted and stored securely
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit bg-transparent"
            asChild
          >
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              WhatsApp API Setup Guide
            </a>
          </Button>
        </CardContent>
      </Card>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-accent" : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}
