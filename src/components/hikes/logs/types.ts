export interface Log {
  id: string;
  created_at: string;
  hike_id: string;
  date: string;
  notes: string | null;
  weather: string | null;
  images: string[] | null;
  temperature: number | null;
  conditions: string[] | null;
  mood: number | null;
  difficulty: number | null;
  title: string | null;
  time: string | null;
  location: string | null;
  distance_km: number | null;
}