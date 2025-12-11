import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type SubjectPrerequisite = Database['public']['Tables']['subject_prerequisites']['Row'];
type SubjectPrerequisiteInsert = Database['public']['Tables']['subject_prerequisites']['Insert'];

export const prerequisitesService = {
  /**
   * Obtener todas las correlatividades del sistema
   */
  async getAll(): Promise<SubjectPrerequisite[]> {
    const { data, error } = await supabase
      .from('subject_prerequisites')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener correlatividades de una materia específica
   * @param subjectId - ID de la materia
   * @returns Lista de IDs de materias que son prerequisitos
   */
  async getBySubject(subjectId: string): Promise<SubjectPrerequisite[]> {
    const { data, error } = await supabase
      .from('subject_prerequisites')
      .select('*')
      .eq('subject_id', subjectId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener materias que requieren una materia específica como prerequisito
   * @param prerequisiteId - ID de la materia prerequisito
   * @returns Lista de materias que requieren este prerequisito
   */
  async getSubjectsThatRequire(prerequisiteId: string): Promise<SubjectPrerequisite[]> {
    const { data, error } = await supabase
      .from('subject_prerequisites')
      .select('*')
      .eq('prerequisite_subject_id', prerequisiteId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Crear una nueva correlatividad
   * @param subjectId - ID de la materia que requiere el prerequisito
   * @param prerequisiteId - ID de la materia prerequisito
   */
  async create(subjectId: string, prerequisiteId: string): Promise<SubjectPrerequisite> {
    const prerequisite: SubjectPrerequisiteInsert = {
      subject_id: subjectId,
      prerequisite_subject_id: prerequisiteId
    };

    const { data, error } = await supabase
      .from('subject_prerequisites')
      .insert(prerequisite)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar una correlatividad
   * @param id - ID de la correlatividad
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subject_prerequisites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Eliminar todas las correlatividades de una materia
   * @param subjectId - ID de la materia
   */
  async deleteBySubject(subjectId: string): Promise<void> {
    const { error } = await supabase
      .from('subject_prerequisites')
      .delete()
      .eq('subject_id', subjectId);

    if (error) throw error;
  }
};
