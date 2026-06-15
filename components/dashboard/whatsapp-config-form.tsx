"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function WhatsAppConfigForm({ 
  companyId, 
  initialConfig 
}: { 
  companyId: string,
  initialConfig: any 
}) {
  const [phoneNumberId, setPhoneNumberId] = useState(initialConfig?.phone_number_id || "");
  const [accessToken, setAccessToken] = useState(initialConfig?.access_token || "");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(
    initialConfig?.webhook_verify_token || Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  );
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("whatsapp_config")
        .upsert({
          company_id: companyId,
          phone_number_id: phoneNumberId,
          access_token: accessToken,
          webhook_verify_token: webhookVerifyToken,
          is_active: true
        }, { onConflict: "company_id" });

      if (error) throw error;
      toast.success("WhatsApp configuration saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="phone_number_id">Phone Number ID</Label>
        <Input 
          id="phone_number_id"
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          placeholder="e.g. 10123456789"
          required
        />
        <p className="text-xs text-muted-foreground">Found in the Meta App dashboard under WhatsApp &gt; API Setup.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="access_token">System User Access Token</Label>
        <Input 
          id="access_token"
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="EAA..."
          required
        />
        <p className="text-xs text-muted-foreground">Ensure this token has permissions to send messages.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
        <div className="flex gap-2">
          <Input 
            id="webhook_verify_token"
            value={webhookVerifyToken}
            readOnly
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Copy this token and use it when setting up the webhook in your Meta App.
        </p>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Configuration"}
      </Button>
    </form>
  );
}
