-- gen_random_bytes() lives in the `extensions` schema on this project;
-- the trigger function's search_path needs it to find pgcrypto.
create or replace function create_trip_portal_on_won()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into trip_portals (tender_id, school_id, access_token, access_code)
  values (
    new.id,
    new.school_id,
    encode(gen_random_bytes(16), 'hex'),
    lpad(floor(random() * 1000000)::text, 6, '0')
  )
  on conflict (tender_id) do nothing;
  return new;
end;
$$;
