import { CheckCircle, Clock, Lock, BookOpen } from 'lucide-react';
import type { SubjectEligibilityStatus } from '../services/enrollment-eligibility.service';
import type { Database } from '../lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];

interface SubjectEligibilityBadgeProps {
  status: SubjectEligibilityStatus;
  missingPrerequisites?: Subject[];
  availableSpots: number;
  capacity: number;
}

export function SubjectEligibilityBadge({
  status,
  missingPrerequisites = [],
  availableSpots,
  capacity
}: SubjectEligibilityBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ALREADY_PASSED':
        return {
          icon: CheckCircle,
          label: 'Aprobada',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          iconColor: 'text-green-600'
        };
      case 'CURRENTLY_ENROLLED':
        return {
          icon: Clock,
          label: 'Cursando',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          iconColor: 'text-blue-600'
        };
      case 'LOCKED':
        return {
          icon: Lock,
          label: 'Bloqueada',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600'
        };
      case 'AVAILABLE':
        return {
          icon: BookOpen,
          label: 'Disponible',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
        <span className="text-xs font-medium">{config.label}</span>
      </div>

      {status === 'LOCKED' && missingPrerequisites.length > 0 && (
        <div className="group relative">
          <div className="cursor-help">
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="absolute left-0 top-6 z-10 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
            <div className="font-semibold mb-1">Requiere aprobar:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {missingPrerequisites.map((prereq) => (
                <li key={prereq.id}>{prereq.name}</li>
              ))}
            </ul>
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      )}

      {(status === 'AVAILABLE' || status === 'LOCKED') && (
        <span className="text-xs text-gray-500">
          {availableSpots}/{capacity} cupos
        </span>
      )}
    </div>
  );
}
