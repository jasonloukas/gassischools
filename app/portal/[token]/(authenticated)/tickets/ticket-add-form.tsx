"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addTicketAction, type TicketActionState } from "./actions";

const initialState: TicketActionState = {};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-teal px-3 py-1.5 text-sm text-white disabled:opacity-50"
    >
      {pending ? "..." : "Προσθήκη εισιτηρίου"}
    </button>
  );
}

export function TicketAddForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(
    addTicketAction.bind(null, token),
    initialState
  );

  return (
    <form action={formAction} className="mt-4 grid grid-cols-12 items-center gap-2 text-sm">
      <input
        name="ticket_type"
        placeholder="Τύπος (αεροπορικό κ.λπ.)"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="carrier"
        placeholder="Εταιρεία"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="ticket_number"
        placeholder="Αριθμός"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="passenger_name"
        placeholder="Επιβάτης"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="details"
        placeholder="Λεπτομέρειες"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input name="file" type="file" accept="application/pdf" className="col-span-2 text-xs" />
      <div className="col-span-12 mt-1">
        <AddButton />
      </div>
      {state.error ? (
        <p className="col-span-12 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
