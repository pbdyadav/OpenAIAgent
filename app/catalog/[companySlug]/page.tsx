import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Package, Download, ExternalLink, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

type PageProps = {
  params: Promise<{
    companySlug: string;
  }>;
};

export default async function PublicCatalogPage({ params }: PageProps) {
  const { companySlug } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, address, website_url, contact_number, whatsapp_number")
    .eq("slug", companySlug)
    .maybeSingle();

  if (!company) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("catalog_categories")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const { data: items } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  // Group items by category, and have an un-categorized array
  const categorizedItems = (categories || []).map((cat) => {
    return {
      ...cat,
      items: (items || []).filter((item) => item.category_id === cat.id),
    };
  }).filter(cat => cat.items.length > 0);

  const uncategorizedItems = (items || []).filter((item) => !item.category_id);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2b2218] font-sans selection:bg-[#a54d2d] selection:text-white">
      {/* Header / Hero Section */}
      <header className="pt-20 pb-16 px-6 sm:px-12 lg:px-24 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2b2218]">
            {company.name} <span className="text-[#a54d2d]">Portfolio & Catalog</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our curated selection of high-quality products and professional services.
          </p>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto py-12 px-6 sm:px-12 lg:px-24 space-y-16">
        
        {categorizedItems.map((category) => (
          <section key={category.id} className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-2 inline-block pr-8">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((item) => (
                <CatalogItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        {uncategorizedItems.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-2 inline-block pr-8">Other Offerings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {uncategorizedItems.map((item) => (
                <CatalogItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {(!items || items.length === 0) && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground">No items available yet</h3>
            <p className="text-muted-foreground mt-2">Please check back later.</p>
          </div>
        )}

      </main>
    </div>
  );
}

function CatalogItemCard({ item }: { item: any }) {
  return (
    <div className="group bg-white rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Featured Image */}
      {item.image_url ? (
        <div className="relative h-48 w-full bg-secondary/30 overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="relative h-48 w-full bg-secondary/30 flex items-center justify-center border-b border-border">
           <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
        {item.type}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold leading-tight mb-2">{item.name}</h3>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
            {item.description}
          </p>
        )}

        <div className="mt-auto space-y-4 pt-4 border-t border-border">
          {item.price && (
            <div className="text-lg font-semibold text-[#a54d2d]">
              ${item.price}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {item.pdf_url && (
              <a 
                href={item.pdf_url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-4 py-2 bg-[#f7ecdf] text-[#a54d2d] hover:bg-[#ebd5bd] font-medium text-sm rounded-xl transition-colors w-full justify-center"
              >
                <Download className="w-4 h-4" /> Download Brochure
              </a>
            )}
            
            {item.external_link && (
              <a 
                href={item.external_link} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary text-foreground font-medium text-sm rounded-xl transition-colors w-full justify-center"
              >
                <ExternalLink className="w-4 h-4" /> Visit Link
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
