import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { logoutAction } from "@/app/actions/logout";
import { BrandTopBar } from "@/components/brand-topbar";
import { PortalTabs, type PortalTab } from "./portal-tabs";

export const dynamic = "force-dynamic";

const TABS: PortalTab[] = [
  { href: "trip-info", label: "Στοιχεία Εκδρομής" },
  { href: "contract", label: "Συμβόλαιο" },
  { href: "payments", label: "Δόσεις & Πληρωμές" },
  { href: "name-list", label: "Name List" },
  { href: "rooming", label: "Rooming List" },
  { href: "tickets", label: "Εισιτήρια" },
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
      <div className="bg-white">
        <BrandTopBar
          right={
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-500">
                {ctx.isStaff ? "Προσωπικό GASSI — πλήρη δικαιώματα" : "Σύνδεση σχολείου"}
              </p>
              <form action={logoutAction}>
                <button type="submit" className="text-sm text-slate-500 underline">
                  Αποσύνδεση
                </button>
              </form>
            </div>
          }
        />
        <PortalTabs token={params.token} tabs={TABS} />
      </div>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
