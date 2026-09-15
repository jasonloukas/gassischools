create or replace function create_trip_portal_on_won()
returns trigger
language plpgsql
security definer
set search_path = public
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

create trigger trg_tenders_won_create_portal
after insert or update of status on tenders
for each row
when (new.status = 'won')
execute function create_trip_portal_on_won();
