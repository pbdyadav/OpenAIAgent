import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WidgetCodeSnippet } from "@/components/dashboard/widget-code-snippet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, Eye, Sparkles, MessageSquare } from "lucide-react";

export default async function WidgetPage() {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Code className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chat Widget</h1>
            <p className="text-muted-foreground">
              Embed the AI chat widget on your website
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <p className="text-sm text-foreground">
          Just one line of code and your AI-powered support is live on your website!
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Installation</CardTitle>
                <CardDescription>
                  Add this code snippet to your website
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WidgetCodeSnippet companySlug={company.slug} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-foreground">Preview</CardTitle>
                <CardDescription>
                  See how the widget will appear
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-gradient-to-br from-secondary/50 to-secondary rounded-xl overflow-hidden border border-border/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Your website preview</p>
                </div>
              </div>
              {/* Chat bubble preview */}
              <div 
                className="absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: company.settings?.primary_color || "#3b82f6" }}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
