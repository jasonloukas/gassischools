import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { TripRow, type TripPortalRow } from "./trip-row";

export const dynamic = "force-dynamic";

export default async function StaffTripsPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("trip_portals")
    .select(
      "access_token, access_code, tenders(title, destination), schools(name)"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("StaffTripsPage lookup error", error);
  }

  // Without generated DB types, supabase-js types FK embeds as arrays;
  // PostgREST actually returns a single object for this many-to-one embed.
  const portals: TripPortalRow[] = (data ?? []).map((row) => {
    const school = row.schools as unknown as { name: string | null } | null;
    const tender = row.tenders as unknown as
      | { title: string | null; destination: string | null }
      | null;
    return {
      access_token: row.access_token as string,
      access_code: row.access_code as string,
      school_name: school?.name ?? null,
      tender_title: tender?.title ?? null,
      tender_destination: tender?.destination ?? null,
    };
  });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-xl font-semibold">Ενεργές Πύλες Εκδρομών</h1>
      <p className="mt-1 text-sm text-slate-500">
        Αντιγράψτε το link και τον κωδικό για να τα στείλετε στο σχολείο.
      </p>
      <div className="mt-6 space-y-3">
        {portals.map((portal) => (
          <TripRow key={portal.access_token} portal={portal} />
        ))}
        {portals.length === 0 ? (
          <p className="text-slate-500">
            {error ? "Σφάλμα φόρτωσης." : "Δεν υπάρχουν ενεργές εκδρομές."}
          </p>
        ) : null}
      </div>
    </main>
  );
}
