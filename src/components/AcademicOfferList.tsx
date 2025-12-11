import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { enrollmentEligibilityService, type SubjectEligibility } from '../services/enrollment-eligibility.service';
import { enrollmentsService } from '../services/enrollments.service';
import { SubjectEligibilityBadge } from './SubjectEligibilityBadge';
import type { Database } from '../lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];

interface AcademicOfferListProps {
  studentId: string;
  careerId: string;
  onEnrollmentComplete?: () => void;
}

interface SubjectsByYear {
  [year: number]: {
    [semester: number]: Array<Subject & { eligibility: SubjectEligibility }>;
  };
}

export function AcademicOfferList({
  studentId,
  careerId,
  onEnrollmentComplete
}: AcademicOfferListProps) {
  const [loading, setLoading] = useState(true);
  const [subjectsByYear, setSubjectsByYear] = useState<SubjectsByYear>({});
  const [eligibilityMap, setEligibilityMap] = useState<Map<string, SubjectEligibility>>(new Map());
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([1]));
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [studentId, careerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener elegibilidad de todas las materias
      const eligibility = await enrollmentEligibilityService.getEligibilityForStudent(
        studentId,
        careerId
      );

      setEligibilityMap(eligibility);

      // Organizar materias por año y cuatrimestre
      const organized: SubjectsByYear = {};

      eligibility.forEach((elig) => {
        // Necesitamos obtener la información completa de la materia
        // La eligibilidad ya tiene la info básica, pero necesitamos year y semester
        // Esto se puede mejorar agregando year y semester a SubjectEligibility
        // Por ahora, haremos una consulta adicional
      });

      // Alternativa: reorganizar después de obtener las materias
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

      // Organizar por año y cuatrimestre
      subjects.forEach((subject) => {
        const elig = eligibility.get(subject.id);
        if (!elig) return;

        if (!organized[subject.year]) {
          organized[subject.year] = {};
        }
        if (!organized[subject.year][subject.semester]) {
          organized[subject.year][subject.semester] = [];
        }

        organized[subject.year][subject.semester].push({
          ...subject,
          eligibility: elig
        });
      });

      setSubjectsByYear(organized);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar las materias');
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleSubjectSelection = (subjectId: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjects(newSelected);
  };

  const handleBulkEnrollment = async () => {
    if (selectedSubjects.size === 0) {
      alert('Selecciona al menos una materia');
      return;
    }

    if (!confirm(`¿Deseas inscribirte a ${selectedSubjects.size} materia(s)?`)) {
      return;
    }

    try {
      setEnrolling(true);
      setError(null);

      const selectedArray = Array.from(selectedSubjects);

      // Validar elegibilidad de todas las materias seleccionadas
      const validations = await Promise.all(
        selectedArray.map(id =>
          enrollmentEligibilityService.canEnrollInSubject(studentId, id)
        )
      );

      // Filtrar solo las materias válidas
      const validSubjects = selectedArray.filter((_, i) => validations[i]);
      const invalidSubjects = selectedArray.filter((_, i) => !validations[i]);

      if (invalidSubjects.length > 0) {
        const invalidNames = invalidSubjects
          .map(id => eligibilityMap.get(id)?.subjectName)
          .filter(Boolean)
          .join(', ');

        alert(`No se puede inscribir a: ${invalidNames}\nVerifica los prerequisitos y cupos.`);
      }

      if (validSubjects.length === 0) {
        setEnrolling(false);
        return;
      }

      // Inscribir en lote
      const results = await Promise.allSettled(
        validSubjects.map(subjectId =>
          enrollmentsService.create({
            student_id: studentId,
            subject_id: subjectId,
            status: 'active'
          })
        )
      );

      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected');

      if (failures.length > 0) {
        console.error('Enrollment failures:', failures);
      }

      alert(`Inscripción completada:\n✓ ${successes} materia(s) inscripta(s)\n✗ ${failures.length} fallida(s)`);

      // Limpiar selección y recargar
      setSelectedSubjects(new Set());
      await loadData();

      if (onEnrollmentComplete) {
        onEnrollmentComplete();
      }
    } catch (err) {
      console.error('Error in bulk enrollment:', err);
      setError('Error al inscribir materias');
    } finally {
      setEnrolling(false);
    }
  };

  const canSelectSubject = (eligibility: SubjectEligibility): boolean => {
    return eligibility.status === 'AVAILABLE' && eligibility.hasCapacity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando oferta académica...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadData}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const years = Object.keys(subjectsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Header con contador de seleccionadas */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Oferta Académica
          </h3>
          <p className="text-sm text-gray-600">
            Selecciona las materias para inscribirte
          </p>
        </div>
        {selectedSubjects.size > 0 && (
          <button
            onClick={handleBulkEnrollment}
            disabled={enrolling}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscribiendo...
              </>
            ) : (
              <>
                <CheckSquare className="w-5 h-5" />
                Inscribir Seleccionadas ({selectedSubjects.size})
              </>
            )}
          </button>
        )}
      </div>

      {/* Materias organizadas por año */}
      <div className="space-y-3">
        {years.map((year) => {
          const isExpanded = expandedYears.has(year);
          const semesters = Object.keys(subjectsByYear[year])
            .map(Number)
            .sort((a, b) => a - b);

          return (
            <div
              key={year}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header del año */}
              <button
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-gray-800">
                  {year}º Año
                </h4>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Contenido del año */}
              {isExpanded && (
                <div className="p-4 pt-0 space-y-4">
                  {semesters.map((semester) => {
                    const subjects = subjectsByYear[year][semester];

                    return (
                      <div key={semester} className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                          {semester === 1 ? 'Primer' : 'Segundo'} Cuatrimestre
                        </h5>

                        <div className="space-y-2">
                          {subjects.map((subject) => {
                            const isSelected = selectedSubjects.has(subject.id);
                            const canSelect = canSelectSubject(subject.eligibility);

                            return (
                              <div
                                key={subject.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                                  } ${!canSelect ? 'opacity-75' : ''}`}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleSubjectSelection(subject.id)}
                                  disabled={!canSelect}
                                  className="flex-shrink-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <Square
                                      className={`w-5 h-5 ${canSelect
                                        ? 'text-gray-400 hover:text-gray-600'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                  )}
                                </button>

                                {/* Nombre de la materia */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {subject.name}
                                  </p>
                                </div>

                                {/* Badge de estado */}
                                <SubjectEligibilityBadge
                                  status={subject.eligibility.status}
                                  missingPrerequisites={subject.eligibility.missingPrerequisites}
                                  availableSpots={subject.eligibility.availableSpots}
                                  capacity={subject.eligibility.capacity}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {years.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay materias disponibles para esta carrera
        </div>
      )}
    </div>
  );
}
