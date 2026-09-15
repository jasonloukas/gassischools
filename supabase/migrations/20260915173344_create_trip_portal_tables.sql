create table trip_portals (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id) unique,
  school_id uuid references schools(id),
  access_token text unique not null,
  access_code text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table trip_contracts (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id),
  contract_pdf_url text,
  signed_date date,
  terms_notes text
);

create table trip_installments (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id),
  installment_number int,
  due_date date,
  amount numeric,
  description text
);

create table trip_student_payments (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id),
  student_full_name text not null,
  amount_due numeric,
  amount_paid numeric default 0,
  last_payment_date date,
  status text default 'pending' -- pending / partial / paid, auto-computed (Step 4)
);

create table trip_name_list (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id),
  student_full_name text not null,
  id_or_passport text,
  birth_date date,
  notes text
);

create table trip_rooming_list (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id),
  room_number text,
  room_type text,
  capacity int
);

create table trip_rooming_assignments (
  id uuid primary key default gen_random_uuid(),
  rooming_list_id uuid references trip_rooming_list(id),
  student_id uuid references trip_name_list(id)
);

create table trip_tickets (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tenders(id),
  ticket_type text, -- αεροπορικό/ακτοπλοϊκό/πούλμαν
  carrier text,
  ticket_number text,
  passenger_name text,
  details text,
  file_url text
);

alter table trip_portals enable row level security;
alter table trip_contracts enable row level security;
alter table trip_installments enable row level security;
alter table trip_student_payments enable row level security;
alter table trip_name_list enable row level security;
alter table trip_rooming_list enable row level security;
alter table trip_rooming_assignments enable row level security;
alter table trip_tickets enable row level security;
-- No policies for anon/authenticated — access only via service role from server code.
