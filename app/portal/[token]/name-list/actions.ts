"use server";

import { revalidatePath } from "next/cache";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type NameListActionState = { error?: string };

function toStringOrNull(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : null;
}

// Both roles (school and staff) can edit the name list, so this just
// requires a valid portal context for this token — not
// canEditRestrictedTabs, which is only for the staff-only tabs.

export async function addStudentAction(
  token: string,
  _prevState: NameListActionState,
  formData: FormData
): Promise<NameListActionState> {
  const ctx = await getPortalContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const studentFullName = toStringOrNull(formData.get("student_full_name"));
  if (!studentFullName) {
    return { error: "Το ονοματεπώνυμο μαθητή είναι υποχρεωτικό." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("trip_name_list").insert({
    tender_id: ctx.tenderId,
    student_full_name: studentFullName,
    id_or_passport: toStringOrNull(formData.get("id_or_passport")),
    birth_date: toStringOrNull(formData.get("birth_date")),
    notes: toStringOrNull(formData.get("notes")),
  });

  if (error) {
    console.error("addStudentAction error", error);
    return { error: "Σφάλμα προσθήκης μαθητή." };
  }

  revalidatePath(`/portal/${token}/name-list`);
  return {};
}

export async function updateStudentAction(
  token: string,
  id: string,
  _prevState: NameListActionState,
  formData: FormData
): Promise<NameListActionState> {
  const ctx = await getPortalContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const studentFullName = toStringOrNull(formData.get("student_full_name"));
  if (!studentFullName) {
    return { error: "Το ονοματεπώνυμο μαθητή είναι υποχρεωτικό." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trip_name_list")
    .update({
      student_full_name: studentFullName,
      id_or_passport: toStringOrNull(formData.get("id_or_passport")),
      birth_date: toStringOrNull(formData.get("birth_date")),
      notes: toStringOrNull(formData.get("notes")),
    })
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    console.error("updateStudentAction error", error);
    return { error: "Σφάλμα αποθήκευσης μαθητή." };
  }

  revalidatePath(`/portal/${token}/name-list`);
  return {};
}

export async function deleteStudentAction(token: string, id: string) {
  const ctx = await getPortalContext(token);
  if (!ctx) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trip_name_list")
    .delete()
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    // Most likely a rooming assignment still references this student.
    console.error("deleteStudentAction error", error);
  }

  revalidatePath(`/portal/${token}/name-list`);
}
