export default function TermsOfService() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="text-gray-300">
        By using this website, you agree to follow all applicable laws and terms outlined in this policy.
      </p>
    </main>
  );
}