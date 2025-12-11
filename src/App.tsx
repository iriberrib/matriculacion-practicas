import { useState } from 'react';
import { Users, BookOpen, GraduationCap, CheckCircle, BarChart3, Map } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { SubjectManager } from './components/SubjectManager';
import { CareerManager } from './components/CareerManager';
import { EnrollmentManager } from './components/EnrollmentManager';
import { EnrollmentMapView } from './components/EnrollmentMapView';

type View = 'dashboard' | 'students' | 'subjects' | 'careers' | 'enrollments' | 'map';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems = [
    { id: 'dashboard' as View, label: 'Panel', icon: BarChart3, color: 'text-gray-700' },
    { id: 'students' as View, label: 'Estudiantes', icon: Users, color: 'text-blue-600' },
    { id: 'subjects' as View, label: 'Materias', icon: BookOpen, color: 'text-green-600' },
    { id: 'careers' as View, label: 'Carreras', icon: GraduationCap, color: 'text-purple-600' },
    { id: 'enrollments' as View, label: 'Inscripciones', icon: CheckCircle, color: 'text-orange-600' },
    { id: 'map' as View, label: 'Mapa de Correlatividades', icon: Map, color: 'text-purple-600' }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManager />;
      case 'subjects':
        return <SubjectManager />;
      case 'careers':
        return <CareerManager />;
      case 'enrollments':
        return <EnrollmentManager />;
      case 'map':
        return <EnrollmentMapView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Sistema de Matriculación - FCE UNaM
              </h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${isActive
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Sistema de Matriculación Universitaria - FCE UNaM
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
