import { AddStudentDialog } from '@/components/add-student-dialog';
import { PageHeader } from '@/components/page-header';
import { StudentCard } from '@/components/student-card';
import { requireTeacher } from '@/lib/auth';
import { listStudents } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';

/** Teacher student list and add form. */
export default async function StudentsPage(): Promise<React.JSX.Element> {
  await requireTeacher();
  const supabase = await createClient();
  const students = await listStudents(supabase);

  return (
    <>
      <PageHeader
        eyebrow="Roster"
        title="Students"
        trailing={<AddStudentDialog />}
      />

      <section className="grid gap-3">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </section>
    </>
  );
}
