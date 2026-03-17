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
    <div className="bg-white border border-[#E3E8E5] rounded-xl shadow-[0_8px_24px_rgba(20,30,24,0.06)] p-5">
      <form onSubmit={handleSubmit} className="flex gap-4">
      <input
        type="text"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Enter product ID"
        className="flex-1 h-12 rounded-2xl border border-[#D8E2DC] px-4 text-[16px] text-[#1F2A24] placeholder:text-[#7A857F] outline-none focus:border-[#35BF73] focus:ring-4 focus:ring-[#35BF73]/15"
      />
      <button type="submit" className="h-12 rounded-xl bg-[#35BF73] px-6 font-semibold text-white transition hover:bg-[#2EA664]">
        Search
      </button>
      <Link href="/scanner" className="h-12 rounded-xl border border-[#BEE9CD] bg-[#EAF8F0] px-6 font-semibold text-[#2EA664] flex items-center transition hover:bg-[#DDF6E8]">Scan Code</Link>
    </form>
    </div>
  );
}
