-- One contract row per tender, so uploads can upsert cleanly.
alter table trip_contracts add constraint trip_contracts_tender_id_key unique (tender_id);

-- Private bucket for contract PDFs. No public access; storage.objects
-- already has RLS enabled with no anon/authenticated policies by
-- default, so only the service-role client (server-side) can read or
-- write objects here — same deny-by-default model as the trip_* tables.
insert into storage.buckets (id, name, public)
values ('trip-contracts', 'trip-contracts', false)
on conflict (id) do nothing;
