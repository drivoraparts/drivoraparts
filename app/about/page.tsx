export const runtime = 'edge';

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 text-white">
      <h1 className="text-4xl font-bold mb-6">
        About DrivoraParts
      </h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>
          DrivoraParts was built for enthusiasts, builders, tuners,
          and performance-focused drivers looking for a modern way
          to discover automotive components.
        </p>

        <p>
          Our vision is to create a marketplace where performance
          parts, engine platforms, drivetrain upgrades, suspension
          systems, braking solutions, and vehicle electronics can be
          explored through a clean, intuitive experience.
        </p>

        <p>
          Whether you're building a street car, a track machine,
          an off-road project, or a complete restoration, our goal
          is to make finding the right parts easier and more
          transparent.
        </p>

        <p>
          DrivoraParts continues to evolve with new categories,
          expanded product coverage, and marketplace features
          designed around the automotive community.
        </p>
      </div>
    </main>
  );
}