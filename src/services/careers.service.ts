import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Career = Database['public']['Tables']['careers']['Row'];
type CareerInsert = Database['public']['Tables']['careers']['Insert'];
type CareerUpdate = Database['public']['Tables']['careers']['Update'];
type CareerSubjectInsert = Database['public']['Tables']['career_subjects']['Insert'];

export const careersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .order('title', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(career: CareerInsert) {
    const { data, error } = await supabase
      .from('careers')
      .insert(career)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, career: CareerUpdate) {
    const { data, error } = await supabase
      .from('careers')
      .update(career)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('careers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getSubjects(careerId: string) {
    const { data, error } = await supabase
      .from('career_subjects')
      .select(`
        *,
        subjects (
          id,
          name,
          semester,
          year,
          capacity,
          current_enrollment
        )
      `)
      .eq('career_id', careerId)
      .order('year', { ascending: true })
      .order('semester', { ascending: true });

    if (error) throw error;
    return data;
  },

  async assignSubject(assignment: CareerSubjectInsert) {
    const { data, error } = await supabase
      .from('career_subjects')
      .insert(assignment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeSubject(careerId: string, subjectId: string) {
    const { error } = await supabase
      .from('career_subjects')
      .delete()
      .eq('career_id', careerId)
      .eq('subject_id', subjectId);

    if (error) throw error;
  },

  async getStudentCount(careerId: string) {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('current_career_id', careerId);

    if (error) throw error;
    return count || 0;
  }
};
