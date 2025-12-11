import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, List, Grid } from 'lucide-react';
import { enrollmentsService } from '../services/enrollments.service';
import { studentsService } from '../services/students.service';
import { subjectsService } from '../services/subjects.service';
import { careersService } from '../services/careers.service';
import { AcademicOfferList } from './AcademicOfferList';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];
type Career = Database['public']['Tables']['careers']['Row'];

export function EnrollmentManager() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'simple' | 'grid'>('simple');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<string>('');

  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [enrollmentsData, studentsData, subjectsData, careersData] = await Promise.all([
        enrollmentsService.getAll(),
        studentsService.getAll(),
        subjectsService.getAll(),
        careersService.getAll()
      ]);
      setEnrollments(enrollmentsData || []);
      setStudents(studentsData || []);
      setSubjects(subjectsData || []);
      setCareers(careersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await enrollmentsService.create(formData);
      await loadData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear inscripción');
    }
  };

  const handleChangeStatus = async (id: string, status: 'active' | 'completed' | 'dropped') => {
    try {
      setError(null);
      await enrollmentsService.changeStatus(id, status);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      subject_id: '',
      status: 'active'
    });
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'dropped':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'dropped':
        return 'Abandonada';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filterStatus === 'all') return true;
    return enrollment.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando inscripciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Inscripciones</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('simple')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'simple'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <List className="w-5 h-5" />
            Vista Simple
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'grid'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Grid className="w-5 h-5" />
            Vista Grid
          </button>
          {viewMode === 'simple' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Inscripción
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Vista Grid - Inscripción por lotes */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {/* Selectores de estudiante y carrera */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estudiante
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(e.target.value);
                    const student = students.find(s => s.id === e.target.value);
                    if (student?.current_career_id) {
                      setSelectedCareer(student.current_career_id);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar estudiante</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.last_name}, {student.first_name} - DNI: {student.dni}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrera
                </label>
                <input
                  type="text"
                  value={selectedCareer ? (careers.find(c => c.id === selectedCareer)?.title || selectedCareer) : ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="Se seleccionará automáticamente"
                />
              </div>
            </div>
          </div>

          {/* Componente de inscripción por lotes */}
          {selectedStudent && selectedCareer ? (
            <AcademicOfferList
              studentId={selectedStudent}
              careerId={selectedCareer}
              onEnrollmentComplete={loadData}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Selecciona un estudiante para ver las materias disponibles
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vista Simple - Formulario tradicional */}
      {viewMode === 'simple' && (
        <>
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Nueva Inscripción</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estudiante
                    </label>
                    <select
                      required
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar estudiante</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.last_name}, {student.first_name} - DNI: {student.dni}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materia
                    </label>
                    <select
                      required
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar materia</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} - {subject.year}° Año, {subject.semester}° Cuatrimestre
                          {subject.current_enrollment >= subject.capacity && ' (COMPLETA)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Inscribir
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                  Completadas
                </button>
                <button
                  onClick={() => setFilterStatus('dropped')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'dropped'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-gray-200'
                    }`}
                >
                  Abandonadas
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Inscripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay inscripciones {filterStatus !== 'all' ? `con estado "${getStatusText(filterStatus)}"` : 'registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.students.last_name}, {enrollment.students.first_name}
                          </div>
                          <div className="text-sm text-gray-500">DNI: {enrollment.students.dni}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.subjects.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrollment.subjects.year}° Año - {enrollment.subjects.semester}° Cuatrimestre
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              enrollment.status
                            )}`}
                          >
                            {getStatusIcon(enrollment.status)}
                            {getStatusText(enrollment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {enrollment.status !== 'active' && (
                              <button
                                onClick={() => handleChangeStatus(enrollment.id, 'active')}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                              >
                                Activar
                              </button>
                            )}
                            {enrollment.status !== 'completed' && (
                              <button
                                onClick={() => handleChangeStatus(enrollment.id, 'completed')}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                              >
                                Completar
                              </button>
                            )}
                            {enrollment.status !== 'dropped' && (
                              <button
                                onClick={() => handleChangeStatus(enrollment.id, 'dropped')}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs"
                              >
                                Abandonar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredEnrollments.length > 0 && (
            <div className="text-sm text-gray-600 text-center">
              Mostrando {filteredEnrollments.length} de {enrollments.length} inscripción
              {enrollments.length !== 1 ? 'es' : ''}
            </div>
          )}
        </>
      )}
    </div>
  );
}
