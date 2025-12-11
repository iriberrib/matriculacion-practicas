import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BookOpen, Lock, CheckCircle, Clock } from 'lucide-react';
import type { SubjectNodeState } from '../services/correlativities.service';

export interface SubjectNodeData {
  label: string;
  state: SubjectNodeState;
  year: number;
  semester: number;
  capacity: number;
  current_enrollment: number;
  highlighted?: boolean;
}

function SubjectNodeComponent({ data }: NodeProps<SubjectNodeData>) {
  const { label, state, year, semester, capacity, current_enrollment, highlighted } = data;

  const getStateStyles = () => {
    switch (state) {
      case 'COMPLETED':
        return {
          wrapper: 'from-green-50/90 to-emerald-50/90 border-green-200/50',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          badge: 'bg-green-100/50 text-green-700',
          glow: 'shadow-green-500/20'
        };
      case 'ENROLLED':
        return {
          wrapper: 'from-yellow-50/90 to-amber-50/90 border-yellow-200/50',
          icon: Clock,
          iconColor: 'text-yellow-600',
          badge: 'bg-yellow-100/50 text-yellow-700',
          glow: 'shadow-yellow-500/20'
        };
      case 'AVAILABLE':
        return {
          wrapper: 'from-blue-50/90 to-indigo-50/90 border-blue-200/50',
          icon: BookOpen,
          iconColor: 'text-blue-600',
          badge: 'bg-blue-100/50 text-blue-700',
          glow: 'shadow-blue-500/20'
        };
      case 'LOCKED':
      default:
        return {
          wrapper: 'from-gray-50/90 to-slate-50/90 border-gray-200/50',
          icon: Lock,
          iconColor: 'text-gray-500',
          badge: 'bg-gray-100/50 text-gray-600',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const styles = getStateStyles();
  const Icon = styles.icon;
  const availability = capacity > 0 ? Math.round((current_enrollment / capacity) * 100) : 0;

  // Base glassmorphism styles
  const glassStyles = "backdrop-blur-md bg-gradient-to-br border shadow-lg transition-all duration-300";
  const hoverStyles = "hover:scale-105 hover:-translate-y-1 hover:shadow-xl";
  const highlightStyles = highlighted
    ? `ring-4 ring-offset-2 ring-purple-400 scale-110 z-50 ${styles.glow}`
    : styles.glow;

  return (
    <div
      className={`
        px-3 py-2.5 rounded-xl min-w-[180px]
        ${glassStyles}
        ${styles.wrapper}
        ${hoverStyles}
        ${highlightStyles}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400/50" />

      <div className="flex items-start gap-2 mb-2">
        <div className={`p-1.5 rounded-lg bg-white/40 ${styles.iconColor} shadow-sm backdrop-blur-sm`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 text-sm leading-tight truncate" title={label}>
            {label}
          </div>
          <div className="text-[10px] font-medium text-gray-500 mt-0.5 uppercase tracking-wide">
            {year}° Año - {semester}° Cuat.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200/30">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${styles.badge} backdrop-blur-sm`}>
          {state === 'AVAILABLE' ? 'Disponible' :
            state === 'COMPLETED' ? 'Aprobada' :
              state === 'ENROLLED' ? 'Cursando' : 'Bloqueada'}
        </span>
        {capacity > 0 && (
          <div className="flex items-center gap-1.5" title="Disponibilidad">
            <div className="w-12 h-1.5 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full rounded-full ${availability > 90 ? 'bg-red-500' :
                  availability > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                style={{ width: `${availability}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              {availability}%
            </span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400/50" />
    </div>
  );
}

export const SubjectNode = memo(SubjectNodeComponent);
