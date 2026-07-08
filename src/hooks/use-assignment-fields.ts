'use client';

import { useMemo, useState } from 'react';
import { getSurah, type Surah } from '@/lib/quran';

type AssignmentType = 'lesson' | 'revision';
type RevisionMode = 'hizb' | 'juz' | 'surah_range';

export type AssignmentFieldDefaults = {
  assignment_type?: AssignmentType | null;
  lesson_surah_number?: null | number;
  revision_mode?: null | RevisionMode;
};

type SelectOption = {
  label: string;
  value: string;
};

type UseAssignmentFields = {
  assignmentType: AssignmentType;
  ayahOptions: SelectOption[];
  revisionMode: RevisionMode;
  selectedSurah: null | Surah;
  setAssignmentType: (value: string) => void;
  setLessonSurahNumber: (value: string) => void;
  setRevisionMode: (value: string) => void;
};

/** Tracks lesson/revision selection state and derived ayah options. */
export function useAssignmentFields(
  defaults: AssignmentFieldDefaults = {},
): UseAssignmentFields {
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(
    defaults.assignment_type ?? 'lesson',
  );
  const [lessonSurahNumber, setLessonSurahNumber] = useState(
    defaults.lesson_surah_number ? String(defaults.lesson_surah_number) : '',
  );
  const [revisionMode, setRevisionMode] = useState<RevisionMode>(
    defaults.revision_mode ?? 'juz',
  );

  const selectedSurah = useMemo(
    () => getSurah(lessonSurahNumber ? Number(lessonSurahNumber) : null),
    [lessonSurahNumber],
  );

  const ayahOptions = useMemo<SelectOption[]>(
    () =>
      selectedSurah
        ? Array.from({ length: selectedSurah.ayahCount }, (_, index) => ({
            label: `Ayah ${index + 1}`,
            value: String(index + 1),
          }))
        : [],
    [selectedSurah],
  );

  return {
    assignmentType,
    ayahOptions,
    revisionMode,
    selectedSurah,
    setAssignmentType: (value) => {
      setAssignmentType(value === 'revision' ? 'revision' : 'lesson');
    },
    setLessonSurahNumber,
    setRevisionMode: (value) => {
      if (value === 'hizb' || value === 'surah_range') {
        setRevisionMode(value);
        return;
      }

      setRevisionMode('juz');
    },
  };
}
