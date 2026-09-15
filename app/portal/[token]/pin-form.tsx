"use client";

import { useFormState, useFormStatus } from "react-dom";
import { portalLoginAction, type PortalLoginState } from "./actions";

const initialState: PortalLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-[#0d6b74] px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "Σύνδεση..." : "Σύνδεση"}
    </button>
  );
}

export function PinForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(
    portalLoginAction.bind(null, token),
    initialState
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Είσοδος στην εκδρομή σας</h1>
      <div>
        <label htmlFor="code" className="mb-1 block text-sm text-slate-600">
          Κωδικός πρόσβασης
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
