"use server";

import { revalidatePath } from "next/cache";
import { getPortalContext, type PortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type TicketActionState = { error?: string };

const TICKET_BUCKET = "trip-tickets";

async function requireStaffContext(token: string): Promise<PortalContext | null> {
  const ctx = await getPortalContext(token);
  if (!ctx || !ctx.canEditRestrictedTabs) return null;
  return ctx;
}

function toStringOrNull(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : null;
}

function ticketFields(formData: FormData) {
  return {
    ticket_type: toStringOrNull(formData.get("ticket_type")),
    carrier: toStringOrNull(formData.get("carrier")),
    ticket_number: toStringOrNull(formData.get("ticket_number")),
    passenger_name: toStringOrNull(formData.get("passenger_name")),
    details: toStringOrNull(formData.get("details")),
  };
}

export async function addTicketAction(
  token: string,
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const ctx = await requireStaffContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const supabase = getSupabaseAdmin();
  const { data: ticket, error: insertError } = await supabase
    .from("trip_tickets")
    .insert({ tender_id: ctx.tenderId, ...ticketFields(formData) })
    .select("id")
    .single();

  if (insertError || !ticket) {
    console.error("addTicketAction insert error", insertError);
    return { error: "Σφάλμα προσθήκης εισιτηρίου." };
  }

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { error: "Το αρχείο πρέπει να είναι PDF." };
    }
    const path = `${ctx.tenderId}/${ticket.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(TICKET_BUCKET)
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (uploadError) {
      console.error("addTicketAction upload error", uploadError);
      return { error: "Το εισιτήριο προστέθηκε, αλλά το PDF απέτυχε." };
    }
    await supabase.from("trip_tickets").update({ file_url: path }).eq("id", ticket.id);
  }

  revalidatePath(`/portal/${token}/tickets`);
  return {};
}

export async function updateTicketAction(
  token: string,
  id: string,
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const ctx = await requireStaffContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { ...ticketFields(formData) };

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { error: "Το αρχείο πρέπει να είναι PDF." };
    }
    const path = `${ctx.tenderId}/${id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(TICKET_BUCKET)
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (uploadError) {
      console.error("updateTicketAction upload error", uploadError);
      return { error: "Σφάλμα κατά το ανέβασμα του αρχείου." };
    }
    update.file_url = path;
  }

  const { error } = await supabase
    .from("trip_tickets")
    .update(update)
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    console.error("updateTicketAction error", error);
    return { error: "Σφάλμα αποθήκευσης εισιτηρίου." };
  }

  revalidatePath(`/portal/${token}/tickets`);
  return {};
}

export async function deleteTicketAction(token: string, id: string) {
  const ctx = await requireStaffContext(token);
  if (!ctx) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trip_tickets")
    .delete()
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    console.error("deleteTicketAction error", error);
  } else {
    // Best-effort cleanup; a missing object is not an error worth surfacing.
    await supabase.storage.from(TICKET_BUCKET).remove([`${ctx.tenderId}/${id}.pdf`]);
  }

  revalidatePath(`/portal/${token}/tickets`);
}
