import { getDocuments } from "@/lib/portal/documents.service";
export default async function Page() {
  const data = await getDocuments();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-forne-ink capitalize">documents</h1>
      <pre className="mt-6 overflow-auto rounded-2xl border border-forne-line bg-white p-6 text-sm text-forne-muted shadow-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
