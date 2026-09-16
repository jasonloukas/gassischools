"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateStudentPaymentAction,
  deleteStudentPaymentAction,
  type PaymentsActionState,
} from "./actions";

const initialState: PaymentsActionState = {};

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

export function StudentPaymentRowForm({
  token,
  payment,
}: {
  token: string;
  payment: {
    id: string;
    student_full_name: string;
    amount_due: number | null;
    amount_paid: number | null;
    last_payment_date: string | null;
  };
}) {
  const [state, formAction] = useFormState(
    updateStudentPaymentAction.bind(null, token, payment.id),
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 py-2 text-sm"
    >
      <input
        name="student_full_name"
        defaultValue={payment.student_full_name}
        required
        placeholder="Ονοματεπώνυμο"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="amount_due"
        type="number"
        step="0.01"
        defaultValue={payment.amount_due ?? ""}
        placeholder="Οφειλή €"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="amount_paid"
        type="number"
        step="0.01"
        defaultValue={payment.amount_paid ?? ""}
        placeholder="Πληρώθηκε €"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="last_payment_date"
        type="date"
        defaultValue={payment.last_payment_date ?? ""}
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <div className="col-span-2 flex gap-2">
        <SaveButton />
        <button
          type="submit"
          formAction={deleteStudentPaymentAction.bind(null, token, payment.id)}
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
