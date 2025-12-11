import { Search, Download, RotateCcw, Filter, Loader2 } from 'lucide-react';
import type { SubjectNodeState } from '../services/correlativities.service';

interface MapControlsProps {
  visibleStates: Set<SubjectNodeState>;
  onToggleState: (state: SubjectNodeState) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onExport: () => void;
  onResetView: () => void;
  exporting: boolean;
}

const stateConfig = [
  { state: 'COMPLETED' as SubjectNodeState, label: 'Aprobadas', color: 'bg-green-500' },
  { state: 'ENROLLED' as SubjectNodeState, label: 'Cursando', color: 'bg-yellow-500' },
  { state: 'AVAILABLE' as SubjectNodeState, label: 'Disponibles', color: 'bg-blue-500' },
  { state: 'LOCKED' as SubjectNodeState, label: 'Bloqueadas', color: 'bg-gray-400' }
];

export function MapControls({
  visibleStates,
  onToggleState,
  searchTerm,
  onSearchChange,
  onExport,
  onResetView,
  exporting
}: MapControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 space-y-3 max-w-xs">
      {/* Search Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar materia..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
        </div>
        <div className="space-y-2">
          {stateConfig.map(({ state, label, color }) => (
            <label
              key={state}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={visibleStates.has(state)}
                onChange={() => onToggleState(state)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 p-3 space-y-2">
        <button
          onClick={onExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar PNG
            </>
          )}
        </button>
        <button
          onClick={onResetView}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Resetear Vista
        </button>
      </div>
    </div>
  );
}
