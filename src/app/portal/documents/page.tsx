import { getDocuments } from "@/lib/portal/documents.service";
export default async function Page() {
  const data = await getDocuments();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-forne-forest capitalize">documents</h1>
      <pre className="mt-6 rounded-2xl border border-forne-stone bg-white p-6 text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
