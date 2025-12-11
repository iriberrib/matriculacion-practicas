export type Json =
  | string
  | number
  | boolean
  | null
  | { [key]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          dni: string
          birth_date: string
          current_career_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          dni: string
          birth_date: string
          current_career_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          dni?: string
          birth_date?: string
          current_career_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          semester: number
          year: number
          capacity: number
          current_enrollment: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          semester: number
          year: number
          capacity: number
          current_enrollment?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          semester?: number
          year?: number
          capacity?: number
          current_enrollment?: number
          created_at?: string
          updated_at?: string
        }
      }
      careers: {
        Row: {
          id: string
          title: string
          total_semesters: number
          total_years: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          total_semesters: number
          total_years: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          total_semesters?: number
          total_years?: number
          created_at?: string
          updated_at?: string
        }
      }
      career_subjects: {
        Row: {
          id: string
          career_id: string
          subject_id: string
          year: number
          semester: number
          created_at: string
        }
        Insert: {
          id?: string
          career_id: string
          subject_id: string
          year: number
          semester: number
          created_at?: string
        }
        Update: {
          id?: string
          career_id?: string
          subject_id?: string
          year?: number
          semester?: number
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          enrollment_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          enrollment_date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          enrollment_date?: string
          status?: string
          created_at?: string
        }
      }
      career_history: {
        Row: {
          id: string
          student_id: string
          career_id: string
          start_date: string
          end_date: string | null
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          career_id: string
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          career_id?: string
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          created_at?: string
        }
      }
      deleted_ids_log: {
        Row: {
          id: string
          entity_type: string
          deleted_id: string
          deleted_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          deleted_id: string
          deleted_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          deleted_id?: string
          deleted_at?: string
        }
      }
      subject_prerequisites: {
        Row: {
          id: string
          subject_id: string
          prerequisite_subject_id: string
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          prerequisite_subject_id: string
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          prerequisite_subject_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
