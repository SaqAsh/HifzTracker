import { z } from 'zod';
import { getSurah } from '@/lib/quran';

const LARGEST_SURAH_AYAH_COUNT = 286;

/** Trimmed, required text field. */
const requiredText = z.string().trim().min(1);

/** Trimmed text that collapses blank values to null. */
const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const text = value?.trim() ?? '';
    return text.length > 0 ? text : null;
  });

/** Normalized email address. */
const email = requiredText.transform((value) => value.toLowerCase());

/** Builds a required integer field constrained to an inclusive range. */
function requiredInt(min: number, max: number): z.ZodType<number> {
  return z.preprocess((value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text.length > 0 ? Number(text) : undefined;
  }, z.number().int().min(min).max(max));
}

/** Builds an optional integer field that maps blank values to null. */
function optionalInt(min: number, max: number): z.ZodType<null | number> {
  return z.preprocess((value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text.length > 0 ? Number(text) : null;
  }, z.number().int().min(min).max(max).nullable());
}

const positiveInt = requiredInt(1, Number.MAX_SAFE_INTEGER);

export const credentialsSchema = z.object({
  email,
  password: requiredText,
});

export const emailSchema = z.object({ email });

export const createStudentSchema = z.object({
  email,
  name: requiredText,
  notes: optionalText,
  password: optionalText,
  phone: optionalText,
  startDate: requiredText,
});

export const updateStudentSchema = createStudentSchema.extend({
  status: z.enum(['active', 'inactive', 'paused']),
  studentId: requiredText,
});

export const studentIdSchema = z.object({ studentId: requiredText });

export const lessonIdSchema = z.object({ lessonId: requiredText });

export const settingsSchema = z.object({ maxMistakesPerSession: positiveInt });

export const lessonStatusSchema = z.object({
  lessonId: requiredText,
  status: z.enum(['cancelled', 'completed', 'scheduled']),
});

const subacStudentIdsSchema = z
  .array(requiredText)
  .transform((ids) => Array.from(new Set(ids)))
  .refine((ids) => ids.length >= 2, {
    message: 'Select at least two students',
  });

const subacSessionSchema = z.object({
  maxMistakes: positiveInt,
  portionLabel: requiredText,
});

const lessonScheduleSchema = z.object({
  maxMistakes: positiveInt,
  scheduledAt: requiredText,
  studentId: requiredText,
});

export type AssignmentColumns = {
  assignment_type: 'lesson' | 'revision';
  lesson_ayah_from: null | number;
  lesson_ayah_to: null | number;
  lesson_surah_number: null | number;
  revision_hizb_from: null | number;
  revision_hizb_to: null | number;
  revision_juz_from: null | number;
  revision_juz_to: null | number;
  revision_mode: null | 'hizb' | 'juz' | 'surah_range';
  revision_surah_from: null | number;
  revision_surah_to: null | number;
};

const EMPTY_ASSIGNMENT: AssignmentColumns = {
  assignment_type: 'lesson',
  lesson_ayah_from: null,
  lesson_ayah_to: null,
  lesson_surah_number: null,
  revision_hizb_from: null,
  revision_hizb_to: null,
  revision_juz_from: null,
  revision_juz_to: null,
  revision_mode: null,
  revision_surah_from: null,
  revision_surah_to: null,
};

const assignmentSchema = z
  .discriminatedUnion('assignmentType', [
    z.object({
      assignmentType: z.literal('lesson'),
      lessonAyahFrom: optionalInt(1, LARGEST_SURAH_AYAH_COUNT),
      lessonAyahTo: optionalInt(1, LARGEST_SURAH_AYAH_COUNT),
      lessonSurahNumber: requiredInt(1, 114),
    }),
    z.object({
      assignmentType: z.literal('revision'),
      revisionHizbFrom: optionalInt(1, 60),
      revisionHizbTo: optionalInt(1, 60),
      revisionJuzFrom: optionalInt(1, 30),
      revisionJuzTo: optionalInt(1, 30),
      revisionMode: z.enum(['hizb', 'juz', 'surah_range']),
      revisionSurahFrom: optionalInt(1, 114),
      revisionSurahTo: optionalInt(1, 114),
    }),
  ])
  .superRefine((value, ctx) => {
    if (value.assignmentType === 'lesson') {
      refineLesson(value, ctx);
    } else {
      refineRevision(value, ctx);
    }
  })
  .transform<AssignmentColumns>((value) =>
    value.assignmentType === 'lesson'
      ? {
          ...EMPTY_ASSIGNMENT,
          assignment_type: 'lesson',
          lesson_ayah_from: value.lessonAyahFrom,
          lesson_ayah_to: value.lessonAyahTo,
          lesson_surah_number: value.lessonSurahNumber,
        }
      : {
          ...EMPTY_ASSIGNMENT,
          assignment_type: 'revision',
          revision_hizb_from: value.revisionHizbFrom,
          revision_hizb_to: value.revisionHizbTo,
          revision_juz_from: value.revisionJuzFrom,
          revision_juz_to: value.revisionJuzTo,
          revision_mode: value.revisionMode,
          revision_surah_from: value.revisionSurahFrom,
          revision_surah_to: value.revisionSurahTo,
        },
  );

type LessonInput = {
  lessonAyahFrom: null | number;
  lessonAyahTo: null | number;
  lessonSurahNumber: number;
};

function refineLesson(value: LessonInput, ctx: z.RefinementCtx): void {
  const surah = getSurah(value.lessonSurahNumber);

  if (!surah) {
    ctx.addIssue({ code: 'custom', message: 'Invalid surah' });
    return;
  }

  for (const ayah of [value.lessonAyahFrom, value.lessonAyahTo]) {
    if (ayah !== null && ayah > surah.ayahCount) {
      ctx.addIssue({
        code: 'custom',
        message: `Ayah must be between 1 and ${surah.ayahCount}`,
      });
    }
  }

  rangeIssue(value.lessonAyahFrom, value.lessonAyahTo, 'Ayah range', ctx);
}

type RevisionInput = {
  revisionHizbFrom: null | number;
  revisionHizbTo: null | number;
  revisionJuzFrom: null | number;
  revisionJuzTo: null | number;
  revisionMode: 'hizb' | 'juz' | 'surah_range';
  revisionSurahFrom: null | number;
  revisionSurahTo: null | number;
};

function refineRevision(value: RevisionInput, ctx: z.RefinementCtx): void {
  const ranges = {
    hizb: {
      from: value.revisionHizbFrom,
      label: 'Hizb range',
      to: value.revisionHizbTo,
    },
    juz: {
      from: value.revisionJuzFrom,
      label: 'Juz range',
      to: value.revisionJuzTo,
    },
    surah_range: {
      from: value.revisionSurahFrom,
      label: 'Surah range',
      to: value.revisionSurahTo,
    },
  };
  const active = ranges[value.revisionMode];

  if (active.from === null) {
    ctx.addIssue({
      code: 'custom',
      message: `${active.label} start is required`,
    });
    return;
  }

  rangeIssue(active.from, active.to, active.label, ctx);
}

function rangeIssue(
  from: null | number,
  to: null | number,
  label: string,
  ctx: z.RefinementCtx,
): void {
  if (from !== null && to !== null && from > to) {
    ctx.addIssue({
      code: 'custom',
      message: `${label} start must be before the end`,
    });
  }
}

/** Validates a whole form payload against a schema. */
export function parseForm<Output>(
  formData: FormData,
  schema: z.ZodType<Output>,
): Output {
  return schema.parse(Object.fromEntries(formData));
}

export type CreateLessonInput = z.infer<typeof lessonScheduleSchema> & {
  assignment: AssignmentColumns;
};

/** Parses the combined schedule + assignment payload for a new lesson. */
export function parseCreateLesson(formData: FormData): CreateLessonInput {
  const data = Object.fromEntries(formData);
  return {
    ...lessonScheduleSchema.parse(data),
    assignment: assignmentSchema.parse(data),
  };
}

export type CreateSubacInput = z.infer<typeof subacSessionSchema> & {
  studentIds: string[];
};

/** Parses the Subac start payload with its multi-value student list. */
export function parseCreateSubac(formData: FormData): CreateSubacInput {
  return {
    ...subacSessionSchema.parse(Object.fromEntries(formData)),
    studentIds: subacStudentIdsSchema.parse(formData.getAll('studentIds')),
  };
}
