export interface GearItem {
  id: string;
  checked?: boolean;
  quantity: number;
  notes?: string;
  // Either directly on the item
  name?: string;
  weight_kg?: number;
  image_url?: string;
  location?: string;
  category?: {
    id: string;
    name: string;
  };
  description: string | null;
  // Or inside a nested gear property
  gear?: {
    name: string;
    weight_kg: number;
    image_url?: string;
    location?: string;
    category?: {
      id: string;
      name: string;
    };
    description?: string;
  };
}