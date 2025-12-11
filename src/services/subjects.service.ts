import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

export const subjectsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('year', { ascending: true })
      .order('semester', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(subject: SubjectInsert) {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, subject: SubjectUpdate) {
    const { data, error } = await supabase
      .from('subjects')
      .update(subject)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getEnrollments(subjectId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          dni
        )
      `)
      .eq('subject_id', subjectId)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAvailableSpots(subjectId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('capacity, current_enrollment')
      .eq('id', subjectId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return 0;

    return data.capacity - data.current_enrollment;
  }
};
