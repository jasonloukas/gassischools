"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveContractAction, type ContractFormState } from "./actions";

const initialState: ContractFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#0d6b74] px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "Αποθήκευση..." : "Αποθήκευση"}
    </button>
  );
}

export function ContractForm({
  token,
  initialSignedDate,
  initialTermsNotes,
}: {
  token: string;
  initialSignedDate: string;
  initialTermsNotes: string;
}) {
  const [state, formAction] = useFormState(
    saveContractAction.bind(null, token),
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-slate-700">
        Επεξεργασία (μόνο προσωπικό)
      </h3>
      <div>
        <label htmlFor="contract_pdf" className="mb-1 block text-sm text-slate-600">
          Ανέβασμα / αντικατάσταση PDF
        </label>
        <input
          id="contract_pdf"
          name="contract_pdf"
          type="file"
          accept="application/pdf"
          className="block w-full text-sm"
        />
      </div>
      <div>
        <label htmlFor="signed_date" className="mb-1 block text-sm text-slate-600">
          Ημερομηνία υπογραφής
        </label>
        <input
          id="signed_date"
          name="signed_date"
          type="date"
          defaultValue={initialSignedDate}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="terms_notes" className="mb-1 block text-sm text-slate-600">
          Σημειώσεις όρων
        </label>
        <textarea
          id="terms_notes"
          name="terms_notes"
          defaultValue={initialTermsNotes}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-600">Αποθηκεύτηκε.</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
