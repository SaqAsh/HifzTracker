import { createLesson } from '@/app/actions';
import { AssignmentFields } from '@/components/assignment-fields';
import { DateTimePicker } from '@/components/date-time-picker';
import {
  Field,
  fieldClassName,
  panelClassName,
  primaryButtonClassName,
} from '@/components/forms';
import { UiSelect } from '@/components/ui-select';
import { toDateTimeLocalValue } from '@/lib/dates';

type ScheduleLessonFormProps = {
  defaultMaxMistakes: number;
  returnTo: string;
  students?: { id: string; name: string }[];
  studentId?: string;
};

/** Shared lesson scheduling form for the lessons list and student detail. */
export function ScheduleLessonForm({
  defaultMaxMistakes,
  returnTo,
  students,
  studentId,
}: ScheduleLessonFormProps): React.JSX.Element {
  return (
    <section className={panelClassName}>
      <h2 className="font-serif text-2xl font-semibold text-teal">
        Schedule Lesson
      </h2>
      <form action={createLesson} className="mt-4 grid gap-4">
        <input name="returnTo" type="hidden" value={returnTo} />
        {studentId ? (
          <input name="studentId" type="hidden" value={studentId} />
        ) : (
          <Field label="Student">
            <UiSelect
              name="studentId"
              options={(students ?? []).map((student) => ({
                label: student.name,
                value: student.id,
              }))}
              placeholder="Choose student"
            />
          </Field>
        )}
        <div className="grid gap-3">
          <Field label="Date/time">
            <DateTimePicker
              defaultValue={toDateTimeLocalValue()}
              name="scheduledAt"
            />
          </Field>
          <Field label="Mistakes allowed">
            <input
              className={fieldClassName}
              defaultValue={defaultMaxMistakes}
              min="1"
              name="maxMistakes"
              required
              type="number"
            />
          </Field>
        </div>
        <AssignmentFields />
        <button className={primaryButtonClassName} type="submit">
          Add Lesson
        </button>
      </form>
    </section>
  );
}
