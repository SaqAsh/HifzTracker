import { notFound } from 'next/navigation';
import { archiveStudent, updateStudent } from '@/app/actions';
import {
  Field,
  dangerButtonClassName,
  fieldClassName,
  primaryButtonClassName,
} from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { UiSelect } from '@/components/ui-select';
import type { StudentStatus } from '@/lib/database.types';
import { requireTeacher } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

const STUDENT_STATUSES: StudentStatus[] = ['active', 'paused', 'inactive'];

/** Student edit form. */
export default async function EditStudentPage({
  params,
}: EditStudentPageProps): Promise<React.JSX.Element> {
  await requireTeacher();
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  return (
    <>
      <PageHeader eyebrow="Edit" title={student.name} />
      <section className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm">
        <form action={updateStudent} className="grid gap-4">
          <input type="hidden" name="studentId" value={student.id} />
          <Field label="Name">
            <input
              className={fieldClassName}
              name="name"
              defaultValue={student.name}
              required
            />
          </Field>
          <Field label="Email">
            <input
              className={fieldClassName}
              name="email"
              type="email"
              defaultValue={student.email}
              required
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone">
              <input
                className={fieldClassName}
                name="phone"
                type="tel"
                defaultValue={student.phone ?? ''}
              />
            </Field>
            <Field label="Start date">
              <input
                className={fieldClassName}
                name="startDate"
                type="date"
                defaultValue={student.start_date}
                required
              />
            </Field>
          </div>
          <Field label="Status">
            <UiSelect
              name="status"
              defaultValue={student.status}
              options={STUDENT_STATUSES.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </Field>
          <Field label="Notes">
            <textarea
              className={`${fieldClassName} min-h-28 py-3`}
              name="notes"
              defaultValue={student.notes ?? ''}
            />
          </Field>
          <button className={primaryButtonClassName} type="submit">
            Save Student
          </button>
        </form>
      </section>
      {student.status !== 'inactive' ? (
        <form action={archiveStudent}>
          <input type="hidden" name="studentId" value={student.id} />
          <button className={dangerButtonClassName} type="submit">
            Archive Student
          </button>
        </form>
      ) : null}
    </>
  );
}
