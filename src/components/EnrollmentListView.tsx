import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { enrollmentsService } from '../services/enrollments.service';
import type { Database } from '../lib/database.types';

type Enrollment = Database['public']['Tables']['enrollments']['Row'];

interface EnrollmentWithSubject extends Enrollment {
  subjects: {
    id: string;
    name: string;
    year: number;
    semester: number;
    capacity: number;
    current_enrollment: number;
  };
}

interface EnrollmentListViewProps {
  studentId: string;
  careerId: string;
}

export function EnrollmentListView({ studentId, careerId }: EnrollmentListViewProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadEnrollments();
  }, [studentId, careerId]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all enrollments for the student with subject details
      const { data, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          subjects (
            id,
            name,
            year,
            semester,
            capacity,
            current_enrollment
          )
        `)
        .eq('student_id', studentId);

      if (enrollmentsError) throw enrollmentsError;

      setEnrollments((data as any) || []);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      setError('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
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
        return 'Cursando';
      case 'completed':
        return 'Aprobada';
      case 'dropped':
        return 'Abandonada';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'dropped':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleChangeStatus = async (enrollmentId: string, newStatus: 'active' | 'completed' | 'dropped') => {
    try {
      await enrollmentsService.changeStatus(enrollmentId, newStatus);
      await loadEnrollments();
    } catch (err) {
      console.error('Error changing status:', err);
      setError('Error al cambiar el estado');
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filterStatus === 'all') return true;
    return enrollment.status === filterStatus;
  });

  // Group by year and semester
  const groupedEnrollments = filteredEnrollments.reduce((acc, enrollment) => {
    const year = enrollment.subjects.year;
    const semester = enrollment.subjects.semester;
    const key = `${year}-${semester}`;

    if (!acc[key]) {
      acc[key] = {
        year,
        semester,
        enrollments: []
      };
    }

    acc[key].enrollments.push(enrollment);
    return acc;
  }, {} as Record<string, { year: number; semester: number; enrollments: EnrollmentWithSubject[] }>);

  const sortedGroups = Object.values(groupedEnrollments).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.semester - b.semester;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando inscripciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todas ({enrollments.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
            >
              Cursando ({enrollments.filter(e => e.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
              Aprobadas ({enrollments.filter(e => e.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('dropped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'dropped'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
            >
              Abandonadas ({enrollments.filter(e => e.status === 'dropped').length})
            </button>
          </div>
        </div>
      </div>

      {/* Enrollments grouped by year and semester */}
      {sortedGroups.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {filterStatus === 'all'
              ? 'No hay inscripciones registradas'
              : `No hay inscripciones con estado "${getStatusText(filterStatus)}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map((group) => (
            <div key={`${group.year}-${group.semester}`} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              {/* Group header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {group.year}º Año - {group.semester === 1 ? 'Primer' : 'Segundo'} Cuatrimestre
                </h3>
                <p className="text-sm text-gray-600">
                  {group.enrollments.length} materia{group.enrollments.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Enrollments list */}
              <div className="divide-y divide-gray-200">
                {group.enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* Subject info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          <h4 className="text-lg font-semibold text-gray-900">
                            {enrollment.subjects.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Inscripto: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            Cupo: {enrollment.subjects.current_enrollment}/{enrollment.subjects.capacity}
                          </div>
                        </div>
                      </div>

                      {/* Status and actions */}
                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadgeClass(
                            enrollment.status
                          )}`}
                        >
                          {getStatusIcon(enrollment.status)}
                          {getStatusText(enrollment.status)}
                        </span>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {enrollment.status !== 'active' && (
                            <button
                              onClick={() => handleChangeStatus(enrollment.id, 'active')}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                            >
                              Marcar Cursando
                            </button>
                          )}
                          {enrollment.status !== 'completed' && (
                            <button
                              onClick={() => handleChangeStatus(enrollment.id, 'completed')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                            >
                              Marcar Aprobada
                            </button>
                          )}
                          {enrollment.status !== 'dropped' && (
                            <button
                              onClick={() => handleChangeStatus(enrollment.id, 'dropped')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                            >
                              Abandonar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
