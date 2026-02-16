import Link from "next/link";
import { getMissionsForProduct, getProductTraceability, type QuestMission } from "@/lib/api";
import { Timeline } from "@/components/Timeline";
import { OriginBreakdown } from "@/components/OriginBreakdown";
import { ClaimCard } from "@/components/ClaimCard";
import { MissionCard } from "@/components/MissionCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  
  let productData = null;
  let error = null;
  let missions: QuestMission[] = [];
  let missionsError: string | null = null;

  try {
    productData = await getProductTraceability(id);
  } catch (e) {
    error = "Product not found or failed to load.";
  }

  if (error || !productData) {
    return (
      <main className="max-w-4xl mx-auto p-4">
        <Link href="/" className="underline">Back to home</Link>
        <p className="mt-4">{error}</p>
      </main>
    );
  }

  const { product, stages, input_shares, claims } = productData;

  try {
    missions = await getMissionsForProduct(id);
  } catch (e) {
    missionsError = "Failed to load missions.";
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <Link href="/" className="underline">Back to home</Link>

      <section className="mt-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        {product.brand && <p className="text-gray-400">{product.brand}</p>}
        <p className="text-sm text-gray-500">Category: {product.category}</p>
        {product.description && <p className="mt-2">{product.description}</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Traceability Timeline</h2>
        <Timeline stages={stages} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Origin Breakdown</h2>
        <OriginBreakdown inputs={input_shares} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Claims</h2>
        {claims.length === 0 ? (
          <p>No claims available.</p>
        ) : (
          <div className="space-y-4">
            {claims.map((claimData) => (
              <ClaimCard key={claimData.claim.claim_id} claimData={claimData} productId={id} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Missions</h2>
        {missionsError ? (
          <p className="text-sm text-red-800">{missionsError}</p>
        ) : missions.length === 0 ? (
          <p className="text-sm text-gray-400">No missions available.</p>
        ) : (
          <div className="space-y-4">
            {missions.map((m) => (
              <MissionCard key={m.mission_id} mission={m} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
