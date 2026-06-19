export default function AccessibilityStatement() {
  const today = new Date().toLocaleDateString();

  return (
    <main className="px-6 py-24 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Accessibility Statement</h1>

      <p className="text-gray-400 mb-4">Last updated: {today}</p>

      <p className="text-gray-300 mb-4">
        DrivoraParts is committed to ensuring digital accessibility for all users, including people with disabilities. We are continuously improving the user experience to meet accessibility standards and best practices.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        Our Commitment
      </h2>
      <p className="text-gray-300">
        We aim to make our website usable by everyone, regardless of ability, device, or assistive technology.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        Accessibility Features
      </h2>
      <ul className="list-disc pl-6 text-gray-300 space-y-2">
        <li>Responsive design for all screen sizes</li>
        <li>Keyboard navigation support</li>
        <li>Readable color contrast</li>
        <li>Semantic HTML structure</li>
      </ul>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        Ongoing Improvements
      </h2>
      <p className="text-gray-300">
        We are continuously working to improve accessibility as new standards evolve.
      </p>

      <h2 className="text-xl text-red-500 mt-6 mb-2">
        Contact
      </h2>
      <p className="text-gray-300">
        If you experience any accessibility issues, please contact us so we can improve your experience.
      </p>
    </main>
  );
}