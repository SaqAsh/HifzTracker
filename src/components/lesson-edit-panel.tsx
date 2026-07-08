'use client';

import { useState } from 'react';
import { updateLesson } from '@/app/actions';
import { AssignmentFields } from '@/components/assignment-fields';
import { DateTimePicker } from '@/components/date-time-picker';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
} from '@/components/forms';
import { UiSelect } from '@/components/ui-select';
import type { Lesson } from '@/lib/database.types';
import { toDateTimeLocalValue } from '@/lib/dates';

type StudentOption = {
  id: string;
  name: string;
};

type LessonEditPanelProps = {
  editButtonClassName?: string;
  lesson: Lesson;
  returnTo: string;
  students?: StudentOption[];
};

const defaultEditButtonClassName =
  'absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-teal/15 bg-cream text-teal shadow-sm transition hover:bg-teal/10';

function EditIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5z" />
    </svg>
  );
}

/** Lazily renders the full lesson edit form from a lesson card. */
export function LessonEditPanel({
  editButtonClassName,
  lesson,
  returnTo,
  students,
}: LessonEditPanelProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <button
        aria-label="Edit lesson"
        className={editButtonClassName ?? defaultEditButtonClassName}
        onClick={() => {
          setIsEditing(true);
        }}
        type="button"
      >
        <EditIcon />
      </button>
    );
  }

  return (
    <section className="mt-4 border-t border-teal/10 pt-4">
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
              defaultValue={toDateTimeLocalValue(new Date(lesson.scheduled_at))}
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

        <button className={primaryButtonClassName} type="submit">
          Save Changes
        </button>
      </form>
    </section>
  );
}
