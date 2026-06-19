export default function ReturnRefundPolicy() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Return & Refund Policy</h1>

      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="mb-4">
        We aim to ensure customer satisfaction with every order.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Refund Processing Time</h2>
      <p className="text-gray-300">
        Refunds are processed within <strong>1 to 16 days</strong> after approval.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Eligibility</h2>
      <p className="text-gray-300">
        Items must be unused and in original condition to qualify for return.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Processing</h2>
      <p className="text-gray-300">
        Once approved, refunds are returned to the original payment method.
      </p>
    </main>
  );
}