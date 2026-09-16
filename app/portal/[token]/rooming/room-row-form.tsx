"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateRoomAction,
  deleteRoomAction,
  type RoomingActionState,
} from "./actions";

const initialState: RoomingActionState = {};

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

export function RoomRowForm({
  token,
  room,
}: {
  token: string;
  room: {
    id: string;
    room_number: string | null;
    room_type: string | null;
    capacity: number | null;
  };
}) {
  const [state, formAction] = useFormState(
    updateRoomAction.bind(null, token, room.id),
    initialState
  );

  return (
    <form action={formAction} className="grid grid-cols-12 items-center gap-2 text-sm">
      <input
        name="room_number"
        defaultValue={room.room_number ?? ""}
        placeholder="Αριθμός δωματίου"
        className="col-span-3 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="room_type"
        defaultValue={room.room_type ?? ""}
        placeholder="Τύπος (π.χ. διπλό)"
        className="col-span-4 rounded border border-slate-300 px-2 py-1"
      />
      <input
        name="capacity"
        type="number"
        defaultValue={room.capacity ?? ""}
        placeholder="Χωρητικότητα"
        className="col-span-2 rounded border border-slate-300 px-2 py-1"
      />
      <div className="col-span-3 flex gap-2">
        <SaveButton />
        <button
          type="submit"
          formAction={deleteRoomAction.bind(null, token, room.id)}
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
