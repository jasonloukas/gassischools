"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAuthClient } from "@/lib/supabase-auth-client";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/session";

export type StaffLoginState = { error?: string };

export async function staffLoginAction(
  _prevState: StaffLoginState,
  formData: FormData
): Promise<StaffLoginState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return { error: "Συμπληρώστε email και κωδικό." };
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Λάθος στοιχεία σύνδεσης." };
  }

  const { jwt, maxAge } = await signSession({
    role: "staff",
    userId: data.user.id,
    email: data.user.email ?? email,
  });

  cookies().set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  redirect("/staff");
}
