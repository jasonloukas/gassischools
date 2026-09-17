import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import { BrandTopBar } from "@/components/brand-topbar";
import { StaffLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  const session = await verifySession(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (session?.role === "staff") {
    redirect("/staff");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <BrandTopBar />
      <main className="flex items-center justify-center p-8">
        <StaffLoginForm />
      </main>
    </div>
  );
}
