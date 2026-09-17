"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addRoomAction, type RoomingActionState } from "./actions";

const initialState: RoomingActionState = {};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-teal px-3 py-1.5 text-sm text-white disabled:opacity-50"
    >
      {pending ? "..." : "Προσθήκη δωματίου"}
    </button>
  );
}

export function RoomAddForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(
    addRoomAction.bind(null, token),
    initialState
  );

  return (
    <form action={formAction} className="mt-4 grid grid-cols-12 items-center gap-2 text-sm">
      <input
        name="room_number"
        placeholder="Αριθμός δωματίου"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="room_type"
        placeholder="Τύπος (π.χ. διπλό)"
        className="col-span-4 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="capacity"
        type="number"
        placeholder="Χωρητικότητα"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <div className="col-span-3">
        <AddButton />
      </div>
      {state.error ? (
        <p className="col-span-12 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
