"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addStudentPaymentAction, type PaymentsActionState } from "./actions";

const initialState: PaymentsActionState = {};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#0d6b74] px-3 py-1.5 text-sm text-white disabled:opacity-50"
    >
      {pending ? "..." : "Προσθήκη μαθητή"}
    </button>
  );
}

export function StudentPaymentAddForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(
    addStudentPaymentAction.bind(null, token),
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
        name="amount_due"
        type="number"
        step="0.01"
        placeholder="Οφειλή €"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="amount_paid"
        type="number"
        step="0.01"
        placeholder="Πληρώθηκε €"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="last_payment_date"
        type="date"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
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
