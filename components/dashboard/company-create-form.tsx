"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type ServiceCategory = {
  id: number;
  name: string;
};

export function CompanyCreateForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  /* ✅ Load categories ONCE */
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name")
        .order("name");

      if (!error) {
        setCategories(data || []);
      } else {
        console.error("Failed to load categories:", error.message);
      }
    };

    loadCategories();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (loading) return; // ✅ STEP 4 HERE
  setLoading(true);

const formData = new FormData(e.currentTarget);

const name = String(formData.get("name")).trim();

const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)+/g, "");

const { error } = await supabase.from("companies").insert({
  user_id: userId,
  name,
  slug,
  contact_person_name: formData.get("contact_person"),
  contact_email: formData.get("email"),
  contact_number: formData.get("phone"),
  address: formData.get("address"),
  gst_number: formData.get("gst"),
  service_category_id: Number(formData.get("service_category_id")),
  plan: "free",
  chat_limit: 100,
});

setLoading(false); // ✅ ALWAYS reset loading

if (error) {
  if (error.code === "23505") {
    alert("Company already exists for this user.");
  } else {
    alert(error.message);
  }
  return;
}

  // ✅ success flow
router.push("/dashboard");
router.refresh();
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <Label>Company / Organisation Name</Label>
        <Input name="name" required />
      </div>

      <div>
        <Label>Contact Person Name</Label>
        <Input name="contact_person" required />
      </div>

      <div>
        <Label>Contact Email</Label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <Label>Contact Number</Label>
        <Input name="phone" required />
      </div>

      <div>
        <Label>Full Address</Label>
        <Textarea name="address" />
      </div>

      <div>
        <Label>GST Number (optional)</Label>
        <Input name="gst" />
      </div>

      <div>
        <Label>Select Service Category</Label>
        <select
          name="service_category_id"
          required
          className="w-full border rounded-md p-2 bg-background"
        >
          <option value="">Select service</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Button disabled={loading}>
        {loading ? "Creating..." : "Create Company"}
      </Button>
    </form>
  );
}
