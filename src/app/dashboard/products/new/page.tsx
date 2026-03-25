"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole, createProduct } from "@/lib/api";
import { Button } from "@/components/Button";
import { hasVerifierAccess } from "@/lib/roles";

export default function NewProductPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("food");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    async function checkAccess() {
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token;
      if (!t) { router.replace("/login"); return; }
      try {
        const { role } = await getUserRole(t);
        if (!hasVerifierAccess(role)) { router.replace("/"); return; }
      } catch {
        router.replace("/");
        return;
      }
      setToken(t);
      setLoading(false);
    }
    checkAccess();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const product = await createProduct(token, {
        name: name.trim(),
        category,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
      });
      router.push(`/dashboard/products/${product.product_id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="max-w-2xl mx-auto p-6"><p>Loading...</p></main>;
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">Create New Product</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-600 rounded px-3 py-2 bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-600 rounded px-3 py-2"
          >
            <option value="food">Food</option>
            <option value="luxury">Luxury</option>
            <option value="supplements">Supplements</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full border border-gray-600 rounded px-3 py-2 bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-600 rounded px-3 py-2 bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full border border-gray-600 rounded px-3 py-2 bg-transparent"
          />
        </div>

        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </main>
  );
}
