-- A student can only be assigned to one room at a time; enables a
-- clean upsert-on-reassign instead of manual delete-then-insert.
alter table trip_rooming_assignments add constraint trip_rooming_assignments_student_id_key unique (student_id);
