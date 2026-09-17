"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateInstallmentAction,
  deleteInstallmentAction,
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

export function InstallmentRowForm({
  token,
  installment,
  overdue,
}: {
  token: string;
  installment: {
    id: string;
    installment_number: number | null;
    due_date: string | null;
    amount: number | null;
    description: string | null;
  };
  overdue: boolean;
}) {
  const [state, formAction] = useFormState(
    updateInstallmentAction.bind(null, token, installment.id),
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 py-2 text-sm"
    >
      <input
        name="installment_number"
        type="number"
        defaultValue={installment.installment_number ?? ""}
        placeholder="Α/Α"
        className="col-span-1 rounded border border-slate-300 px-2 py-1"
      />
      <span className="col-span-3 flex items-center gap-1">
        <input
          name="due_date"
          type="date"
          defaultValue={installment.due_date ?? ""}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
        {overdue ? <span title="Ληξιπρόθεσμη">🔴</span> : null}
      </span>
      <input
        name="amount"
        type="number"
        step="0.01"
        defaultValue={installment.amount ?? ""}
        placeholder="Ποσό €"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="description"
        defaultValue={installment.description ?? ""}
        placeholder="Περιγραφή"
        className="col-span-4 rounded border border-slate-300 px-2 py-1"
      />
      <div className="col-span-2 flex gap-2">
        <SaveButton />
        <button
          type="submit"
          formAction={deleteInstallmentAction.bind(null, token, installment.id)}
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
