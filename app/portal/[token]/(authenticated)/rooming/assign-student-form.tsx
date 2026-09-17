"use client";

import { useFormState, useFormStatus } from "react-dom";
import { assignStudentAction, type RoomingActionState } from "./actions";

const initialState: RoomingActionState = {};

function AssignButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-teal px-3 py-1.5 text-sm text-white disabled:opacity-50"
    >
      {pending ? "..." : "Ανάθεση"}
    </button>
  );
}

export function AssignStudentForm({
  token,
  student,
  rooms,
}: {
  token: string;
  student: { id: string; student_full_name: string };
  rooms: { id: string; room_number: string | null; room_type: string | null }[];
}) {
  const [state, formAction] = useFormState(
    assignStudentAction.bind(null, token),
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-2 text-sm"
    >
      <input type="hidden" name="student_id" value={student.id} />
      <span className="flex-1">{student.student_full_name}</span>
      <select
        name="rooming_list_id"
        required
        defaultValue=""
        className="rounded border border-slate-300 px-2 py-1"
      >
        <option value="" disabled>
          Επιλέξτε δωμάτιο
        </option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.room_number ?? "Δωμάτιο"}
            {room.room_type ? ` (${room.room_type})` : ""}
          </option>
        ))}
      </select>
      <AssignButton />
      {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </form>
  );
}
