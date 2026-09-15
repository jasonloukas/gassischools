"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/session";

export type PortalLoginState = { error?: string };

export async function portalLoginAction(
  token: string,
  _prevState: PortalLoginState,
  formData: FormData
): Promise<PortalLoginState> {
  const code = formData.get("code")?.toString().trim() ?? "";
  if (!code) {
    return { error: "Εισάγετε τον κωδικό πρόσβασης." };
  }

  const supabase = getSupabaseAdmin();
  const { data: portal, error } = await supabase
    .from("trip_portals")
    .select("tender_id, access_code, is_active")
    .eq("access_token", token)
    .maybeSingle();

  if (error) {
    console.error("portalLoginAction lookup error", error);
    return { error: "Προσωρινό σφάλμα. Δοκιμάστε ξανά." };
  }

  if (!portal || !portal.is_active) {
    return { error: "Μη έγκυρος ή ανενεργός σύνδεσμος εκδρομής." };
  }

  if (portal.access_code !== code) {
    return { error: "Λάθος κωδικός πρόσβασης." };
  }

  const { jwt, maxAge } = await signSession({
    role: "school",
    tenderId: portal.tender_id as string,
    token,
  });

  cookies().set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  redirect(`/portal/${token}/overview`);
}
