'use client';

import { Field } from '@/components/forms';
import { UiSelect } from '@/components/ui-select';
import { useAssignmentFields } from '@/hooks/use-assignment-fields';
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
  fromLabel: string;
  fromName: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  toLabel: string;
  toName: string;
};

/** Paired from/to selects for a revision range. */
function RangeFields({
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
          defaultValue="1"
          name={fromName}
          options={options}
          placeholder={placeholder}
        />
      </Field>
      <Field label={toLabel}>
        <UiSelect
          defaultValue="1"
          name={toName}
          options={options}
          placeholder={placeholder}
        />
      </Field>
    </div>
  );
}

/** Structured lesson/revision assignment fields for scheduling forms. */
export function AssignmentFields(): React.JSX.Element {
  const {
    assignmentType,
    ayahOptions,
    revisionMode,
    selectedSurah,
    setAssignmentType,
    setLessonSurahNumber,
    setRevisionMode,
  } = useAssignmentFields();

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
                    name="lessonAyahFrom"
                    options={ayahOptions}
                    placeholder="Optional"
                  />
                </Field>
                <Field label="Ayah to">
                  <UiSelect
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
              fromLabel="Juz from"
              fromName="revisionJuzFrom"
              options={JUZ_OPTIONS}
              toLabel="Juz to"
              toName="revisionJuzTo"
            />
          ) : null}

          {revisionMode === 'hizb' ? (
            <RangeFields
              fromLabel="Hizb from"
              fromName="revisionHizbFrom"
              options={HIZB_OPTIONS}
              toLabel="Hizb to"
              toName="revisionHizbTo"
            />
          ) : null}

          {revisionMode === 'surah_range' ? (
            <RangeFields
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
