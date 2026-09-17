import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ContractForm } from "./contract-form";

export const dynamic = "force-dynamic";

const CONTRACT_BUCKET = "trip-contracts";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("el-GR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ContractPage({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) notFound();

  const supabase = getSupabaseAdmin();
  const { data: contract, error } = await supabase
    .from("trip_contracts")
    .select("contract_pdf_url, signed_date, terms_notes")
    .eq("tender_id", ctx.tenderId)
    .maybeSingle();

  if (error) {
    console.error("ContractPage lookup error", error);
  }

  let signedUrl: string | null = null;
  if (contract?.contract_pdf_url) {
    const { data: signed, error: signError } = await supabase.storage
      .from(CONTRACT_BUCKET)
      .createSignedUrl(contract.contract_pdf_url, 60 * 10);
    if (signError) {
      console.error("ContractPage signed url error", signError);
    }
    signedUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Συμβόλαιο</h2>
        {signedUrl ? (
          <div className="space-y-2">
            <iframe
              src={signedUrl}
              className="h-[600px] w-full rounded border border-slate-200"
            />
            <a
              href={signedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-brand-teal underline"
            >
              Άνοιγμα σε νέα καρτέλα
            </a>
          </div>
        ) : (
          <p className="text-slate-500">Δεν έχει ανέβει συμβόλαιο ακόμα.</p>
        )}
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Ημερομηνία υπογραφής
            </dt>
            <dd className="mt-1 text-slate-900">{formatDate(contract?.signed_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Σημειώσεις όρων
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-slate-900">
              {contract?.terms_notes ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      {ctx.canEditRestrictedTabs ? (
        <ContractForm
          token={params.token}
          initialSignedDate={contract?.signed_date ?? ""}
          initialTermsNotes={contract?.terms_notes ?? ""}
        />
      ) : null}
    </div>
  );
}
