'use client';

import { useState } from 'react';
import { startSubacSession } from '@/app/actions';
import {
  Field,
  fieldClassName,
  panelClassName,
  primaryButtonClassName,
} from '@/components/forms';

type StartSubacFormProps = {
  defaultMaxMistakes: number;
  students: { id: string; name: string }[];
};

/** Starts a group Subac rotation from the active student roster. */
export function StartSubacForm({
  defaultMaxMistakes,
  students,
}: StartSubacFormProps): React.JSX.Element {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(students.map((student) => student.id)),
  );
  const canStart = selectedIds.size >= 2;

  function toggleStudent(studentId: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }

      return next;
    });
  }

  return (
    <section className={panelClassName}>
      <h2 className="font-serif text-2xl font-semibold text-teal">
        Start Subac Rotation
      </h2>
      <form action={startSubacSession} className="mt-4 grid gap-4">
        <Field label="Quran portion">
          <input
            className={fieldClassName}
            name="portionLabel"
            placeholder="Juz 1, Surah Yasin, or pages 1-20"
            required
            type="text"
          />
        </Field>

        <Field label="Total mistakes allowed">
          <input
            className={fieldClassName}
            defaultValue={defaultMaxMistakes}
            min="1"
            name="maxMistakes"
            required
            type="number"
          />
        </Field>

        <div className="grid gap-2">
          <p className="text-sm font-semibold text-teal">Students</p>
          {students.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-teal/25 px-4 py-3 text-sm text-ink/60">
              Add active students before starting a Subac rotation.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {students.map((student) => (
                <label
                  className="flex min-h-12 items-center gap-3 rounded-2xl border border-teal/15 bg-cream px-4 py-3 text-sm font-semibold text-ink transition has-checked:border-teal has-checked:bg-teal/10"
                  key={student.id}
                >
                  <input
                    className="size-5 accent-teal"
                    checked={selectedIds.has(student.id)}
                    name="studentIds"
                    onChange={() => {
                      toggleStudent(student.id);
                    }}
                    type="checkbox"
                    value={student.id}
                  />
                  <span>{student.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          className={`${primaryButtonClassName} w-full`}
          disabled={!canStart}
          type="submit"
        >
          Start Randomized Subac
        </button>
        {!canStart ? (
          <p className="text-center text-sm text-ink/60">
            Select at least two active students for the rotation.
          </p>
        ) : null}
      </form>
    </section>
  );
}
