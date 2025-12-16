import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export const studentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        careers:current_career_id (
          id,
          title
        )
      `)
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        careers:current_career_id (
          id,
          title
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(student: StudentInsert) {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, student: StudentUpdate) {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCareerHistory(studentId: string) {
    const { data, error } = await supabase
      .from('career_history')
      .select(`
        *,
        careers (
          id,
          title
        )
      `)
      .eq('student_id', studentId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getEnrollments(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        subjects (
          id,
          name,
          semester,
          year
        )
      `)
      .eq('student_id', studentId)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async search(query: string, careerId?: string) {
    let queryBuilder = supabase
      .from('students')
      .select(`
        *,
        careers:current_career_id (
          id,
          title
        )
      `)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,dni.ilike.%${query}%`)
      .order('last_name', { ascending: true })
      .limit(20);

    if (careerId) {
      queryBuilder = queryBuilder.eq('current_career_id', careerId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data;
  }
};
