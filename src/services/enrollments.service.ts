import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Enrollment = Database['public']['Tables']['enrollments']['Row'];
type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert'];
type EnrollmentUpdate = Database['public']['Tables']['enrollments']['Update'];

export const enrollmentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          dni
        ),
        subjects (
          id,
          name,
          semester,
          year
        )
      `)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          dni
        ),
        subjects (
          id,
          name,
          semester,
          year
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(enrollment: EnrollmentInsert) {
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('capacity, current_enrollment')
      .eq('id', enrollment.subject_id)
      .maybeSingle();

    if (subjectError) throw subjectError;
    if (!subject) throw new Error('Materia no encontrada');

    if (subject.current_enrollment >= subject.capacity) {
      throw new Error('La materia ha alcanzado su capacidad máxima');
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert(enrollment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, enrollment: EnrollmentUpdate) {
    const { data, error } = await supabase
      .from('enrollments')
      .update(enrollment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getActiveEnrollments() {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          dni
        ),
        subjects (
          id,
          name,
          semester,
          year
        )
      `)
      .eq('status', 'active')
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async changeStatus(id: string, status: 'active' | 'completed' | 'dropped') {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
