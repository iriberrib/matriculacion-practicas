import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { prerequisitesService } from './prerequisites.service';

type Subject = Database['public']['Tables']['subjects']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export type SubjectEligibilityStatus = 
  | 'ALREADY_PASSED'      // Verde - Materia aprobada
  | 'CURRENTLY_ENROLLED'  // Azul - Cursando actualmente
  | 'LOCKED'              // Gris/Rojo - No cumple prerequisitos
  | 'AVAILABLE';          // Blanco - Disponible para inscribirse

export interface SubjectEligibility {
  subjectId: string;
  subjectName: string;
  status: SubjectEligibilityStatus;
  missingPrerequisites: Subject[]; // Materias faltantes
  hasCapacity: boolean;
  availableSpots: number;
  currentEnrollment: number;
  capacity: number;
}

export const enrollmentEligibilityService = {
  /**
   * Obtener elegibilidad de todas las materias para un estudiante en una carrera
   * @param studentId - ID del estudiante
   * @param careerId - ID de la carrera
   * @returns Mapa de elegibilidad por materia
   */
  async getEligibilityForStudent(
    studentId: string, 
    careerId: string
  ): Promise<Map<string, SubjectEligibility>> {
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

      type CareerSubjectRow = {
        subject_id: string;
        subjects: Subject | null;
      };

      const subjects = ((careerSubjects as unknown as CareerSubjectRow[]) || [])
        .map(cs => cs.subjects)
        .filter((s): s is Subject => s !== null);

      // 2. Obtener todos los prerequisitos
      const allPrerequisites = await prerequisitesService.getAll();

      // Filtrar prerequisitos de esta carrera
      const subjectIds = new Set(subjects.map(s => s.id));
      const prerequisites = allPrerequisites.filter(
        p => subjectIds.has(p.subject_id) && subjectIds.has(p.prerequisite_subject_id)
      );

      // 3. Obtener historial del estudiante
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

      // Crear mapa de materias por ID para búsqueda rápida
      const subjectMap = new Map<string, Subject>();
      subjects.forEach(s => subjectMap.set(s.id, s));

      // 4. Calcular elegibilidad de cada materia
      const eligibilityMap = new Map<string, SubjectEligibility>();

      subjects.forEach(subject => {
        const enrollment = enrollmentMap.get(subject.id);
        const prereqIds = prerequisiteMap.get(subject.id) || [];
        
        // Determinar estado
        let status: SubjectEligibilityStatus;
        let missingPrerequisites: Subject[] = [];

        if (enrollment?.status === 'completed') {
          status = 'ALREADY_PASSED';
        } else if (enrollment?.status === 'active') {
          status = 'CURRENTLY_ENROLLED';
        } else {
          // Verificar prerequisitos
          const missingPrereqIds = prereqIds.filter(prereqId => {
            const prereqEnrollment = enrollmentMap.get(prereqId);
            return prereqEnrollment?.status !== 'completed';
          });

          if (missingPrereqIds.length > 0) {
            status = 'LOCKED';
            missingPrerequisites = missingPrereqIds
              .map(id => subjectMap.get(id))
              .filter((s): s is Subject => s !== undefined);
          } else {
            status = 'AVAILABLE';
          }
        }

        // Verificar capacidad
        const hasCapacity = subject.current_enrollment < subject.capacity;
        const availableSpots = subject.capacity - subject.current_enrollment;

        eligibilityMap.set(subject.id, {
          subjectId: subject.id,
          subjectName: subject.name,
          status,
          missingPrerequisites,
          hasCapacity,
          availableSpots,
          currentEnrollment: subject.current_enrollment,
          capacity: subject.capacity
        });
      });

      return eligibilityMap;
    } catch (error) {
      console.error('Error getting eligibility:', error);
      throw error;
    }
  },

  /**
   * Validar si un estudiante puede inscribirse a una materia específica
   * @param studentId - ID del estudiante
   * @param subjectId - ID de la materia
   * @returns true si puede inscribirse, false si no
   */
  async canEnrollInSubject(studentId: string, subjectId: string): Promise<boolean> {
    try {
      // 1. Verificar que no esté ya inscripto o aprobado
      const { data: existingEnrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject_id', subjectId)
        .maybeSingle();

      if (enrollmentError) throw enrollmentError;

      if (existingEnrollment) {
        return false; // Ya está inscripto o aprobó
      }

      // 2. Verificar prerequisitos
      const prerequisites = await prerequisitesService.getBySubject(subjectId);
      
      if (prerequisites.length > 0) {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', studentId);

        if (enrollmentsError) throw enrollmentsError;

        const enrollmentMap = new Map<string, Enrollment>();
        (enrollments || []).forEach(e => {
          enrollmentMap.set(e.subject_id, e);
        });

        // Verificar que todos los prerequisitos estén completados
        const allPrerequisitesMet = prerequisites.every(p => {
          const enrollment = enrollmentMap.get(p.prerequisite_subject_id);
          return enrollment?.status === 'completed';
        });

        if (!allPrerequisitesMet) {
          return false;
        }
      }

      // 3. Verificar capacidad
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('capacity, current_enrollment')
        .eq('id', subjectId)
        .maybeSingle();

      if (subjectError) throw subjectError;
      if (!subject) return false;

      if (subject.current_enrollment >= subject.capacity) {
        return false; // Sin cupo
      }

      return true;
    } catch (error) {
      console.error('Error checking enrollment eligibility:', error);
      return false;
    }
  },

  /**
   * Obtener prerequisitos faltantes para una materia
   * @param studentId - ID del estudiante
   * @param subjectId - ID de la materia
   * @returns Lista de materias prerequisito que faltan aprobar
   */
  async getMissingPrerequisites(studentId: string, subjectId: string): Promise<Subject[]> {
    try {
      // 1. Obtener prerequisitos de la materia
      const prerequisites = await prerequisitesService.getBySubject(subjectId);
      
      if (prerequisites.length === 0) {
        return [];
      }

      // 2. Obtener inscripciones del estudiante
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;

      const enrollmentMap = new Map<string, Enrollment>();
      (enrollments || []).forEach(e => {
        enrollmentMap.set(e.subject_id, e);
      });

      // 3. Filtrar prerequisitos no completados
      const missingPrereqIds = prerequisites
        .filter(p => {
          const enrollment = enrollmentMap.get(p.prerequisite_subject_id);
          return enrollment?.status !== 'completed';
        })
        .map(p => p.prerequisite_subject_id);

      if (missingPrereqIds.length === 0) {
        return [];
      }

      // 4. Obtener información de las materias faltantes
      const { data: missingSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .in('id', missingPrereqIds);

      if (subjectsError) throw subjectsError;

      return missingSubjects || [];
    } catch (error) {
      console.error('Error getting missing prerequisites:', error);
      return [];
    }
  }
};
