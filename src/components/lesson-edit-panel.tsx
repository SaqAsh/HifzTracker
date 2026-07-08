'use client';

import { useState } from 'react';
import { updateLesson } from '@/app/actions';
import { AssignmentFields } from '@/components/assignment-fields';
import { DateTimePicker } from '@/components/date-time-picker';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';
import { UiSelect } from '@/components/ui-select';
import type { Lesson } from '@/lib/database.types';
import { toDateTimeLocalValue } from '@/lib/dates';

type StudentOption = {
  id: string;
  name: string;
};

type LessonEditPanelProps = {
  lesson: Lesson;
  returnTo: string;
  students?: StudentOption[];
};

/** Lazily renders the full lesson edit form from a lesson card. */
export function LessonEditPanel({
  lesson,
  returnTo,
  students,
}: LessonEditPanelProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <button
        className={`${secondaryButtonClassName} w-full`}
        onClick={() => {
          setIsEditing(true);
        }}
        type="button"
      >
        Edit
      </button>
    );
  }

  return (
    <section className="border-t border-teal/10 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl font-semibold text-teal">
          Edit Lesson
        </h3>
        <button
          className="text-sm font-bold text-ink/60"
          onClick={() => {
            setIsEditing(false);
          }}
          type="button"
        >
          Close
        </button>
      </div>

      <form action={updateLesson} className="mt-4 grid gap-4">
        <input name="returnTo" type="hidden" value={returnTo} />
        <input name="lessonId" type="hidden" value={lesson.id} />
        {students ? (
          <Field label="Student">
            <UiSelect
              defaultValue={lesson.student_id}
              name="studentId"
              options={students.map((student) => ({
                label: student.name,
                value: student.id,
              }))}
              placeholder="Choose student"
            />
          </Field>
        ) : (
          <input name="studentId" type="hidden" value={lesson.student_id} />
        )}

        <div className="grid gap-3">
          <Field label="Date/time">
            <DateTimePicker
              defaultValue={toDateTimeLocalValue(
                new Date(lesson.scheduled_at),
              )}
              name="scheduledAt"
            />
          </Field>
          <Field label="Mistakes allowed">
            <input
              className={fieldClassName}
              defaultValue={lesson.max_mistakes}
              min="1"
              name="maxMistakes"
              required
              type="number"
            />
          </Field>
        </div>

        <AssignmentFields defaultAssignment={lesson} />

        <button className={`${primaryButtonClassName} w-full`} type="submit">
          Save Changes
        </button>
      </form>
    </section>
  );
}
