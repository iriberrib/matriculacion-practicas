import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { studentsService } from '../services/students.service';
import { subjectsService } from '../services/subjects.service';
import { careersService } from '../services/careers.service';
import { enrollmentsService } from '../services/enrollments.service';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalCareers: 0,
    activeEnrollments: 0,
    subjectsNearCapacity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [students, subjects, careers, enrollments] = await Promise.all([
        studentsService.getAll(),
        subjectsService.getAll(),
        careersService.getAll(),
        enrollmentsService.getActiveEnrollments()
      ]);

      const nearCapacity = subjects.filter(
        (s) => s.current_enrollment / s.capacity >= 0.9
      ).length;

      setStats({
        totalStudents: students?.length || 0,
        totalSubjects: subjects?.length || 0,
        totalCareers: careers?.length || 0,
        activeEnrollments: enrollments?.length || 0,
        subjectsNearCapacity: nearCapacity
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Estudiantes',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Materias',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Carreras',
      value: stats.totalCareers,
      icon: GraduationCap,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Inscripciones Activas',
      value: stats.activeEnrollments,
      icon: CheckCircle,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgLight} p-3 rounded-full`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats.subjectsNearCapacity > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">
                Materias cerca de su capacidad
              </h3>
              <p className="text-sm text-yellow-700">
                Hay {stats.subjectsNearCapacity} materia{stats.subjectsNearCapacity !== 1 ? 's' : ''} con
                más del 90% de ocupación
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen del Sistema</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Estado del sistema</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Operativo
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Base de datos</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Conectada
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">Última actualización</span>
            <span className="text-gray-600 text-sm">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Bienvenido al Sistema de Matriculación
        </h3>
        <p className="text-gray-700 leading-relaxed">
          Este sistema permite gestionar de forma completa la matriculación de alumnos, materias y
          carreras de tu institución educativa. Utiliza las opciones del menú superior para
          administrar estudiantes, crear y asignar materias, gestionar carreras e inscribir alumnos
          a sus cursos.
        </p>
      </div>
    </div>
  );
}
