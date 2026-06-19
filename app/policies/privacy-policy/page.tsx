export default function PrivacyPolicy() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="mb-4">
        We respect your privacy and only collect necessary data to process orders and improve user experience.
      </p>

      <p className="text-gray-300">
        We do not sell or share personal data with third parties except for payment processing and shipping.
      </p>
    </main>
  );
}