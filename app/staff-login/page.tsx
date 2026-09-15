import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import { StaffLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  const session = await verifySession(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (session?.role === "staff") {
    redirect("/staff");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <StaffLoginForm />
    </main>
  );
}
