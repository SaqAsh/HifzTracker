export type Json =
  | boolean
  | null
  | number
  | string
  | { [key: string]: Json | undefined }
  | Json[];

export type StudentStatus = 'active' | 'inactive' | 'paused';
export type LessonStatus = 'cancelled' | 'completed' | 'scheduled';
export type NotificationStatus = 'not_sent' | 'sent';
export type AssignmentType = 'lesson' | 'revision';
export type RevisionMode = 'hizb' | 'juz' | 'surah_range';

export type Database = {
  public: {
    Tables: {
      settings: {
        Row: {
          created_at: string;
          id: string;
          max_mistakes_per_session: number;
          teacher_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          max_mistakes_per_session?: number;
          teacher_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          max_mistakes_per_session?: number;
          teacher_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subac_sessions: {
        Row: {
          created_at: string;
          current_rotation_position: number;
          ended_at: null | string;
          id: string;
          max_mistakes_snapshot: number;
          mistake_count: number;
          portion_label: string;
          started_at: string;
          teacher_id: string;
        };
        Insert: {
          created_at?: string;
          current_rotation_position?: number;
          ended_at?: null | string;
          id?: string;
          max_mistakes_snapshot?: number;
          mistake_count?: number;
          portion_label: string;
          started_at?: string;
          teacher_id: string;
        };
        Update: {
          created_at?: string;
          current_rotation_position?: number;
          ended_at?: null | string;
          id?: string;
          max_mistakes_snapshot?: number;
          mistake_count?: number;
          portion_label?: string;
          started_at?: string;
          teacher_id?: string;
        };
        Relationships: [];
      };
      subac_participants: {
        Row: {
          created_at: string;
          id: string;
          mistake_count: number;
          position: number;
          student_id: string;
          subac_session_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          mistake_count?: number;
          position: number;
          student_id: string;
          subac_session_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          mistake_count?: number;
          position?: number;
          student_id?: string;
          subac_session_id?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
          notes: null | string;
          phone: null | string;
          start_date: string;
          status: StudentStatus;
          teacher_id: string;
          user_id: null | string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          name: string;
          notes?: null | string;
          phone?: null | string;
          start_date?: string;
          status?: StudentStatus;
          teacher_id: string;
          user_id?: null | string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          notes?: null | string;
          phone?: null | string;
          start_date?: string;
          status?: StudentStatus;
          teacher_id?: string;
          user_id?: null | string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          assignment_type: AssignmentType;
          created_at: string;
          id: string;
          lesson_ayah_from: null | number;
          lesson_ayah_to: null | number;
          lesson_surah_number: null | number;
          max_mistakes: number;
          notification_status: NotificationStatus;
          revision_hizb_from: null | number;
          revision_hizb_to: null | number;
          revision_juz_from: null | number;
          revision_juz_to: null | number;
          revision_mode: null | RevisionMode;
          revision_surah_from: null | number;
          revision_surah_to: null | number;
          scheduled_at: string;
          status: LessonStatus;
          student_id: string;
        };
        Insert: {
          assignment_type?: AssignmentType;
          created_at?: string;
          id?: string;
          lesson_ayah_from?: null | number;
          lesson_ayah_to?: null | number;
          lesson_surah_number?: null | number;
          max_mistakes: number;
          notification_status?: NotificationStatus;
          revision_hizb_from?: null | number;
          revision_hizb_to?: null | number;
          revision_juz_from?: null | number;
          revision_juz_to?: null | number;
          revision_mode?: null | RevisionMode;
          revision_surah_from?: null | number;
          revision_surah_to?: null | number;
          scheduled_at: string;
          status?: LessonStatus;
          student_id: string;
        };
        Update: {
          assignment_type?: AssignmentType;
          created_at?: string;
          id?: string;
          lesson_ayah_from?: null | number;
          lesson_ayah_to?: null | number;
          lesson_surah_number?: null | number;
          max_mistakes?: number;
          notification_status?: NotificationStatus;
          revision_hizb_from?: null | number;
          revision_hizb_to?: null | number;
          revision_juz_from?: null | number;
          revision_juz_to?: null | number;
          revision_mode?: null | RevisionMode;
          revision_surah_from?: null | number;
          revision_surah_to?: null | number;
          scheduled_at?: string;
          status?: LessonStatus;
          student_id?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          created_at: string;
          ended_at: null | string;
          id: string;
          lesson_id: null | string;
          max_mistakes_snapshot: number;
          mistake_count: number;
          started_at: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          ended_at?: null | string;
          id?: string;
          lesson_id?: null | string;
          max_mistakes_snapshot: number;
          mistake_count?: number;
          started_at?: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          ended_at?: null | string;
          id?: string;
          lesson_id?: null | string;
          max_mistakes_snapshot?: number;
          mistake_count?: number;
          started_at?: string;
          student_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_teacher: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Settings = Database['public']['Tables']['settings']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type SubacSession =
  Database['public']['Tables']['subac_sessions']['Row'];
export type SubacParticipant =
  Database['public']['Tables']['subac_participants']['Row'];

export type StudentInsert = Database['public']['Tables']['students']['Insert'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];
export type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
export type LessonUpdate = Database['public']['Tables']['lessons']['Update'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type SubacSessionInsert =
  Database['public']['Tables']['subac_sessions']['Insert'];
export type SubacParticipantInsert =
  Database['public']['Tables']['subac_participants']['Insert'];
