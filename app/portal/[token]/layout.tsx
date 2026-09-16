import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { logoutAction } from "@/app/actions/logout";
import { PortalTabs, type PortalTab } from "./portal-tabs";

export const dynamic = "force-dynamic";

// Extended with one entry per tab as each is built (Βήμα 3).
const TABS: PortalTab[] = [
  { href: "trip-info", label: "Στοιχεία Εκδρομής" },
  { href: "contract", label: "Συμβόλαιο" },
];

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) {
    // Middleware already gates this route; this is just a safety net.
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold text-[#0d6b74]">GASSI Trip Portal</p>
            <p className="text-xs text-slate-500">
              {ctx.isStaff ? "Προσωπικό GASSI — πλήρη δικαιώματα" : "Σύνδεση σχολείου"}
            </p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-500 underline">
              Αποσύνδεση
            </button>
          </form>
        </div>
        <PortalTabs token={params.token} tabs={TABS} />
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
