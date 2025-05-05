export interface Task {
  id: string;
  hike_id: string | null;
  description: string;
  completed: boolean | null; // Update to allow null
  created_at: string | null;
}