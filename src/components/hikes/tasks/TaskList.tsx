import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Task } from './types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem'; // Create a SortableItem component for individual tasks

interface TaskListProps {
  tasks: Partial<Task>[] | any[];
  hikeId: string;
  viewOnly?: boolean;
}

export default function TaskList({ tasks, hikeId, viewOnly = false }: TaskListProps) {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState('');
  const [taskList, setTaskList] = useState(tasks);

  useEffect(() => {
    // Sort tasks by their order field before setting the taskList state
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
    setTaskList(sortedTasks);
  }, [tasks]);

  const toggleTaskCompletion = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('hike_tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-tasks', hikeId] });
      toast.success('Task completion status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update task completion status: ${error.message}`);
    },
  });

  const addTask = useMutation({
    mutationFn: async (description: string) => {
      const newOrder = tasks?.length ? Math.max(...tasks.map(task => task.order || 0)) + 1 : 1;

      const { data, error } = await supabase
        .from('hike_tasks')
        .insert([{ hike_id: hikeId, description, order: newOrder }])
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

  const updateTaskOrder = useMutation({
    mutationFn: async (orderedTasks: Partial<Task>[]) => {
      const updates = orderedTasks.map((task, index) => ({
        id: task.id,
        order: index,
        description: task.description || '',
        hike_id: task.hike_id || null,
        completed: task.completed || false,
        created_at: task.created_at || null,
      }));

      const { error } = await supabase
        .from('hike_tasks')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-tasks', hikeId] });
      toast.success('Task order updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update task order: ${error.message}`);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('hike_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-tasks', hikeId] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = taskList.findIndex((task) => task.id === active.id);
      const newIndex = taskList.findIndex((task) => task.id === over.id);

      const reorderedTasks = arrayMove(taskList, oldIndex, newIndex);
      setTaskList(reorderedTasks); // Update the UI with the new order
      updateTaskOrder.mutate(reorderedTasks);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={taskList.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {taskList.map((task) => (
            <div className="relative group" key={task.id}>
              <SortableItem
                id={task.id}
                task={task}
                viewOnly={viewOnly}
                toggleTaskCompletion={toggleTaskCompletion}
              />
              {!viewOnly && (
                <button
                  onClick={() => deleteTask.mutate(task.id)}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 hidden group-hover:block text-red-500 hover:text-red-700"
                  aria-label="Delete task"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      </SortableContext>
      {!viewOnly && (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newTask.trim()) return;
          addTask.mutate(newTask.trim());
        }} className="flex gap-2">
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
    </DndContext>
  );
}