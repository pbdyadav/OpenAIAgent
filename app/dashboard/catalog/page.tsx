import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CatalogManager from "@/components/dashboard/catalog-manager";
import { Package, Sparkles } from "lucide-react";

export default async function CatalogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Company fetch
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
          Please create your company from Settings to access the Catalog.
        </p>
      </div>
    );
  }

  // Fetch categories and items
  const { data: categories } = await supabase
    .from("catalog_categories")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const { data: items } = await supabase
    .from("catalog_items")
    .select("*, catalog_categories(name)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Product & Service Catalog
            </h1>
            <p className="text-muted-foreground">
              Manage your offerings. The AI will automatically recommend these to customers.
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-accent" />
        <p className="text-sm text-foreground">
          Items added here are prioritized by the AI agent when answering customer inquiries about what you sell.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Categories</p>
          <p className="text-2xl font-bold mt-2">{categories?.length || 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Products</p>
          <p className="text-2xl font-bold mt-2">{items?.filter(i => i.type === 'product').length || 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Services</p>
          <p className="text-2xl font-bold mt-2">{items?.filter(i => i.type === 'service').length || 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">PDFs Uploaded</p>
          <p className="text-2xl font-bold mt-2">{items?.filter(i => i.pdf_url).length || 0}</p>
        </div>
      </div>

      <CatalogManager 
        companyId={company.id} 
        initialCategories={categories || []} 
        initialItems={items || []} 
      />
    </div>
  );
}
