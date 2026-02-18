import Link from "next/link";

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <Link href="/" className="underline">Back to home</Link>
      <p className="mt-4">Loading product...</p>
    </main>
  );
}
