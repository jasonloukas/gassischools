"use server";

import { revalidatePath } from "next/cache";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ContractFormState = { error?: string; success?: boolean };

const CONTRACT_BUCKET = "trip-contracts";

export async function saveContractAction(
  token: string,
  _prevState: ContractFormState,
  formData: FormData
): Promise<ContractFormState> {
  // Re-check authorization here, server-side — the UI hides this form
  // from school sessions, but that alone must never be the only gate.
  const ctx = await getPortalContext(token);
  if (!ctx || !ctx.canEditRestrictedTabs) {
    return { error: "Δεν έχετε δικαίωμα επεξεργασίας." };
  }

  const supabase = getSupabaseAdmin();
  const file = formData.get("contract_pdf");
  const signedDate = formData.get("signed_date")?.toString() || null;
  const termsNotes = formData.get("terms_notes")?.toString() || null;

  let contractPdfPath: string | undefined;

  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { error: "Το αρχείο πρέπει να είναι PDF." };
    }
    const path = `${ctx.tenderId}/contract.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(CONTRACT_BUCKET)
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (uploadError) {
      console.error("saveContractAction upload error", uploadError);
      return { error: "Σφάλμα κατά το ανέβασμα του αρχείου." };
    }
    contractPdfPath = path;
  }

  const { error: upsertError } = await supabase.from("trip_contracts").upsert(
    {
      tender_id: ctx.tenderId,
      ...(contractPdfPath ? { contract_pdf_url: contractPdfPath } : {}),
      signed_date: signedDate,
      terms_notes: termsNotes,
    },
    { onConflict: "tender_id" }
  );

  if (upsertError) {
    console.error("saveContractAction upsert error", upsertError);
    return { error: "Σφάλμα αποθήκευσης." };
  }

  revalidatePath(`/portal/${token}/contract`);
  return { success: true };
}
