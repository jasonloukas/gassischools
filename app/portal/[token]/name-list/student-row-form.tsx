"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateStudentAction,
  deleteStudentAction,
  type NameListActionState,
} from "./actions";

const initialState: NameListActionState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "..." : "Αποθήκευση"}
    </button>
  );
}

export function StudentRowForm({
  token,
  student,
}: {
  token: string;
  student: {
    id: string;
    student_full_name: string;
    id_or_passport: string | null;
    birth_date: string | null;
    notes: string | null;
  };
}) {
  const [state, formAction] = useFormState(
    updateStudentAction.bind(null, token, student.id),
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 py-2 text-sm"
    >
      <input
        name="student_full_name"
        defaultValue={student.student_full_name}
        required
        placeholder="Ονοματεπώνυμο"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="id_or_passport"
        defaultValue={student.id_or_passport ?? ""}
        placeholder="ΑΔΤ / Διαβατήριο"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="birth_date"
        type="date"
        defaultValue={student.birth_date ?? ""}
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="notes"
        defaultValue={student.notes ?? ""}
        placeholder="Σημειώσεις"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <div className="col-span-2 flex gap-2">
        <SaveButton />
        <button
          type="submit"
          formAction={deleteStudentAction.bind(null, token, student.id)}
          className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
        >
          Διαγραφή
        </button>
      </div>
      {state.error ? (
        <p className="col-span-12 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
