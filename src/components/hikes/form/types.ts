export interface HikeFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  start_location: string;
  end_location: string;
  start_coordinates: [number, number] | null;
  end_coordinates: [number, number] | null;
  distance_km: number;
  type: string;
  difficulty_level: string;
  elevation_gain: number;
}