import { ListChecks, ChevronUp, ChevronDown } from 'lucide-react';
import TaskList from './TaskList';
import { Task } from './types';

interface TaskSectionProps {
  tasks: Task[];
  hikeId: string;
  expanded: boolean;
  onToggle: () => void;
  viewOnly?: boolean;
}

export default function TaskSection({ tasks, hikeId, expanded, onToggle, viewOnly = false }: TaskSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <h2 className="text-xl font-light flex items-center">
          <ListChecks className="h-6 w-6 mr-3 text-primary-600" />
          Preparation Tasks
        </h2>
        {expanded ? (
          <ChevronUp className="h-6 w-6 text-gray-400" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-6">
          <TaskList tasks={tasks} hikeId={hikeId} viewOnly={viewOnly} />
        </div>
      )}
    </div>
  );
}