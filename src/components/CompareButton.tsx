"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProducts, type Product } from "@/lib/api";

interface CompareButtonProps {
  productId: string;
}

export function CompareButton({ productId }: CompareButtonProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || products.length > 0) return;
    setLoading(true);
    getProducts()
      .then((all) => setProducts(all.filter((p) => p.product_id !== productId)))
      .finally(() => setLoading(false));
  }, [open, productId, products.length]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
      )
    : products;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm px-3 py-1 border border-black/30 rounded text-black hover:bg-white/10"
      >
        Compare with another product
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-72 border border-gray-600 rounded bg-[#1F1E28] shadow-lg z-10">
          <div className="p-2 border-b border-gray-600">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#2a2936] text-white placeholder-gray-400 text-sm px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-[#767DCC]"
            />
          </div>

          {loading ? (
            <p className="p-3 text-sm text-gray-400">Loading products...</p>
          ) : filtered.length === 0 ? (
            <p className="p-3 text-sm text-gray-400">
              {query ? "No products match your search." : "No other products available."}
            </p>
          ) : (
            <ul className="py-1 max-h-60 overflow-y-auto">
              {filtered.map((p) => (
                <li key={p.product_id}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push(`/compare?a=${productId}&b=${p.product_id}`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.brand && (
                      <span className="text-gray-400 ml-1">— {p.brand}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
