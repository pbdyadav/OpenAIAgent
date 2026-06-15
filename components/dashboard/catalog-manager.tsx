"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCatalogCategory, createCatalogItem, deleteCatalogCategory, deleteCatalogItem } from "@/app/dashboard/catalog/actions";
import { Trash2, Plus, Tag, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CatalogManager({ companyId, initialCategories, initialItems }: any) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  
  // Category State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Item State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [newItem, setNewItem] = useState({
    name: "", type: "product", price: "", description: "", category_id: ""
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const cat = await createCatalogCategory(companyId, newCategoryName);
      setCategories([cat, ...categories]);
      setNewCategoryName("");
      setIsAddingCategory(false);
      toast.success("Category added!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const supabase = createClient();
      let image_url = null;
      let pdf_url = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${companyId}/images/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('catalog_assets').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('catalog_assets').getPublicUrl(filePath);
        image_url = data.publicUrl;
      }

      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${companyId}/pdfs/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('catalog_assets').upload(filePath, pdfFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('catalog_assets').getPublicUrl(filePath);
        pdf_url = data.publicUrl;
      }

      const payload = {
        company_id: companyId,
        ...newItem,
        price: newItem.price ? parseFloat(newItem.price) : null,
        category_id: newItem.category_id || null,
        image_url,
        pdf_url
      };

      const item = await createCatalogItem(payload);
      
      const categoryName = categories.find((c:any) => c.id === item.category_id)?.name;
      setItems([{...item, catalog_categories: { name: categoryName }}, ...items]);
      
      setIsAddingItem(false);
      setNewItem({ name: "", type: "product", price: "", description: "", category_id: "" });
      setImageFile(null);
      setPdfFile(null);
      toast.success("Item added!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteCatalogItem(id);
      setItems(items.filter((i:any) => i.id !== id));
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCatalogCategory(id);
      setCategories(categories.filter((c:any) => c.id !== id));
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Categories Sidebar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Button size="sm" variant="outline" onClick={() => setIsAddingCategory(!isAddingCategory)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {isAddingCategory && (
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input 
              placeholder="Category name..." 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)} 
            />
            <Button type="submit" size="sm">Add</Button>
          </form>
        )}

        <div className="space-y-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-card border rounded-lg">
              <span className="text-sm font-medium">{cat.name}</span>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
        </div>
      </div>

      {/* Items Main Area */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Items</h2>
          <Button size="sm" onClick={() => setIsAddingItem(!isAddingItem)}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>

        {isAddingItem && (
          <form onSubmit={handleAddItem} className="p-5 bg-card border shadow-sm rounded-xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newItem.type} 
                  onChange={e => setNewItem({...newItem, type: e.target.value})}
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Price (Optional)</Label>
                <Input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newItem.category_id} 
                  onChange={e => setNewItem({...newItem, category_id: e.target.value})}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Featured Image</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImageFile(e.target.files?.[0] || null)} 
                  className="cursor-pointer"
                />
                {imageFile && <p className="text-xs text-muted-foreground truncate">{imageFile.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileText className="w-4 h-4" /> PDF Brochure</Label>
                <Input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={e => setPdfFile(e.target.files?.[0] || null)} 
                  className="cursor-pointer"
                />
                {pdfFile && <p className="text-xs text-muted-foreground truncate">{pdfFile.name}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddingItem(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading & Saving..." : "Save Item"}
              </Button>
            </div>
          </form>
        )}

        <div className="grid gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between p-4 bg-card border rounded-xl gap-4">
              <div className="flex gap-4">
                {item.image_url ? (
                  <div className="w-20 h-20 rounded-lg bg-secondary shrink-0 overflow-hidden">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-secondary/50 shrink-0 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                  {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                  
                  <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                    {item.price && <span className="font-medium text-foreground">${item.price}</span>}
                    {item.catalog_categories?.name && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {item.catalog_categories.name}
                      </span>
                    )}
                    {item.pdf_url && (
                      <span className="flex items-center gap-1 text-accent font-medium">
                        <FileText className="w-3 h-3" /> PDF Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="shrink-0">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
          {items.length === 0 && !isAddingItem && (
            <div className="text-center p-8 border rounded-xl border-dashed">
              <p className="text-muted-foreground text-sm">No items added to catalog yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
