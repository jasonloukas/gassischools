"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addStudentAction, type NameListActionState } from "./actions";

const initialState: NameListActionState = {};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-teal px-3 py-1.5 text-sm text-white disabled:opacity-50"
    >
      {pending ? "..." : "Προσθήκη μαθητή"}
    </button>
  );
}

export function StudentAddForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(
    addStudentAction.bind(null, token),
    initialState
  );

  return (
    <form action={formAction} className="mt-3 grid grid-cols-12 items-center gap-2 text-sm">
      <input
        name="student_full_name"
        placeholder="Ονοματεπώνυμο"
        required
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="id_or_passport"
        placeholder="ΑΔΤ / Διαβατήριο"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="birth_date"
        type="date"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="notes"
        placeholder="Σημειώσεις"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <div className="col-span-2">
        <AddButton />
      </div>
      {state.error ? (
        <p className="col-span-12 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
