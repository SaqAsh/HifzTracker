import type { Lesson, Student } from '@/lib/database.types';
import { LESSON_STATUS } from '@/lib/statuses';

export type LessonWithStudent = Lesson & {
  studentName: string;
};

/** Joins lesson rows to their student names for list rendering. */
export function attachStudentNames(
  lessons: Lesson[],
  students: Student[],
): LessonWithStudent[] {
  const names = new Map(students.map((student) => [student.id, student.name]));
  return lessons.map((lesson) => ({
    ...lesson,
    studentName: names.get(lesson.student_id) ?? 'Unknown student',
  }));
}

/** Groups lessons by their yyyy-mm-dd scheduled day, preserving order. */
export function groupByDay<T extends Lesson>(lessons: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  lessons.forEach((lesson) => {
    const day = lesson.scheduled_at.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), lesson]);
  });

  return groups;
}

/** Whether a lesson is still scheduled in the future. */
export function isUpcomingLesson(lesson: Lesson, now = Date.now()): boolean {
  return (
    lesson.status === LESSON_STATUS.SCHEDULED &&
    new Date(lesson.scheduled_at).getTime() >= now
  );
}

/** Human-friendly status for a lesson in the student portal. */
export function lessonStatusLabel(lesson: Lesson): string {
  if (lesson.status === LESSON_STATUS.SCHEDULED) {
    return isUpcomingLesson(lesson) ? 'Upcoming' : 'Past scheduled';
  }

  return lesson.status;
}
