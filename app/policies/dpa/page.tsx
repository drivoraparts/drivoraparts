export default function DataProcessingAgreement() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Data Processing Agreement (DPA)
      </h1>

      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="text-gray-300 mb-4">
        This Data Processing Agreement outlines how DrivoraParts handles personal data in compliance with applicable data protection laws.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        Purpose of Data Processing
      </h2>
      <p className="text-gray-300">
        We process user data only to fulfill orders, provide customer support, and improve platform functionality.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        Data Protection Principles
      </h2>
      <ul className="list-disc pl-6 text-gray-300 space-y-2">
        <li>Data is collected fairly and lawfully</li>
        <li>Only necessary data is processed</li>
        <li>Data is stored securely</li>
        <li>No unauthorized sharing or selling of data</li>
      </ul>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        User Rights
      </h2>
      <p className="text-gray-300">
        Users may request access, correction, or deletion of their personal data at any time.
      </p>
    </main>
  );
}