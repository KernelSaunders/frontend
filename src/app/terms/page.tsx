export const metadata = {
  title: "Terms and Conditions | Product Traceability",
  description: "Terms and Conditions for using the Product Traceability platform",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      
      <p className="text-sm text-gray-500 mb-8">Last updated: 23 March 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            When you use Product Traceability, you agreeing to follow these terms. If you do not want to be bound by them then do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. What We Do</h2>
          <p className="text-gray-700 leading-relaxed">
            Platform is built so that people can track where products come from and verify supply chain details. You can scan products pull up traceability reports, and check sustainability claims.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Your Account</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Private login details</li>
            <li>You are responsible for anything that happens under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Rules</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            Do not do any of the following:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Break the law as that is illegal</li>
            <li>Upload fake or misleading data</li>
            <li>Abuse our systems</li>
            <li>Steal our content..</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Updates to These Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            Terms subject to  change. When we do, the new version goes live immediately. If you keep using the service after that, it means you accept the changes.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          © 2026 Product Traceability. All rights reserved.
        </p>
      </div>
    </main>
  );
}
