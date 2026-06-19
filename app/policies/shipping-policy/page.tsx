export default function ShippingPolicy() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>

      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="mb-4">
        We process and ship all orders as quickly as possible to ensure fast delivery.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Standard Shipping</h2>
      <p className="text-gray-300">
        Delivery time: <strong>1 to 14 days</strong> depending on location and warehouse availability.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Express Shipping (USA)</h2>
      <p className="text-gray-300">
        Delivery time: <strong>1 to 3 days</strong> within the United States.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Processing Time</h2>
      <p className="text-gray-300">
        Orders are typically processed within 24–72 hours before shipment.
      </p>
    </main>
  );
}