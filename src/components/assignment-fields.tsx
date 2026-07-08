'use client';

import { Field } from '@/components/forms';
import { UiSelect } from '@/components/ui-select';
import {
  type AssignmentFieldDefaults,
  useAssignmentFields,
} from '@/hooks/use-assignment-fields';
import type { LessonAssignment } from '@/lib/quran';
import { HIZB_OPTIONS, JUZ_OPTIONS, SURAH_OPTIONS } from '@/lib/quran';

const ASSIGNMENT_TYPE_OPTIONS = [
  { label: 'Lesson', value: 'lesson' },
  { label: 'Revision', value: 'revision' },
];

const REVISION_MODE_OPTIONS = [
  { label: 'Juz range', value: 'juz' },
  { label: 'Hizb range', value: 'hizb' },
  { label: 'Surah to surah', value: 'surah_range' },
];

type RangeFieldsProps = {
  defaultFrom?: null | number;
  defaultTo?: null | number;
  fromLabel: string;
  fromName: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  toLabel: string;
  toName: string;
};

function selectDefaultValue(
  value: null | number | undefined,
  fallback: string,
): string | undefined {
  if (value === undefined) {
    return fallback;
  }

  return value === null ? undefined : String(value);
}

/** Paired from/to selects for a revision range. */
function RangeFields({
  defaultFrom,
  defaultTo,
  fromLabel,
  fromName,
  options,
  placeholder,
  toLabel,
  toName,
}: RangeFieldsProps): React.JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={fromLabel}>
        <UiSelect
          defaultValue={selectDefaultValue(defaultFrom, '1')}
          name={fromName}
          options={options}
          placeholder={placeholder}
        />
      </Field>
      <Field label={toLabel}>
        <UiSelect
          defaultValue={selectDefaultValue(defaultTo, '1')}
          name={toName}
          options={options}
          placeholder={placeholder}
        />
      </Field>
    </div>
  );
}

type AssignmentFieldsProps = {
  defaultAssignment?: AssignmentFieldDefaults &
    Pick<
      LessonAssignment,
      | 'lesson_ayah_from'
      | 'lesson_ayah_to'
      | 'revision_hizb_from'
      | 'revision_hizb_to'
      | 'revision_juz_from'
      | 'revision_juz_to'
      | 'revision_surah_from'
      | 'revision_surah_to'
    >;
};

/** Structured lesson/revision assignment fields for scheduling forms. */
export function AssignmentFields({
  defaultAssignment,
}: AssignmentFieldsProps): React.JSX.Element {
  const {
    assignmentType,
    ayahOptions,
    revisionMode,
    selectedSurah,
    setAssignmentType,
    setLessonSurahNumber,
    setRevisionMode,
  } = useAssignmentFields(defaultAssignment);

  return (
    <section className="grid gap-4 rounded-[1.5rem] border border-teal/10 bg-cream p-3">
      <Field label="Assignment type">
        <UiSelect
          name="assignmentType"
          onValueChange={setAssignmentType}
          options={ASSIGNMENT_TYPE_OPTIONS}
          value={assignmentType}
        />
      </Field>

      {assignmentType === 'lesson' ? (
        <div className="grid gap-4">
          <Field label="Lesson surah">
            <UiSelect
              defaultValue={
                defaultAssignment?.lesson_surah_number
                  ? String(defaultAssignment.lesson_surah_number)
                  : undefined
              }
              name="lessonSurahNumber"
              onValueChange={setLessonSurahNumber}
              options={SURAH_OPTIONS}
              placeholder="Choose surah"
            />
          </Field>
          {selectedSurah ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Ayah from">
                  <UiSelect
                    defaultValue={
                      defaultAssignment?.lesson_ayah_from
                        ? String(defaultAssignment.lesson_ayah_from)
                        : undefined
                    }
                    name="lessonAyahFrom"
                    options={ayahOptions}
                    placeholder="Optional"
                  />
                </Field>
                <Field label="Ayah to">
                  <UiSelect
                    defaultValue={
                      defaultAssignment?.lesson_ayah_to
                        ? String(defaultAssignment.lesson_ayah_to)
                        : undefined
                    }
                    name="lessonAyahTo"
                    options={ayahOptions}
                    placeholder="Optional"
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
              onValueChange={setRevisionMode}
              options={REVISION_MODE_OPTIONS}
              value={revisionMode}
            />
          </Field>

          {revisionMode === 'juz' ? (
            <RangeFields
              defaultFrom={defaultAssignment?.revision_juz_from}
              defaultTo={defaultAssignment?.revision_juz_to}
              fromLabel="Juz from"
              fromName="revisionJuzFrom"
              options={JUZ_OPTIONS}
              toLabel="Juz to"
              toName="revisionJuzTo"
            />
          ) : null}

          {revisionMode === 'hizb' ? (
            <RangeFields
              defaultFrom={defaultAssignment?.revision_hizb_from}
              defaultTo={defaultAssignment?.revision_hizb_to}
              fromLabel="Hizb from"
              fromName="revisionHizbFrom"
              options={HIZB_OPTIONS}
              toLabel="Hizb to"
              toName="revisionHizbTo"
            />
          ) : null}

          {revisionMode === 'surah_range' ? (
            <RangeFields
              defaultFrom={defaultAssignment?.revision_surah_from}
              defaultTo={defaultAssignment?.revision_surah_to}
              fromLabel="Surah from"
              fromName="revisionSurahFrom"
              options={SURAH_OPTIONS}
              placeholder="Choose surah"
              toLabel="Surah to"
              toName="revisionSurahTo"
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
