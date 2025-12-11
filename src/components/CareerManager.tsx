import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, BookOpen } from 'lucide-react';
import { careersService } from '../services/careers.service';
import { subjectsService } from '../services/subjects.service';
import type { Database } from '../lib/database.types';

type Career = Database['public']['Tables']['careers']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];

export function CareerManager() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [careerSubjects, setCareerSubjects] = useState<any[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    total_semesters: 8,
    total_years: 4
  });

  const [assignData, setAssignData] = useState({
    subject_id: '',
    year: 1,
    semester: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCareer) {
      loadCareerSubjects(selectedCareer);
    }
  }, [selectedCareer]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [careersData, subjectsData] = await Promise.all([
        careersService.getAll(),
        subjectsService.getAll()
      ]);
      setCareers(careersData || []);
      setSubjects(subjectsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadCareerSubjects = async (careerId: string) => {
    try {
      const data = await careersService.getSubjects(careerId);
      setCareerSubjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar materias de la carrera');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingCareer) {
        await careersService.update(editingCareer.id, formData);
      } else {
        await careersService.create(formData);
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar carrera');
    }
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCareer) return;

    try {
      setError(null);
      await careersService.assignSubject({
        career_id: selectedCareer,
        ...assignData
      });

      await loadCareerSubjects(selectedCareer);
      setAssignData({ subject_id: '', year: 1, semester: 1 });
      setShowAssignForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar materia');
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    if (!selectedCareer) return;
    if (!confirm('¿Estás seguro de desasignar esta materia?')) return;

    try {
      setError(null);
      await careersService.removeSubject(selectedCareer, subjectId);
      await loadCareerSubjects(selectedCareer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desasignar materia');
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      total_semesters: career.total_semesters,
      total_years: career.total_years
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta carrera?')) return;

    try {
      setError(null);
      await careersService.delete(id);
      await loadData();
      if (selectedCareer === id) {
        setSelectedCareer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar carrera');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      total_semesters: 8,
      total_years: 4
    });
    setEditingCareer(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando carreras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Carreras</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Carrera
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingCareer ? 'Editar Carrera' : 'Nueva Carrera'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Carrera
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Años
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.total_years}
                  onChange={(e) => setFormData({ ...formData, total_years: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Cuatrimestres
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.total_semesters}
                  onChange={(e) => setFormData({ ...formData, total_semesters: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editingCareer ? 'Actualizar' : 'Crear'}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Carreras Disponibles</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {careers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No hay carreras registradas
              </div>
            ) : (
              careers.map((career) => (
                <div
                  key={career.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedCareer === career.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                  }`}
                  onClick={() => setSelectedCareer(career.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">{career.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {career.total_years} años • {career.total_semesters} cuatrimestres
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(career);
                        }}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(career.id);
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Materias de la Carrera
            </h3>
            {selectedCareer && (
              <button
                onClick={() => setShowAssignForm(!showAssignForm)}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Asignar
              </button>
            )}
          </div>

          {!selectedCareer ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Selecciona una carrera para ver sus materias
            </div>
          ) : (
            <>
              {showAssignForm && (
                <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                  <form onSubmit={handleAssignSubject} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Materia
                      </label>
                      <select
                        required
                        value={assignData.subject_id}
                        onChange={(e) => setAssignData({ ...assignData, subject_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar materia</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Año
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={assignData.year}
                          onChange={(e) => setAssignData({ ...assignData, year: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cuatrimestre
                        </label>
                        <select
                          value={assignData.semester}
                          onChange={(e) => setAssignData({ ...assignData, semester: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value={1}>1°</option>
                          <option value={2}>2°</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Asignar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAssignForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {careerSubjects.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No hay materias asignadas
                  </div>
                ) : (
                  careerSubjects.map((cs) => (
                    <div key={cs.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {cs.subjects.name}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {cs.year}° Año • {cs.semester}° Cuatrimestre
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSubject(cs.subject_id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Desasignar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
