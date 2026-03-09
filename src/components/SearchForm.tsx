"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <form onSubmit={handleSubmit} className="flex gap-5">
      <input
        type="text"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Enter product ID"
        className="flex-1 border rounded px-3 py-2"
      />
      <button type="submit" className="rounded px-4 py-2 bg-[#767DCC] hover:bg-[#676EBB]">
        Search
      </button>
      <Link href = "/scanner" className = "rounded px-4 py-2 bg-[#767DCC] hover:bg-[#676EBB]">Scan Code</Link>
    </form>
  );
}

