-- Supabase's security advisor flags SECURITY DEFINER functions that are
-- callable via PostgREST RPC by anon/authenticated. This is a trigger
-- function only, but revoke execute explicitly to close the lint.
revoke execute on function create_trip_portal_on_won() from public, anon, authenticated;
