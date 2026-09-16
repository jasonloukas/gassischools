"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateTicketAction,
  deleteTicketAction,
  type TicketActionState,
} from "./actions";

const initialState: TicketActionState = {};

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

export function TicketRowForm({
  token,
  ticket,
  fileUrl,
}: {
  token: string;
  ticket: {
    id: string;
    ticket_type: string | null;
    carrier: string | null;
    ticket_number: string | null;
    passenger_name: string | null;
    details: string | null;
  };
  fileUrl: string | null;
}) {
  const [state, formAction] = useFormState(
    updateTicketAction.bind(null, token, ticket.id),
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 py-2 text-sm"
    >
      <input
        name="ticket_type"
        defaultValue={ticket.ticket_type ?? ""}
        placeholder="Τύπος"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="carrier"
        defaultValue={ticket.carrier ?? ""}
        placeholder="Εταιρεία"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="ticket_number"
        defaultValue={ticket.ticket_number ?? ""}
        placeholder="Αριθμός"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="passenger_name"
        defaultValue={ticket.passenger_name ?? ""}
        placeholder="Επιβάτης"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="details"
        defaultValue={ticket.details ?? ""}
        placeholder="Λεπτομέρειες"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <input name="file" type="file" accept="application/pdf" className="col-span-2 text-xs" />

      <div className="col-span-11 mt-1">
        {fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[#0d6b74] underline">
            Τρέχον PDF
          </a>
        ) : (
          <span className="text-xs text-slate-400">Χωρίς PDF</span>
        )}
      </div>
      <div className="col-span-1 mt-1 flex justify-end gap-2">
        <SaveButton />
        <button
          type="submit"
          formAction={deleteTicketAction.bind(null, token, ticket.id)}
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
