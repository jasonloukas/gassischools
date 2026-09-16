-- Private bucket for ticket PDFs, same deny-by-default model as
-- trip-contracts: no public access, no anon/authenticated policies,
-- only the service-role client touches it.
insert into storage.buckets (id, name, public)
values ('trip-tickets', 'trip-tickets', false)
on conflict (id) do nothing;
