import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import { PinForm } from "./pin-form";

export const dynamic = "force-dynamic";

export default async function PortalLoginPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const supabase = getSupabaseAdmin();
  const { data: portal, error } = await supabase
    .from("trip_portals")
    .select("is_active")
    .eq("access_token", token)
    .maybeSingle();

  if (error) {
    console.error("PortalLoginPage lookup error", error);
  }

  if (error || !portal || !portal.is_active) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-slate-600">Μη έγκυρος ή ανενεργός σύνδεσμος εκδρομής.</p>
      </main>
    );
  }

  const session = await verifySession(cookies().get(SESSION_COOKIE_NAME)?.value);
  const alreadyAuthorized =
    session?.role === "staff" ||
    (session?.role === "school" && session.token === token);

  if (alreadyAuthorized) {
    redirect(`/portal/${token}/trip-info`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <PinForm token={token} />
    </main>
  );
}
