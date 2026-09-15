import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

export type PortalContext = {
  tenderId: string;
  token: string;
  isStaff: boolean;
  /** Contract / Δόσεις & Πληρωμές / Εισιτήρια are staff-only edit, view-only for schools. */
  canEditRestrictedTabs: boolean;
};

/**
 * Resolves which tender the given portal token belongs to, and whether
 * the current visitor is authorized to view it. This is the single
 * place that maps a route token to a tender_id — every data query on
 * a portal page must filter by the tenderId this returns.
 */
export async function getPortalContext(
  token: string
): Promise<PortalContext | null> {
  const session = await verifySession(
    cookies().get(SESSION_COOKIE_NAME)?.value
  );
  if (!session) return null;

  if (session.role === "staff") {
    const supabase = getSupabaseAdmin();
    const { data: portal } = await supabase
      .from("trip_portals")
      .select("tender_id, is_active")
      .eq("access_token", token)
      .maybeSingle();
    if (!portal || !portal.is_active) return null;
    return {
      tenderId: portal.tender_id as string,
      token,
      isStaff: true,
      canEditRestrictedTabs: true,
    };
  }

  if (session.role === "school" && session.token === token) {
    return {
      tenderId: session.tenderId,
      token,
      isStaff: false,
      canEditRestrictedTabs: false,
    };
  }

  return null;
}
