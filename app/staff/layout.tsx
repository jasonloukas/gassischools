import { logoutAction } from "@/app/actions/logout";
import { BrandTopBar } from "@/components/brand-topbar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <BrandTopBar
        right={
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-500 underline">
              Αποσύνδεση
            </button>
          </form>
        }
      />
      {children}
    </div>
  );
}
