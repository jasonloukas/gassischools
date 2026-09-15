import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import { logoutAction } from "@/app/actions/logout";

export const dynamic = "force-dynamic";

export default async function StaffHomePage() {
  const session = await verifySession(cookies().get(SESSION_COOKIE_NAME)?.value);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Καλώς ήρθατε</h1>
      <p className="mt-2 text-slate-600">
        Συνδεθήκατε ως {session?.role === "staff" ? session.email : ""}.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Εδώ θα μπει η λίστα trips (/staff/trips) στο Βήμα 3.
      </p>
      <form action={logoutAction} className="mt-4">
        <button type="submit" className="text-sm underline">
          Αποσύνδεση
        </button>
      </form>
    </main>
  );
}
