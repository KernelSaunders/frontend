import Link from "next/link";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block p-4 border rounded hover:bg-gray-50"
    >
      <h3 className="font-semibold">{product.name}</h3>
      {product.brand && <p className="text-sm text-gray-600">{product.brand}</p>}
      <p className="text-sm text-gray-500">{product.category}</p>
      {product.description && (
        <p className="text-sm mt-1">{product.description}</p>
      )}
    </Link>
  );
}
