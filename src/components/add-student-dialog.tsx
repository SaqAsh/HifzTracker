'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { createStudent } from '@/app/actions';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from '@/components/forms';

/** Modal form for adding a student without pinning the form open on the page. */
export function AddStudentDialog(): React.JSX.Element {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={`${primaryButtonClassName} w-full sm:w-auto`}>
        Add Student
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-teal/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto rounded-[2rem] border border-teal/15 bg-cream p-5 shadow-xl shadow-teal/15 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-serif text-3xl font-semibold text-teal">
                Add Student
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-semibold text-ink/60">
                Add the student profile once. Lessons are scheduled from the
                Lessons tab.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close add student form"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-teal/20 text-xl font-bold text-teal"
              type="button"
            >
              ×
            </Dialog.Close>
          </div>

          <form action={createStudent} className="grid gap-4">
            <Field label="Name">
              <input className={fieldClassName} name="name" required />
            </Field>
            <Field label="Email">
              <input
                className={fieldClassName}
                name="email"
                type="email"
                required
              />
            </Field>
            <Field label="Password">
              <input
                className={fieldClassName}
                name="password"
                type="text"
                placeholder="Optional — for student login"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone">
                <input className={fieldClassName} name="phone" type="tel" />
              </Field>
              <Field label="Start date">
                <input
                  className={fieldClassName}
                  name="startDate"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                className={`${fieldClassName} min-h-24 py-3`}
                name="notes"
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                className={`${primaryButtonClassName} w-full`}
                type="submit"
              >
                Save Student
              </button>
              <Dialog.Close
                className={`${secondaryButtonClassName} w-full`}
                type="button"
              >
                Cancel
              </Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
