export default function CookiePolicy() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>

      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="mb-4 text-gray-300">
        This Cookie Policy explains how DrivoraParts uses cookies and similar tracking technologies to improve user experience, analyze traffic, and ensure proper website functionality.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">What Are Cookies?</h2>
      <p className="text-gray-300">
        Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve performance.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">How We Use Cookies</h2>
      <ul className="list-disc pl-6 text-gray-300 space-y-2">
        <li>Improve website performance and speed</li>
        <li>Remember user preferences</li>
        <li>Analyze traffic and user behavior</li>
        <li>Enhance shopping and catalog experience</li>
      </ul>

      <h2 className="text-xl text-red-500 mt-6 mb-2">Managing Cookies</h2>
      <p className="text-gray-300">
        You can disable cookies through your browser settings, but some features may not function properly.
      </p>
    </main>
  );
}