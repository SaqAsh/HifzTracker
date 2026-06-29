import type { LessonStatus, StudentStatus } from '@/lib/database.types';

/** Canonical student lifecycle statuses. */
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
} as const satisfies Record<string, StudentStatus>;

/** Statuses offered in the student edit form, in display order. */
export const STUDENT_STATUS_OPTIONS: StudentStatus[] = [
  STUDENT_STATUS.ACTIVE,
  STUDENT_STATUS.PAUSED,
  STUDENT_STATUS.INACTIVE,
];

/** Canonical lesson lifecycle statuses. */
export const LESSON_STATUS = {
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  SCHEDULED: 'scheduled',
} as const satisfies Record<string, LessonStatus>;
