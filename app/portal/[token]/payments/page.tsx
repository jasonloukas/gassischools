import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { InstallmentRowForm } from "./installment-row-form";
import { InstallmentAddForm } from "./installment-add-form";
import { StudentPaymentRowForm } from "./student-payment-row-form";
import { StudentPaymentAddForm } from "./student-payment-add-form";

export const dynamic = "force-dynamic";

type Installment = {
  id: string;
  installment_number: number | null;
  due_date: string | null;
  amount: number | null;
  description: string | null;
};

type StudentPayment = {
  id: string;
  student_full_name: string;
  amount_due: number | null;
  amount_paid: number | null;
  last_payment_date: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("el-GR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(2)} €`;
}

// Manual for now — Βήμα 4 moves this to a DB trigger so it's always
// authoritative regardless of what writes the row.
function deriveStatus(amountDue: number | null, amountPaid: number | null) {
  const due = amountDue ?? 0;
  const paid = amountPaid ?? 0;
  if (paid <= 0) return "pending" as const;
  if (paid >= due && due > 0) return "paid" as const;
  return "partial" as const;
}

const STATUS_LABELS = {
  pending: "Εκκρεμεί",
  partial: "Μερική",
  paid: "Εξοφλήθηκε",
};

const STATUS_STYLES = {
  pending: "bg-slate-100 text-slate-600",
  partial: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
};

export default async function PaymentsPage({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) notFound();

  const supabase = getSupabaseAdmin();
  const [
    { data: installmentsData, error: installmentsError },
    { data: paymentsData, error: paymentsError },
  ] = await Promise.all([
    supabase
      .from("trip_installments")
      .select("id, installment_number, due_date, amount, description")
      .eq("tender_id", ctx.tenderId)
      .order("installment_number", { ascending: true }),
    supabase
      .from("trip_student_payments")
      .select("id, student_full_name, amount_due, amount_paid, last_payment_date")
      .eq("tender_id", ctx.tenderId)
      .order("student_full_name", { ascending: true }),
  ]);

  if (installmentsError) {
    console.error("PaymentsPage installments error", installmentsError);
  }
  if (paymentsError) {
    console.error("PaymentsPage payments error", paymentsError);
  }

  const installments: Installment[] = installmentsData ?? [];
  const payments: StudentPayment[] = paymentsData ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Δόσεις</h2>
        {ctx.canEditRestrictedTabs ? (
          <div>
            {installments.map((installment) => (
              <InstallmentRowForm
                key={installment.id}
                token={params.token}
                installment={installment}
              />
            ))}
            {installments.length === 0 ? (
              <p className="py-2 text-sm text-slate-500">Δεν υπάρχουν δόσεις ακόμα.</p>
            ) : null}
            <InstallmentAddForm token={params.token} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2">Α/Α</th>
                <th>Ημερομηνία λήξης</th>
                <th>Ποσό</th>
                <th>Περιγραφή</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2">{i.installment_number ?? "—"}</td>
                  <td>{formatDate(i.due_date)}</td>
                  <td>{formatAmount(i.amount)}</td>
                  <td>{i.description ?? "—"}</td>
                </tr>
              ))}
              {installments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    Δεν υπάρχουν δόσεις.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Πληρωμές Μαθητών</h2>
        {ctx.canEditRestrictedTabs ? (
          <div>
            {payments.map((payment) => (
              <StudentPaymentRowForm
                key={payment.id}
                token={params.token}
                payment={payment}
              />
            ))}
            {payments.length === 0 ? (
              <p className="py-2 text-sm text-slate-500">Δεν υπάρχουν πληρωμές ακόμα.</p>
            ) : null}
            <StudentPaymentAddForm token={params.token} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2">Μαθητής</th>
                <th>Οφειλή</th>
                <th>Πληρώθηκε</th>
                <th>Τελ. πληρωμή</th>
                <th>Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const status = deriveStatus(p.amount_due, p.amount_paid);
                return (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2">{p.student_full_name}</td>
                    <td>{formatAmount(p.amount_due)}</td>
                    <td>{formatAmount(p.amount_paid)}</td>
                    <td>{formatDate(p.last_payment_date)}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Δεν υπάρχουν πληρωμές.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
