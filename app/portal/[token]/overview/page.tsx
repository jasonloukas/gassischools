import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import { logoutAction } from "@/app/actions/logout";

export const dynamic = "force-dynamic";

export default async function PortalOverviewPage({
  params,
}: {
  params: { token: string };
}) {
  const session = await verifySession(cookies().get(SESSION_COOKIE_NAME)?.value);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Επιτυχής σύνδεση</h1>
      <p className="mt-2 text-slate-600">
        {session?.role === "staff"
          ? `Συνδεθήκατε ως προσωπικό GASSI (${session.email}) — πλήρη δικαιώματα.`
          : session?.role === "school"
            ? `Συνδεθήκατε ως σχολείο (tender: ${session.tenderId}).`
            : ""}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Token: {params.token} — εδώ θα μπουν τα tabs στο Βήμα 3.
      </p>
      <form action={logoutAction} className="mt-4">
        <button type="submit" className="text-sm underline">
          Αποσύνδεση
        </button>
      </form>
    </main>
  );
}
