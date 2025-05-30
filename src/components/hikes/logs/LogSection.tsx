import { FileText, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogList from './LogList';
import { Log } from './types';

interface LogSectionProps {
  hikeId: string;
  expanded: boolean;
  onToggle?: () => void; // Made optional to support viewOnly mode
  onLogClick?: (log: Log) => void;
  viewOnly?: boolean; // New prop to disable editing functionality
}

export default function LogSection({
  hikeId,
  expanded,
  onToggle,
  onLogClick,
  viewOnly = false, // Default to false
}: LogSectionProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className={`flex justify-between items-center px-6 py-4 ${!viewOnly ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={!viewOnly ? onToggle : undefined} // Disable toggle functionality in viewOnly mode
      >
        <h2 className="text-xl font-light flex items-center">
          <FileText className="h-6 w-6 mr-3 text-primary-600" />
          Trail Logs
        </h2>
        <div className="flex items-center space-x-4">
          {!viewOnly && (
            <Link 
              to={`/hikes/${hikeId}/log`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-outline flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Link>
          )}
          {expanded ? (
            <ChevronUp className="h-6 w-6 text-gray-400" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-6">
          <LogList viewOnly={viewOnly} hikeId={hikeId} onLogClick={onLogClick} />
        </div>
      )}
    </div>
  );
}