'use client';

import { useMemo, useState } from 'react';
import { Field } from '@/components/forms';
import { UiSelect } from '@/components/ui-select';
import {
  HIZB_OPTIONS,
  JUZ_OPTIONS,
  SURAH_OPTIONS,
  getSurah,
} from '@/lib/quran';

const ASSIGNMENT_TYPE_OPTIONS = [
  { label: 'Lesson', value: 'lesson' },
  { label: 'Revision', value: 'revision' },
];

const REVISION_MODE_OPTIONS = [
  { label: 'Juz range', value: 'juz' },
  { label: 'Hizb range', value: 'hizb' },
  { label: 'Surah to surah', value: 'surah_range' },
];

/** Structured lesson/revision assignment fields for scheduling forms. */
export function AssignmentFields(): React.JSX.Element {
  const [assignmentType, setAssignmentType] = useState('lesson');
  const [lessonSurahNumber, setLessonSurahNumber] = useState('');
  const [revisionMode, setRevisionMode] = useState('juz');
  const selectedSurah = useMemo(
    () => getSurah(lessonSurahNumber ? Number(lessonSurahNumber) : null),
    [lessonSurahNumber],
  );
  const ayahOptions = useMemo(
    () =>
      selectedSurah
        ? Array.from({ length: selectedSurah.ayahCount }, (_, index) => ({
            label: `Ayah ${index + 1}`,
            value: String(index + 1),
          }))
        : [],
    [selectedSurah],
  );

  return (
    <section className="grid gap-4 rounded-[1.5rem] border border-teal/10 bg-cream p-3">
      <Field label="Assignment type">
        <UiSelect
          name="assignmentType"
          value={assignmentType}
          onValueChange={setAssignmentType}
          options={ASSIGNMENT_TYPE_OPTIONS}
        />
      </Field>

      {assignmentType === 'lesson' ? (
        <div className="grid gap-4">
          <Field label="Lesson surah">
            <UiSelect
              name="lessonSurahNumber"
              value={lessonSurahNumber}
              onValueChange={setLessonSurahNumber}
              placeholder="Choose surah"
              options={SURAH_OPTIONS}
            />
          </Field>
          {selectedSurah ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Ayah from">
                  <UiSelect
                    name="lessonAyahFrom"
                    placeholder="Optional"
                    options={ayahOptions}
                  />
                </Field>
                <Field label="Ayah to">
                  <UiSelect
                    name="lessonAyahTo"
                    placeholder="Optional"
                    options={ayahOptions}
                  />
                </Field>
              </div>
              <p className="text-sm font-semibold text-ink/60">
                {selectedSurah.name} has {selectedSurah.ayahCount} ayahs.
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4">
          <Field label="Revision range">
            <UiSelect
              name="revisionMode"
              value={revisionMode}
              onValueChange={setRevisionMode}
              options={REVISION_MODE_OPTIONS}
            />
          </Field>

          {revisionMode === 'juz' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Juz from">
                <UiSelect
                  name="revisionJuzFrom"
                  defaultValue="1"
                  options={JUZ_OPTIONS}
                />
              </Field>
              <Field label="Juz to">
                <UiSelect
                  name="revisionJuzTo"
                  defaultValue="1"
                  options={JUZ_OPTIONS}
                />
              </Field>
            </div>
          ) : null}

          {revisionMode === 'hizb' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Hizb from">
                <UiSelect
                  name="revisionHizbFrom"
                  defaultValue="1"
                  options={HIZB_OPTIONS}
                />
              </Field>
              <Field label="Hizb to">
                <UiSelect
                  name="revisionHizbTo"
                  defaultValue="1"
                  options={HIZB_OPTIONS}
                />
              </Field>
            </div>
          ) : null}

          {revisionMode === 'surah_range' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Surah from">
                <UiSelect
                  name="revisionSurahFrom"
                  defaultValue="1"
                  placeholder="Choose surah"
                  options={SURAH_OPTIONS}
                />
              </Field>
              <Field label="Surah to">
                <UiSelect
                  name="revisionSurahTo"
                  defaultValue="1"
                  placeholder="Choose surah"
                  options={SURAH_OPTIONS}
                />
              </Field>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
