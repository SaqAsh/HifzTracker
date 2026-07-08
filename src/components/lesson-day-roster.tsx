'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cardClassName } from '@/components/forms';
import { LessonEditPanel } from '@/components/lesson-edit-panel';
import { StartSessionButton } from '@/components/lesson-actions';
import { StudentPrefetchLink } from '@/components/student-prefetch-link';
import { formatTime } from '@/lib/dates';
import type { LessonWithStudent } from '@/lib/lessons';
import { formatAssignmentSummary } from '@/lib/quran';

type StudentOption = {
  id: string;
  name: string;
};

type LessonDayRosterProps = {
  lessons: LessonWithStudent[];
  prefetchStudentIds?: string[];
  returnTo: string;
  students: StudentOption[];
};

type StudentLessonGroup = {
  lessons: LessonWithStudent[];
  studentId: string;
  studentName: string;
};

type StudentLessonGroupCardProps = {
  defaultOpen: boolean;
  group: StudentLessonGroup;
  returnTo: string;
  students: StudentOption[];
};

function groupLessonsByStudent(
  lessons: LessonWithStudent[],
): StudentLessonGroup[] {
  const groups = new Map<string, StudentLessonGroup>();

  lessons.forEach((lesson) => {
    const existingGroup = groups.get(lesson.student_id);

    if (existingGroup) {
      existingGroup.lessons.push(lesson);
      return;
    }

    groups.set(lesson.student_id, {
      lessons: [lesson],
      studentId: lesson.student_id,
      studentName: lesson.studentName,
    });
  });

  return Array.from(groups.values());
}

function formatItemCount(count: number): string {
  return count === 1 ? '1 item' : `${count} items`;
}

function formatGroupTimeSummary(lessons: LessonWithStudent[]): string {
  const firstLesson = lessons[0];
  const lastLesson = lessons.at(-1);

  if (!firstLesson || !lastLesson) {
    return '';
  }

  const firstTime = formatTime(firstLesson.scheduled_at);
  const lastTime = formatTime(lastLesson.scheduled_at);

  return firstTime === lastTime ? firstTime : `${firstTime} - ${lastTime}`;
}

function StudentLessonGroupCard({
  defaultOpen,
  group,
  returnTo,
  students,
}: StudentLessonGroupCardProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <StudentPrefetchLink
            className="block truncate font-serif text-2xl font-semibold text-teal"
            href={`/students/${group.studentId}`}
          >
            {group.studentName}
          </StudentPrefetchLink>
          <p className="mt-1 text-sm font-semibold text-sand">
            {formatGroupTimeSummary(group.lessons)}
          </p>
        </div>

        <button
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${group.studentName} items`}
          className="tap-target grid shrink-0 justify-items-end gap-2 rounded-2xl text-right outline-none focus-visible:ring-4 focus-visible:ring-teal/10"
          onClick={() => {
            setIsOpen((current) => !current);
          }}
          type="button"
        >
          <span className="rounded-full border border-teal/15 bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal">
            {formatItemCount(group.lessons.length)}
          </span>
          <span
            aria-hidden="true"
            className={`grid h-8 w-8 place-items-center rounded-full border border-teal/15 text-xl leading-none text-teal transition ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20">
              <path
                d="M5 7.5 10 12.5 15 7.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>
        </button>
      </div>

      {isOpen ? (
        <ol className="mt-3 divide-y divide-teal/10 border-t border-teal/10">
          {group.lessons.map((lesson) => (
            <li className="relative py-3 pr-11" key={lesson.id}>
              <div className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-start">
                <div>
                  <p className="text-sm font-bold text-sand">
                    {formatTime(lesson.scheduled_at)}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                    {lesson.status}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {formatAssignmentSummary(lesson)}
                  </p>
                  <p className="mt-2 text-sm text-ink/60">
                    {lesson.max_mistakes} mistakes allowed
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <StartSessionButton lessonId={lesson.id} />
                </div>
              </div>

              <LessonEditPanel
                editButtonClassName="absolute right-0 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-teal/15 bg-cream text-teal shadow-sm transition hover:bg-teal/10"
                lesson={lesson}
                returnTo={returnTo}
                students={students}
              />
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

/** Compact per-day roster grouped by student, with expandable lesson rows. */
export function LessonDayRoster({
  lessons,
  prefetchStudentIds = [],
  returnTo,
  students,
}: LessonDayRosterProps): React.JSX.Element | null {
  const router = useRouter();
  const groups = useMemo(() => groupLessonsByStudent(lessons), [lessons]);
  const prefetchKey = prefetchStudentIds.join('|');

  useEffect(() => {
    const prefetchIds = new Set(prefetchStudentIds);
    const hrefs = groups
      .filter((group) => prefetchIds.has(group.studentId))
      .map((group) => `/students/${group.studentId}`);

    if (hrefs.length === 0) {
      return;
    }

    function prefetchRoutes(): void {
      hrefs.forEach((href) => {
        router.prefetch(href);
      });
    }

    if ('requestIdleCallback' in window) {
      const callbackId = window.requestIdleCallback(prefetchRoutes);

      return () => {
        window.cancelIdleCallback(callbackId);
      };
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 200);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [groups, prefetchKey, prefetchStudentIds, router]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {groups.map((group) => (
        <StudentLessonGroupCard
          defaultOpen={false}
          group={group}
          key={group.studentId}
          returnTo={returnTo}
          students={students}
        />
      ))}
    </div>
  );
}
