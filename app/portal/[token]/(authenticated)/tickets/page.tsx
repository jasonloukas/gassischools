import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { TicketRowForm } from "./ticket-row-form";
import { TicketAddForm } from "./ticket-add-form";

export const dynamic = "force-dynamic";

const TICKET_BUCKET = "trip-tickets";

type Ticket = {
  id: string;
  ticket_type: string | null;
  carrier: string | null;
  ticket_number: string | null;
  passenger_name: string | null;
  details: string | null;
  file_url: string | null;
};

export default async function TicketsPage({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) notFound();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("trip_tickets")
    .select(
      "id, ticket_type, carrier, ticket_number, passenger_name, details, file_url"
    )
    .eq("tender_id", ctx.tenderId)
    .order("passenger_name", { ascending: true });

  if (error) {
    console.error("TicketsPage lookup error", error);
  }

  const tickets: Ticket[] = data ?? [];

  const signedUrls = new Map<string, string>();
  await Promise.all(
    tickets
      .filter((t) => t.file_url)
      .map(async (t) => {
        const { data: signed, error: signError } = await supabase.storage
          .from(TICKET_BUCKET)
          .createSignedUrl(t.file_url as string, 60 * 10);
        if (signError) {
          console.error("TicketsPage signed url error", signError);
          return;
        }
        if (signed?.signedUrl) signedUrls.set(t.id, signed.signedUrl);
      })
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Εισιτήρια</h2>
      {ctx.canEditRestrictedTabs ? (
        <div>
          {tickets.map((ticket) => (
            <TicketRowForm
              key={ticket.id}
              token={params.token}
              ticket={ticket}
              fileUrl={signedUrls.get(ticket.id) ?? null}
            />
          ))}
          {tickets.length === 0 ? (
            <p className="py-2 text-sm text-slate-500">Δεν υπάρχουν εισιτήρια ακόμα.</p>
          ) : null}
          <TicketAddForm token={params.token} />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Τύπος</th>
              <th>Εταιρεία</th>
              <th>Αριθμός</th>
              <th>Επιβάτης</th>
              <th>Λεπτομέρειες</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="py-2">{t.ticket_type ?? "—"}</td>
                <td>{t.carrier ?? "—"}</td>
                <td>{t.ticket_number ?? "—"}</td>
                <td>{t.passenger_name ?? "—"}</td>
                <td>{t.details ?? "—"}</td>
                <td>
                  {signedUrls.has(t.id) ? (
                    <a
                      href={signedUrls.get(t.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-teal underline"
                    >
                      Άνοιγμα
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-500">
                  Δεν υπάρχουν εισιτήρια.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </section>
  );
}
