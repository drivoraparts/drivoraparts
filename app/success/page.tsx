export default function Success() {
  return (
    <main className="min-h-screen p-10 text-white">
      <h1 className="inline-block text-3xl font-bold text-white border-b-2 border-red-600 pb-2">
        Payment Successful
      </h1>

      <p className="text-gray-400 mt-4">
        Your order is being processed.
      </p>
    </main>
  );
}