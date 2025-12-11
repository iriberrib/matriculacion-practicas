import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { prerequisitesService } from './prerequisites.service';

type Subject = Database['public']['Tables']['subjects']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export type SubjectNodeState = 'LOCKED' | 'AVAILABLE' | 'ENROLLED' | 'COMPLETED';

export interface SubjectNode {
  id: string;
  name: string;
  year: number;
  semester: number;
  state: SubjectNodeState;
  capacity: number;
  current_enrollment: number;
  prerequisites: string[]; // IDs of prerequisite subjects
}

export interface SubjectEdge {
  id: string;
  source: string; // prerequisite_subject_id
  target: string; // subject_id
  isEnabled: boolean; // true if prerequisite is completed
}

export interface CorrelativitiesGraph {
  nodes: SubjectNode[];
  edges: SubjectEdge[];
}

export const correlativitiesService = {
  /**
   * Obtener el grafo completo de correlatividades para un estudiante en una carrera
   * @param studentId - ID del estudiante
   * @param careerId - ID de la carrera
   * @returns Grafo con nodos (materias) y edges (correlatividades)
   */
  async getGraphForStudent(studentId: string, careerId: string): Promise<CorrelativitiesGraph> {
    try {
      // 1. Obtener todas las materias de la carrera
      const { data: careerSubjects, error: careerError } = await supabase
        .from('career_subjects')
        .select(`
          subject_id,
          subjects (
            id,
            name,
            year,
            semester,
            capacity,
            current_enrollment
          )
        `)
        .eq('career_id', careerId);

      if (careerError) throw careerError;

      // Type assertion for the nested query result
      type CareerSubjectRow = {
        subject_id: string;
        subjects: Subject | null;
      };

      const subjects = ((careerSubjects as unknown as CareerSubjectRow[]) || [])
        .map(cs => cs.subjects)
        .filter((s): s is Subject => s !== null);

      // 2. Obtener todas las correlatividades
      const allPrerequisites = await prerequisitesService.getAll();

      // Filtrar solo las correlatividades que pertenecen a materias de esta carrera
      const subjectIds = new Set(subjects.map(s => s.id));
      const prerequisites = allPrerequisites.filter(
        p => subjectIds.has(p.subject_id) && subjectIds.has(p.prerequisite_subject_id)
      );

      // 3. Obtener inscripciones del estudiante
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId);

      if (enrollmentsError) throw enrollmentsError;

      // Crear mapa de inscripciones por materia
      const enrollmentMap = new Map<string, Enrollment>();
      (enrollments || []).forEach(e => {
        enrollmentMap.set(e.subject_id, e);
      });

      // Crear mapa de prerequisitos por materia
      const prerequisiteMap = new Map<string, string[]>();
      prerequisites.forEach(p => {
        if (!prerequisiteMap.has(p.subject_id)) {
          prerequisiteMap.set(p.subject_id, []);
        }
        prerequisiteMap.get(p.subject_id)!.push(p.prerequisite_subject_id);
      });

      // 4. Calcular estado de cada nodo
      const nodes: SubjectNode[] = subjects.map(subject => {
        const enrollment = enrollmentMap.get(subject.id);
        const subjectPrereqs = prerequisiteMap.get(subject.id) || [];
        
        const state = this.calculateNodeState(
          enrollment,
          subjectPrereqs,
          enrollmentMap
        );

        return {
          id: subject.id,
          name: subject.name,
          year: subject.year,
          semester: subject.semester,
          state,
          capacity: subject.capacity,
          current_enrollment: subject.current_enrollment,
          prerequisites: subjectPrereqs
        };
      });

      // 5. Crear edges con información de si están habilitados
      const edges: SubjectEdge[] = prerequisites.map(p => {
        const prerequisiteEnrollment = enrollmentMap.get(p.prerequisite_subject_id);
        const isEnabled = prerequisiteEnrollment?.status === 'completed';

        return {
          id: p.id,
          source: p.prerequisite_subject_id,
          target: p.subject_id,
          isEnabled
        };
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Error loading correlativities graph:', error);
      throw error;
    }
  },

  /**
   * Calcular el estado visual de un nodo (materia)
   * @param enrollment - Inscripción del estudiante a esta materia (si existe)
   * @param prerequisites - IDs de materias prerequisito
   * @param enrollmentMap - Mapa de todas las inscripciones del estudiante
   * @returns Estado del nodo
   */
  calculateNodeState(
    enrollment: Enrollment | undefined,
    prerequisites: string[],
    enrollmentMap: Map<string, Enrollment>
  ): SubjectNodeState {
    // Si el estudiante ya completó la materia
    if (enrollment?.status === 'completed') {
      return 'COMPLETED';
    }

    // Si el estudiante está cursando actualmente
    if (enrollment?.status === 'active') {
      return 'ENROLLED';
    }

    // Verificar si todas las correlativas están aprobadas
    const allPrerequisitesCompleted = prerequisites.every(prereqId => {
      const prereqEnrollment = enrollmentMap.get(prereqId);
      return prereqEnrollment?.status === 'completed';
    });

    // Si todas las correlativas están aprobadas, la materia está disponible
    if (allPrerequisitesCompleted) {
      return 'AVAILABLE';
    }

    // Si faltan correlativas, la materia está bloqueada
    return 'LOCKED';
  },

  /**
   * Verificar si un estudiante puede inscribirse a una materia
   * @param studentId - ID del estudiante
   * @param subjectId - ID de la materia
   * @returns true si puede inscribirse, false si no
   */
  async canEnroll(studentId: string, subjectId: string): Promise<boolean> {
    try {
      // Obtener prerequisitos de la materia
      const prerequisites = await prerequisitesService.getBySubject(subjectId);
      
      if (prerequisites.length === 0) {
        return true; // No tiene prerequisitos
      }

      // Obtener inscripciones del estudiante
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;

      const enrollmentMap = new Map<string, Enrollment>();
      (enrollments || []).forEach(e => {
        enrollmentMap.set(e.subject_id, e);
      });

      // Verificar que todas las correlativas estén completadas
      return prerequisites.every(p => {
        const enrollment = enrollmentMap.get(p.prerequisite_subject_id);
        return enrollment?.status === 'completed';
      });
    } catch (error) {
      console.error('Error checking enrollment eligibility:', error);
      return false;
    }
  }
};
