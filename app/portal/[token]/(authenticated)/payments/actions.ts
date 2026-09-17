"use server";

import { revalidatePath } from "next/cache";
import { getPortalContext, type PortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PaymentsActionState = { error?: string };

async function requireStaffContext(token: string): Promise<PortalContext | null> {
  const ctx = await getPortalContext(token);
  if (!ctx || !ctx.canEditRestrictedTabs) return null;
  return ctx;
}

function toNumberOrNull(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function toStringOrNull(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : null;
}

// ---- Installments ----

export async function addInstallmentAction(
  token: string,
  _prevState: PaymentsActionState,
  formData: FormData
): Promise<PaymentsActionState> {
  const ctx = await requireStaffContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("trip_installments").insert({
    tender_id: ctx.tenderId,
    installment_number: toNumberOrNull(formData.get("installment_number")),
    due_date: toStringOrNull(formData.get("due_date")),
    amount: toNumberOrNull(formData.get("amount")),
    description: toStringOrNull(formData.get("description")),
  });

  if (error) {
    console.error("addInstallmentAction error", error);
    return { error: "Σφάλμα προσθήκης δόσης." };
  }

  revalidatePath(`/portal/${token}/payments`);
  return {};
}

export async function updateInstallmentAction(
  token: string,
  id: string,
  _prevState: PaymentsActionState,
  formData: FormData
): Promise<PaymentsActionState> {
  const ctx = await requireStaffContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trip_installments")
    .update({
      installment_number: toNumberOrNull(formData.get("installment_number")),
      due_date: toStringOrNull(formData.get("due_date")),
      amount: toNumberOrNull(formData.get("amount")),
      description: toStringOrNull(formData.get("description")),
    })
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    console.error("updateInstallmentAction error", error);
    return { error: "Σφάλμα αποθήκευσης δόσης." };
  }

  revalidatePath(`/portal/${token}/payments`);
  return {};
}

export async function deleteInstallmentAction(token: string, id: string) {
  const ctx = await requireStaffContext(token);
  if (!ctx) return;

  const supabase = getSupabaseAdmin();
  await supabase
    .from("trip_installments")
    .delete()
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  revalidatePath(`/portal/${token}/payments`);
}

// ---- Student payments ----

export async function addStudentPaymentAction(
  token: string,
  _prevState: PaymentsActionState,
  formData: FormData
): Promise<PaymentsActionState> {
  const ctx = await requireStaffContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const studentFullName = toStringOrNull(formData.get("student_full_name"));
  if (!studentFullName) {
    return { error: "Το ονοματεπώνυμο μαθητή είναι υποχρεωτικό." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("trip_student_payments").insert({
    tender_id: ctx.tenderId,
    student_full_name: studentFullName,
    amount_due: toNumberOrNull(formData.get("amount_due")),
    amount_paid: toNumberOrNull(formData.get("amount_paid")) ?? 0,
    last_payment_date: toStringOrNull(formData.get("last_payment_date")),
  });

  if (error) {
    console.error("addStudentPaymentAction error", error);
    return { error: "Σφάλμα προσθήκης πληρωμής." };
  }

  revalidatePath(`/portal/${token}/payments`);
  return {};
}

export async function updateStudentPaymentAction(
  token: string,
  id: string,
  _prevState: PaymentsActionState,
  formData: FormData
): Promise<PaymentsActionState> {
  const ctx = await requireStaffContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const studentFullName = toStringOrNull(formData.get("student_full_name"));
  if (!studentFullName) {
    return { error: "Το ονοματεπώνυμο μαθητή είναι υποχρεωτικό." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trip_student_payments")
    .update({
      student_full_name: studentFullName,
      amount_due: toNumberOrNull(formData.get("amount_due")),
      amount_paid: toNumberOrNull(formData.get("amount_paid")) ?? 0,
      last_payment_date: toStringOrNull(formData.get("last_payment_date")),
    })
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    console.error("updateStudentPaymentAction error", error);
    return { error: "Σφάλμα αποθήκευσης πληρωμής." };
  }

  revalidatePath(`/portal/${token}/payments`);
  return {};
}

export async function deleteStudentPaymentAction(token: string, id: string) {
  const ctx = await requireStaffContext(token);
  if (!ctx) return;

  const supabase = getSupabaseAdmin();
  await supabase
    .from("trip_student_payments")
    .delete()
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  revalidatePath(`/portal/${token}/payments`);
}
