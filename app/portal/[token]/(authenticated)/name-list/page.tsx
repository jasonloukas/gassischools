import { notFound } from "next/navigation";
import { getPortalContext } from "@/lib/portal-context";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { StudentRowForm } from "./student-row-form";
import { StudentAddForm } from "./student-add-form";

export const dynamic = "force-dynamic";

type Student = {
  id: string;
  student_full_name: string;
  id_or_passport: string | null;
  birth_date: string | null;
  notes: string | null;
};

export default async function NameListPage({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await getPortalContext(params.token);
  if (!ctx) notFound();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("trip_name_list")
    .select("id, student_full_name, id_or_passport, birth_date, notes")
    .eq("tender_id", ctx.tenderId)
    .order("student_full_name", { ascending: true });

  if (error) {
    console.error("NameListPage lookup error", error);
  }

  const students: Student[] = data ?? [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Name List</h2>
      <div>
        {students.map((student) => (
          <StudentRowForm key={student.id} token={params.token} student={student} />
        ))}
        {students.length === 0 ? (
          <p className="py-2 text-sm text-slate-500">Δεν υπάρχουν μαθητές ακόμα.</p>
        ) : null}
        <StudentAddForm token={params.token} />
      </div>
    </section>
  );
}
