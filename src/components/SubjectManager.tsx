import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Search, X } from 'lucide-react';
import { subjectsService } from '../services/subjects.service';
import { careersService } from '../services/careers.service';
import type { Database } from '../lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];
type Career = Database['public']['Tables']['careers']['Row'];
type CareerSubject = Database['public']['Tables']['career_subjects']['Row'];

export function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [careerSubjects, setCareerSubjects] = useState<CareerSubject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    semester: 1,
    year: 1,
    capacity: 30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subjectsData, careersData, careerSubjectsData] = await Promise.all([
        subjectsService.getAll(),
        careersService.getAll(),
        careersService.getAllCareerSubjects()
      ]);
      setSubjects(subjectsData || []);
      setCareers(careersData || []);
      setCareerSubjects(careerSubjectsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await subjectsService.getAll();
      setSubjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar materias');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingSubject) {
        await subjectsService.update(editingSubject.id, formData);
      } else {
        await subjectsService.create(formData);
      }

      await loadSubjects();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar materia');
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      semester: subject.semester,
      year: subject.year,
      capacity: subject.capacity
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;

    try {
      setError(null);
      await subjectsService.delete(id);
      await loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar materia');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      semester: 1,
      year: 1,
      capacity: 30
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCareer('all');
    setSelectedSemester('all');
    setSelectedYear('all');
  };

  const getFilteredSubjects = () => {
    return subjects.filter(subject => {
      // Filter by Search Query
      if (searchQuery && !subject.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by Semester
      if (selectedSemester !== 'all' && subject.semester !== parseInt(selectedSemester)) {
        return false;
      }

      // Filter by Year
      if (selectedYear !== 'all' && subject.year !== parseInt(selectedYear)) {
        return false;
      }

      // Filter by Career
      if (selectedCareer !== 'all') {
        const belongsToCareer = careerSubjects.some(
          cs => cs.career_id === selectedCareer && cs.subject_id === subject.id
        );
        if (!belongsToCareer) return false;
      }

      return true;
    });
  };

  const getAvailabilityColor = (subject: Subject) => {
    const percentage = (subject.current_enrollment / subject.capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredSubjects = getFilteredSubjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando materias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Materias</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Materia
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar materia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="all">Todas las Carreras</option>
            {careers.map(career => (
              <option key={career.id} value={career.id}>{career.title}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="all">Todos los Años</option>
            <option value="1">1° Año</option>
            <option value="2">2° Año</option>
            <option value="3">3° Año</option>
            <option value="4">4° Año</option>
            <option value="5">5° Año</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="all">Todos los Cuat.</option>
            <option value="1">1° Cuatrimestre</option>
            <option value="2">2° Cuatrimestre</option>
          </select>

          {(searchQuery || selectedCareer !== 'all' || selectedSemester !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuatrimestre
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={1}>1er Cuatrimestre</option>
                  <option value={2}>2do Cuatrimestre</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingSubject ? 'Actualizar' : 'Crear'}
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

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuatrimestre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscriptos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay materias que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{subject.year}°</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{subject.semester}° Cuatrimestre</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${getAvailabilityColor(subject)}`}>
                        {subject.current_enrollment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{subject.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600 text-center">
        Mostrando {filteredSubjects.length} de {subjects.length} materias
      </div>
    </div>
  );
}
