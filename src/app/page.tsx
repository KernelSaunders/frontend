import { getProducts, Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { SearchForm } from "@/components/SearchForm";

export default async function Home() {
  let products: Product[] = [];
  let error = null;

  try {
    products = await getProducts();
  } catch (e) {
    error = "Failed to load products. Make sure the backend is running.";
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Traceability</h1>
      <p className="mb-6">
        Enter a product ID or select a product below to view its traceability story.
      </p>

      <SearchForm />

      <h2 className="text-xl font-semibold mt-8 mb-4">Products</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product: Product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
