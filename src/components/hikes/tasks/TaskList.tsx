import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Task } from './types';

interface TaskListProps {
  tasks: Partial<Task>[] | any[];
  hikeId: string;
  viewOnly?: boolean;
}

export default function TaskList({ tasks, hikeId, viewOnly = false }: TaskListProps) {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState('');

  const toggleTaskCompletion = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('hike_tasks')
        .update({ completed })
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-tasks', hikeId] });
    },
  });

  const addTask = useMutation({
    mutationFn: async (description: string) => {
      const { data, error } = await supabase
        .from('hike_tasks')
        .insert([{ 
          hike_id: hikeId,
          description 
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-tasks', hikeId] });
      setNewTask('');
      toast.success('Task added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add task: ${error.message}`);
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask.mutate(newTask.trim());
  };

  return (
    <div className="space-y-6">
      {!viewOnly && (
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Add Task
          </button>
        </form>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center text-lg">
            <div 
              className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
                task.completed ? 'bg-primary-50' : ''
              }`}
              onClick={() => !viewOnly && toggleTaskCompletion.mutate({ 
                taskId: task.id, 
                completed: !task.completed 
              })}
            >
              {task.completed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className={task.completed ? 'line-through decoration-[#558455] decoration-wavy decoration-2' : ''}>
              {task.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}