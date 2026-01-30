"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchForm() {
  const [productId, setProductId] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (productId.trim()) {
      router.push(`/products/${productId.trim()}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Enter product ID"
        className="flex-1 border rounded px-3 py-2"
      />
      <button type="submit" className="border rounded px-4 py-2 hover:bg-gray-100">
        Search
      </button>
    </form>
  );
}

