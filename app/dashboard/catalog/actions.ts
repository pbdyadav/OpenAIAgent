"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCatalogCategory(companyId: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalog_categories")
    .insert({ company_id: companyId, name })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/catalog");
  return data;
}

export async function deleteCatalogCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/catalog");
}

export async function createCatalogItem(data: any) {
  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("catalog_items")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/catalog");
  return item;
}

export async function deleteCatalogItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/catalog");
}
