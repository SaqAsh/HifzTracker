'use client';

import { useMemo, useState } from 'react';
import { getSurah, type Surah } from '@/lib/quran';

type SelectOption = {
  label: string;
  value: string;
};

type UseAssignmentFields = {
  assignmentType: string;
  ayahOptions: SelectOption[];
  revisionMode: string;
  selectedSurah: null | Surah;
  setAssignmentType: (value: string) => void;
  setLessonSurahNumber: (value: string) => void;
  setRevisionMode: (value: string) => void;
};

/** Tracks lesson/revision selection state and derived ayah options. */
export function useAssignmentFields(): UseAssignmentFields {
  const [assignmentType, setAssignmentType] = useState('lesson');
  const [lessonSurahNumber, setLessonSurahNumber] = useState('');
  const [revisionMode, setRevisionMode] = useState('juz');

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
    setAssignmentType,
    setLessonSurahNumber,
    setRevisionMode,
  };
}
