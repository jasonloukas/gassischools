-- Βήμα 4: authoritative payment status, computed in the DB so it's
-- correct regardless of what writes amount_paid/amount_due (the app's
-- Server Actions, a future integration, or a direct SQL edit).
create or replace function set_trip_student_payment_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.amount_paid is null or new.amount_paid <= 0 then
    new.status := 'pending';
  elsif new.amount_due is not null and new.amount_due > 0 and new.amount_paid >= new.amount_due then
    new.status := 'paid';
  else
    new.status := 'partial';
  end if;
  return new;
end;
$$;

create trigger trg_trip_student_payments_status
before insert or update of amount_paid, amount_due on trip_student_payments
for each row
execute function set_trip_student_payment_status();
