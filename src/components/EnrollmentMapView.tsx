import { useState, useEffect } from 'react';
import { Map, List, Users, GraduationCap, AlertCircle } from 'lucide-react';
import { CorrelativitiesMap } from './CorrelativitiesMap';
import { EnrollmentListView } from './EnrollmentListView';
import { studentsService } from '../services/students.service';
import { careersService } from '../services/careers.service';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type Career = Database['public']['Tables']['careers']['Row'];

export function EnrollmentMapView() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [students, setStudents] = useState<Student[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, careersData] = await Promise.all([
        studentsService.getAll(),
        careersService.getAll()
      ]);
      setStudents(studentsData || []);
      setCareers(careersData || []);

      // Auto-select first student and their career if available
      if (studentsData && studentsData.length > 0) {
        const firstStudent = studentsData[0];
        setSelectedStudent(firstStudent.id);
        if (firstStudent.current_career_id) {
          setSelectedCareer(firstStudent.current_career_id);
        } else if (careersData && careersData.length > 0) {
          setSelectedCareer(careersData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    const student = students.find(s => s.id === studentId);
    // Auto-select student's current career if they have one
    if (student?.current_career_id) {
      setSelectedCareer(student.current_career_id);
    } else {
      // Clear career selection if student has no career
      setSelectedCareer('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Mapa de Correlatividades
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'map'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Map className="w-5 h-5" />
            Vista Mapa
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'list'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <List className="w-5 h-5" />
            Vista Lista
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Estudiante
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - DNI: {student.dni}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Carrera
            </label>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar carrera</option>
              {careers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warning if student has no career */}
        {selectedStudent && !students.find(s => s.id === selectedStudent)?.current_career_id && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                El estudiante seleccionado no está inscripto en ninguna carrera
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Para ver el mapa de correlatividades, primero asigna una carrera al estudiante en la sección "Estudiantes".
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        selectedStudent && selectedCareer ? (
          <CorrelativitiesMap
            studentId={selectedStudent}
            careerId={selectedCareer}
            onEnroll={loadData}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {selectedStudent && !selectedCareer
                ? 'El estudiante no tiene una carrera asignada'
                : 'Selecciona un estudiante para ver el mapa de correlatividades'
              }
            </p>
            {selectedStudent && !selectedCareer && (
              <p className="text-gray-500 text-sm mt-2">
                Asigna una carrera al estudiante en la sección "Estudiantes"
              </p>
            )}
          </div>
        )
      ) : (
        selectedStudent && selectedCareer ? (
          <EnrollmentListView
            studentId={selectedStudent}
            careerId={selectedCareer}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {selectedStudent && !selectedCareer
                ? 'El estudiante no tiene una carrera asignada'
                : 'Selecciona un estudiante para ver sus inscripciones'
              }
            </p>
            {selectedStudent && !selectedCareer && (
              <p className="text-gray-500 text-sm mt-2">
                Asigna una carrera al estudiante en la sección "Estudiantes"
              </p>
            )}
          </div>
        )
      )}

      {/* Instructions */}
      {viewMode === 'map' && selectedStudent && selectedCareer && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">
            💡 Cómo usar el mapa
          </h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• <strong>Verde:</strong> Materias aprobadas</li>
            <li>• <strong>Amarillo:</strong> Materias que estás cursando actualmente</li>
            <li>• <strong>Azul:</strong> Materias disponibles para inscribirse (haz click para inscribirte)</li>
            <li>• <strong>Gris:</strong> Materias bloqueadas (requieren aprobar correlativas)</li>
            <li>• Las <strong>flechas verdes</strong> indican que la correlativa está aprobada</li>
          </ul>
        </div>
      )}
    </div>
  );
}
