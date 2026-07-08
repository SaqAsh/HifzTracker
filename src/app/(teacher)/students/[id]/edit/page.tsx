import { notFound } from 'next/navigation';
import { archiveStudent, updateStudent } from '@/app/actions';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import {
  Field,
  dangerButtonClassName,
  fieldClassName,
  primaryButtonClassName,
} from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { UiSelect } from '@/components/ui-select';
import { requireTeacher } from '@/lib/auth';
import { getStudent } from '@/lib/data/students';
import { STUDENT_STATUS, STUDENT_STATUS_OPTIONS } from '@/lib/statuses';
import { createClient } from '@/lib/supabase/server';

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

/** Student edit form. */
export default async function EditStudentPage({
  params,
}: EditStudentPageProps): Promise<React.JSX.Element> {
  await requireTeacher();
  const { id } = await params;
  const supabase = await createClient();
  const student = await getStudent(supabase, id);

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
          <Field label="Set new password">
            <input
              className={fieldClassName}
              name="password"
              type="text"
              placeholder="Leave blank to keep unchanged"
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
              options={STUDENT_STATUS_OPTIONS.map((status) => ({
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
      {student.status === STUDENT_STATUS.INACTIVE ? null : (
        <form action={archiveStudent}>
          <input name="studentId" type="hidden" value={student.id} />
          <ConfirmSubmitButton
            className={dangerButtonClassName}
            message={`Archive ${student.name}?`}
          >
            Archive Student
          </ConfirmSubmitButton>
        </form>
      )}
    </>
  );
}
