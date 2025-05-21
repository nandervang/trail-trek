import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './types';

interface SortableItemProps {
  id: string;
  task: Partial<Task>;
  viewOnly?: boolean;
  toggleTaskCompletion: any;
}

export function SortableItem({ id, task, viewOnly, toggleTaskCompletion }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center text-lg"
    >
      <div
        className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
          task.completed ? 'bg-primary-50' : ''
        }`}
        onClick={() => {
          console.log('Toggling task completion:', { taskId: task.id, completed: !task.completed });
          !viewOnly &&
          toggleTaskCompletion.mutate({
            taskId: task.id,
            completed: !task.completed,
          })
        }}
      >
        {task.completed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {viewOnly ? (
        <span
          className={
            task.completed
              ? 'line-through decoration-[#558455] decoration-wavy decoration-2'
              : ''
          }
        >
          {task.description}
        </span>
      ) : (
        <input
          type="text"
          value={task.description}
          onChange={(e) =>
            toggleTaskCompletion.mutate({
              taskId: task.id,
              description: e.target.value,
            })
          }
          className="input flex-1"
          placeholder="Edit task description"
        />
      )}
    </div>
  );
}