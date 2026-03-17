import Link from "next/link";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block p-4 rounded-lg bg-white border border-[#F3F5F4] shadow-[0_8px_24px_rgba(20,30,24,0.08)] transition hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(20,30,24,0.12)]"
    >
      <h3 className="font-semibold">{product.name}</h3>
      {product.brand && <p className="text-sm text-gray-400">{product.brand}</p>}
      <p className="text-sm text-gray-500">{product.category}</p>
      {product.description && (
        <p className="text-sm mt-1 text-center">{product.description}</p>
      )}
    </Link>
  );
}
