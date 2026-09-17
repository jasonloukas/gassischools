import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("el-GR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function TripInfoPage({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) notFound();

  const supabase = getSupabaseAdmin();
  const { data: tender, error } = await supabase
    .from("tenders")
    .select("title, destination, start_date, end_date, hotel_name, transport_type")
    .eq("id", ctx.tenderId)
    .maybeSingle();

  if (error) {
    console.error("TripInfoPage lookup error", error);
  }

  const fields = [
    { label: "Τίτλος", value: tender?.title ?? "—" },
    { label: "Προορισμός", value: tender?.destination ?? "—" },
    { label: "Ημερομηνία αναχώρησης", value: formatDate(tender?.start_date) },
    { label: "Ημερομηνία επιστροφής", value: formatDate(tender?.end_date) },
    { label: "Ξενοδοχείο", value: tender?.hotel_name ?? "—" },
    { label: "Μεταφορικό μέσο", value: tender?.transport_type ?? "—" },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Στοιχεία Εκδρομής</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {field.label}
            </dt>
            <dd className="mt-1 text-slate-900">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
