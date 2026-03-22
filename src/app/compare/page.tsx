import Link from "next/link";
import { getProductTraceability, type Claim } from "@/lib/api";
import { OriginBreakdown } from "@/components/OriginBreakdown";

const confidenceStyles: Record<string, string> = {
  verified: "bg-green-100 text-green-800 border-green-300",
  partially_verified: "bg-yellow-100 text-yellow-800 border-yellow-300",
  unverified: "bg-red-100 text-red-800 border-red-300",
};

function ClaimList({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) {
    return <p className="text-sm text-gray-500">No claims available.</p>;
  }
  return (
    <div className="space-y-3">
      {claims.map((claim, index) => {
        const label = claim.confidence_label ?? "unknown";
        const style =
          confidenceStyles[label] ??
          "bg-gray-100 text-gray-700 border-gray-300";
        return (
          <div key={claim.claim_id ?? index} className="border rounded p-3">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {claim.claim_type}
                </p>
                <p className="text-sm font-medium mt-0.5">{claim.claim_text}</p>
                {claim.rationale && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {claim.rationale}
                  </p>
                )}
              </div>
              <span
                className={`text-xs font-semibold border px-2 py-1 rounded whitespace-nowrap shrink-0 ${style}`}
              >
                {label.replace("_", " ")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { a, b } = await searchParams;

  if (!a || !b) {
    return (
      <main className="max-w-5xl mx-auto p-4">
        <Link href="/" className="underline">
          Back to home
        </Link>
        <p className="mt-4 text-gray-600">
          Select two products to compare using the &ldquo;Compare&rdquo; button
          on a product page.
        </p>
      </main>
    );
  }

  const [resultA, resultB] = await Promise.allSettled([
    getProductTraceability(a),
    getProductTraceability(b),
  ]);

  if (resultA.status === "rejected" || resultB.status === "rejected") {
    return (
      <main className="max-w-5xl mx-auto p-4">
        <Link href="/" className="underline">
          Back to home
        </Link>
        <p className="mt-4 text-red-600">
          Failed to load one or both products.
        </p>
      </main>
    );
  }

  const { product: productA, input_shares: sharesA, claims: claimsA } =
    resultA.value;
  const { product: productB, input_shares: sharesB, claims: claimsB } =
    resultB.value;

  return (
    <main className="max-w-6xl mx-auto p-4">
      <Link href="/" className="underline">
        Back to home
      </Link>

      <h1 className="text-2xl font-bold mt-6 mb-8">Product Comparison</h1>

      {/* Product headers */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="border rounded p-4">
          <Link
            href={`/products/${a}`}
            className="underline text-lg font-semibold"
          >
            {productA.name}
          </Link>
          {productA.brand && (
            <p className="text-gray-600 text-sm mt-1">{productA.brand}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Category: {productA.category}
          </p>
        </div>
        <div className="border rounded p-4">
          <Link
            href={`/products/${b}`}
            className="underline text-lg font-semibold"
          >
            {productB.name}
          </Link>
          {productB.brand && (
            <p className="text-gray-600 text-sm mt-1">{productB.brand}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Category: {productB.category}
          </p>
        </div>
      </div>

      {/* Origin Breakdown */}
      <h2 className="text-xl font-semibold mb-4">Origin Breakdown</h2>
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {productA.name}
          </h3>
          <OriginBreakdown inputs={sharesA} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {productB.name}
          </h3>
          <OriginBreakdown inputs={sharesB} />
        </div>
      </div>

      {/* Claim Confidence */}
      <h2 className="text-xl font-semibold mb-4">Claim Confidence</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {productA.name}
          </h3>
          <ClaimList claims={claimsA} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {productB.name}
          </h3>
          <ClaimList claims={claimsB} />
        </div>
      </div>
    </main>
  );
}
