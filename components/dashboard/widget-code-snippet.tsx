"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface WidgetCodeSnippetProps {
  companySlug: string;
}

export function WidgetCodeSnippet({ companySlug }: WidgetCodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = "https://openai.imalag.com";

  const codeSnippet = `<!-- AgentHub AI Chatbot -->
<script>
window.AgentHubConfig = {
  botId: "${companySlug}"
};
</script>

<script src="${baseUrl}/widget.js" async></script>
`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className="text-foreground">{codeSnippet}</code>
      </pre>
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
