import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, User, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { studentsService } from '../services/students.service';
import { careersService } from '../services/careers.service';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'] & {
  careers?: { id: string; title: string } | null;
  id_type?: string | null;
};
type Career = Database['public']['Tables']['careers']['Row'];

type SortConfig = {
  key: keyof Student | 'career_title';
  direction: 'asc' | 'desc';
};

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCareer, setFilterCareer] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');

  // Sort State
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'last_name', direction: 'asc' });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    id_type: 'DNI',
    dni: '',
    birth_date: '',
    current_career_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentsData, careersData] = await Promise.all([
        studentsService.getAll(),
        careersService.getAll()
      ]);
      setStudents(studentsData || []);
      setCareers(careersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search filter
      const searchLower = debouncedSearch.toLowerCase();
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      const matchesSearch =
        searchLower === '' ||
        fullName.includes(searchLower) ||
        student.dni.includes(searchLower);

      // Career filter
      const matchesCareer =
        filterCareer === 'all' ||
        (filterCareer === 'none' ? !student.current_career_id : student.current_career_id === filterCareer);

      // Doc Type filter
      const matchesDocType =
        filterDocType === 'all' ||
        (student.id_type || 'DNI') === filterDocType;

      return matchesSearch && matchesCareer && matchesDocType;
    });
  }, [students, debouncedSearch, filterCareer, filterDocType]);

  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents];
    return sorted.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Student];
      let bValue: any = b[sortConfig.key as keyof Student];

      // Handle nested or special sort keys
      if (sortConfig.key === 'career_title') {
        aValue = a.careers?.title || '';
        bValue = b.careers?.title || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortConfig]);

  const handleSort = (key: keyof Student | 'career_title') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCareer('all');
    setFilterDocType('all');
    setSortConfig({ key: 'last_name', direction: 'asc' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const studentData = {
        ...formData,
        current_career_id: formData.current_career_id || null
      };

      if (editingStudent) {
        await studentsService.update(editingStudent.id, studentData);
      } else {
        await studentsService.create(studentData);
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar estudiante');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      id_type: student.id_type || 'DNI',
      dni: student.dni,
      birth_date: student.birth_date,
      current_career_id: student.current_career_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      setError(null);
      await studentsService.delete(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar estudiante');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      id_type: 'DNI',
      dni: '',
      birth_date: '',
      current_career_id: ''
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Student | 'career_title' }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Estudiantes</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nuevo Estudiante
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
              <select
                value={filterCareer}
                onChange={(e) => setFilterCareer(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                <option value="all">Todas las carreras</option>
                {careers.map(career => (
                  <option key={career.id} value={career.id}>{career.title}</option>
                ))}
                <option value="none">Sin carrera</option>
              </select>

              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
              >
                <option value="all">Todos los documentos</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="LC">LC</option>
                <option value="LE">LE</option>
                <option value="CUIL">CUIL</option>
              </select>

              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                Mostrando <span className="font-semibold text-gray-900">{filteredStudents.length}</span> de <span className="font-semibold text-gray-900">{students.length}</span> estudiantes
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={formData.id_type}
                  onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                  <option value="CUIL">CUIL (Código Único de Identificación Laboral)</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="LC">LC</option>
                  <option value="LE">LE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.id_type === 'DNI' && 'Número de DNI'}
                  {formData.id_type === 'CUIL' && 'Número de CUIL'}
                  {formData.id_type === 'Pasaporte' && 'Número de Pasaporte'}
                  {(formData.id_type === 'LC' || formData.id_type === 'LE') && 'Número'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese el número"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  required
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrera
                </label>
                <select
                  value={formData.current_career_id}
                  onChange={(e) => setFormData({ ...formData, current_career_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin carrera asignada</option>
                  {careers.map((career) => (
                    <option key={career.id} value={career.id}>
                      {career.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingStudent ? 'Actualizar' : 'Crear'}
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
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('last_name')}
                >
                  <div className="flex items-center gap-2">
                    Nombre Completo
                    <SortIcon columnKey="last_name" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('id_type')}
                >
                  <div className="flex items-center gap-2">
                    Tipo de Documento
                    <SortIcon columnKey="id_type" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('dni')}
                >
                  <div className="flex items-center gap-2">
                    Número
                    <SortIcon columnKey="dni" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('birth_date')}
                >
                  <div className="flex items-center gap-2">
                    Fecha de Nacimiento
                    <SortIcon columnKey="birth_date" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('career_title')}
                >
                  <div className="flex items-center gap-2">
                    Carrera
                    <SortIcon columnKey="career_title" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No se encontraron estudiantes</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Limpiar todos los filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.last_name}, {student.first_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.id_type || 'DNI'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.dni}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(student.birth_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.careers?.title || 'Sin carrera'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
