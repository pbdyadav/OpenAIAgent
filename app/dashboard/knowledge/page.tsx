import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KnowledgeUpload } from "@/components/dashboard/knowledge-upload";
import { DocumentList } from "@/components/dashboard/document-list";
import { FileText, Sparkles } from "lucide-react";

export default async function KnowledgePage() {
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

  const { data: documents } = await supabase
    .from("knowledge_documents")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Upload documents and content for your AI agent to learn from
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <p className="text-sm text-foreground">
          Your AI agent will use these documents to answer customer questions accurately and contextually.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <KnowledgeUpload companyId={company.id} />
        <DocumentList documents={documents || []} companyId={company.id} />
      </div>
    </div>
  );
}
