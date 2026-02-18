import { Suspense } from "react";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { SearchForm } from "@/components/SearchForm";
import { AuthStatus } from "@/components/AuthStatus";

async function ProductList() {
  const products = await getProducts();

  if (products.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Product Traceability</h1>
        <AuthStatus />
      </div>

      <p className="mb-6">
        Enter a product ID or select a product below to view its traceability story.
      </p>

      <SearchForm />

      <h2 className="text-xl font-semibold mt-8 mb-4">Products</h2>
      <Suspense fallback={<p>Loading products...</p>}>
        <ProductList />
      </Suspense>
    </main>
  );
}
