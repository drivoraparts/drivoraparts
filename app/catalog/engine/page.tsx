import EngineGroups from "@/components/catalog/EngineGroups";
import PageHeading from "@/components/catalog/PageHeading";

export const dynamic = "force-static";

export default function Page() {
  return (
    <main className="min-h-screen p-6 text-white">
      <PageHeading title="Engine" subtitle="Select an engine platform" />

      <EngineGroups />
    </main>
  );
}
