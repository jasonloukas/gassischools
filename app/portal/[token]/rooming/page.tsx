import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { RoomRowForm } from "./room-row-form";
import { RoomAddForm } from "./room-add-form";
import { AssignStudentForm } from "./assign-student-form";
import { unassignStudentAction } from "./actions";

export const dynamic = "force-dynamic";

type Room = {
  id: string;
  room_number: string | null;
  room_type: string | null;
  capacity: number | null;
};

type Student = { id: string; student_full_name: string };

type Assignment = { id: string; rooming_list_id: string; student_id: string };

export default async function RoomingPage({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) notFound();

  const supabase = getSupabaseAdmin();
  const [
    { data: roomsData, error: roomsError },
    { data: studentsData, error: studentsError },
    { data: assignmentsData, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("trip_rooming_list")
      .select("id, room_number, room_type, capacity")
      .eq("tender_id", ctx.tenderId)
      .order("room_number", { ascending: true }),
    supabase
      .from("trip_name_list")
      .select("id, student_full_name")
      .eq("tender_id", ctx.tenderId)
      .order("student_full_name", { ascending: true }),
    supabase
      .from("trip_rooming_assignments")
      .select("id, rooming_list_id, student_id, trip_rooming_list!inner(tender_id)")
      .eq("trip_rooming_list.tender_id", ctx.tenderId),
  ]);

  if (roomsError) console.error("RoomingPage rooms error", roomsError);
  if (studentsError) console.error("RoomingPage students error", studentsError);
  if (assignmentsError) {
    console.error("RoomingPage assignments error", assignmentsError);
  }

  const rooms: Room[] = roomsData ?? [];
  const students: Student[] = studentsData ?? [];
  const assignments: Assignment[] = (assignmentsData ?? []).map((a) => ({
    id: a.id as string,
    rooming_list_id: a.rooming_list_id as string,
    student_id: a.student_id as string,
  }));

  const studentById = new Map(students.map((s) => [s.id, s]));
  const assignedStudentIds = new Set(assignments.map((a) => a.student_id));
  const unassignedStudents = students.filter((s) => !assignedStudentIds.has(s.id));

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Δωμάτια</h2>
          <p className="text-sm text-slate-500">
            {unassignedStudents.length} μαθητές χωρίς δωμάτιο
          </p>
        </div>
        <div className="space-y-4">
          {rooms.map((room) => {
            const roomAssignments = assignments.filter(
              (a) => a.rooming_list_id === room.id
            );
            return (
              <div key={room.id} className="rounded border border-slate-200 p-3">
                <RoomRowForm token={params.token} room={room} />
                {roomAssignments.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {roomAssignments.map((a) => {
                      const student = studentById.get(a.student_id);
                      return (
                        <li
                          key={a.id}
                          className="flex items-center justify-between text-sm text-slate-600"
                        >
                          <span>{student?.student_full_name ?? "—"}</span>
                          <form
                            action={unassignStudentAction.bind(
                              null,
                              params.token,
                              a.id
                            )}
                          >
                            <button type="submit" className="text-xs text-red-600 underline">
                              Αφαίρεση
                            </button>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Κανένας μαθητής ακόμα.</p>
                )}
              </div>
            );
          })}
          {rooms.length === 0 ? (
            <p className="text-sm text-slate-500">Δεν υπάρχουν δωμάτια ακόμα.</p>
          ) : null}
        </div>
        <RoomAddForm token={params.token} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Μαθητές χωρίς δωμάτιο</h2>
        {unassignedStudents.length === 0 ? (
          <p className="text-sm text-slate-500">Όλοι οι μαθητές έχουν δωμάτιο.</p>
        ) : (
          <div>
            {unassignedStudents.map((student) => (
              <AssignStudentForm
                key={student.id}
                token={params.token}
                student={student}
                rooms={rooms}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
