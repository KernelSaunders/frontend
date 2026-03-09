import Link from "next/link";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block p-4 rounded bg-[#767DCC] hover:bg-[#676EBB]"
    >
      <h3 className="font-semibold text-center">{product.name}</h3>
      {product.brand && <p className="text-sm text-center">{product.brand}</p>}
      <p className="text-sm text-center">{product.category}</p>
      {product.description && (
        <p className="text-sm mt-1 text-center">{product.description}</p>
      )}
    </Link>
  );
}
