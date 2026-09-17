"use server";

import { revalidatePath } from "next/cache";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type RoomingActionState = { error?: string };

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

// Editable by both roles (school and staff), like the Name List tab —
// the DB writes below only require a valid portal context.

export async function addRoomAction(
  token: string,
  _prevState: RoomingActionState,
  formData: FormData
): Promise<RoomingActionState> {
  const ctx = await getPortalContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("trip_rooming_list").insert({
    tender_id: ctx.tenderId,
    room_number: toStringOrNull(formData.get("room_number")),
    room_type: toStringOrNull(formData.get("room_type")),
    capacity: toNumberOrNull(formData.get("capacity")),
  });

  if (error) {
    console.error("addRoomAction error", error);
    return { error: "Σφάλμα προσθήκης δωματίου." };
  }

  revalidatePath(`/portal/${token}/rooming`);
  return {};
}

export async function updateRoomAction(
  token: string,
  id: string,
  _prevState: RoomingActionState,
  formData: FormData
): Promise<RoomingActionState> {
  const ctx = await getPortalContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trip_rooming_list")
    .update({
      room_number: toStringOrNull(formData.get("room_number")),
      room_type: toStringOrNull(formData.get("room_type")),
      capacity: toNumberOrNull(formData.get("capacity")),
    })
    .eq("id", id)
    .eq("tender_id", ctx.tenderId);

  if (error) {
    console.error("updateRoomAction error", error);
    return { error: "Σφάλμα αποθήκευσης δωματίου." };
  }

  revalidatePath(`/portal/${token}/rooming`);
  return {};
}

export async function deleteRoomAction(token: string, id: string) {
  const ctx = await getPortalContext(token);
  if (!ctx) return;

  const supabase = getSupabaseAdmin();

  // Confirm the room actually belongs to this tenant BEFORE touching
  // anything — otherwise a caller could pass another tenant's room id
  // and wipe its assignments even though the final delete below would
  // itself correctly no-op.
  const { data: room } = await supabase
    .from("trip_rooming_list")
    .select("id")
    .eq("id", id)
    .eq("tender_id", ctx.tenderId)
    .maybeSingle();

  if (!room) return;

  await supabase.from("trip_rooming_assignments").delete().eq("rooming_list_id", id);

  const { error } = await supabase.from("trip_rooming_list").delete().eq("id", id);

  if (error) {
    console.error("deleteRoomAction error", error);
  }

  revalidatePath(`/portal/${token}/rooming`);
}

export async function assignStudentAction(
  token: string,
  _prevState: RoomingActionState,
  formData: FormData
): Promise<RoomingActionState> {
  const ctx = await getPortalContext(token);
  if (!ctx) return { error: "Δεν έχετε δικαίωμα." };

  const studentId = toStringOrNull(formData.get("student_id"));
  const roomingListId = toStringOrNull(formData.get("rooming_list_id"));
  if (!studentId || !roomingListId) {
    return { error: "Επιλέξτε δωμάτιο." };
  }

  const supabase = getSupabaseAdmin();

  // Both ids arrive from client input — confirm they actually belong
  // to this tenant before creating the cross-reference.
  const [{ data: student }, { data: room }] = await Promise.all([
    supabase
      .from("trip_name_list")
      .select("id")
      .eq("id", studentId)
      .eq("tender_id", ctx.tenderId)
      .maybeSingle(),
    supabase
      .from("trip_rooming_list")
      .select("id, capacity")
      .eq("id", roomingListId)
      .eq("tender_id", ctx.tenderId)
      .maybeSingle(),
  ]);

  if (!student || !room) {
    return { error: "Μη έγκυρος μαθητής ή δωμάτιο." };
  }

  if (room.capacity !== null) {
    // Exclude the student's own existing assignment, in case they're
    // being re-assigned to the same room they're already in.
    const { count, error: countError } = await supabase
      .from("trip_rooming_assignments")
      .select("id", { count: "exact", head: true })
      .eq("rooming_list_id", roomingListId)
      .neq("student_id", studentId);

    if (countError) {
      console.error("assignStudentAction count error", countError);
      return { error: "Σφάλμα ελέγχου χωρητικότητας." };
    }

    if ((count ?? 0) >= room.capacity) {
      return { error: "Το δωμάτιο έχει φτάσει τη μέγιστη χωρητικότητά του." };
    }
  }

  const { error } = await supabase
    .from("trip_rooming_assignments")
    .upsert(
      { student_id: studentId, rooming_list_id: roomingListId },
      { onConflict: "student_id" }
    );

  if (error) {
    console.error("assignStudentAction error", error);
    return { error: "Σφάλμα ανάθεσης." };
  }

  revalidatePath(`/portal/${token}/rooming`);
  return {};
}

export async function unassignStudentAction(token: string, assignmentId: string) {
  const ctx = await getPortalContext(token);
  if (!ctx) return;

  const supabase = getSupabaseAdmin();

  // trip_rooming_assignments has no tender_id of its own — confirm
  // ownership through its room before deleting.
  const { data: assignment } = await supabase
    .from("trip_rooming_assignments")
    .select("id, trip_rooming_list!inner(tender_id)")
    .eq("id", assignmentId)
    .eq("trip_rooming_list.tender_id", ctx.tenderId)
    .maybeSingle();

  if (!assignment) return;

  await supabase.from("trip_rooming_assignments").delete().eq("id", assignmentId);

  revalidatePath(`/portal/${token}/rooming`);
}
