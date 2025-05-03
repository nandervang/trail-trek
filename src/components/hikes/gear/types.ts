export interface GearItem {
  id: string;
  name: string;
  weight_kg: number;
  quantity: number;
  checked?: boolean;
  is_worn?: boolean;
  image_url?: string;
  location?: string;
  notes?: string;
  gear?: {
    id: string;
    name: string;
    weight_kg: number;
    image_url?: string;
    location?: string;
    category?: {
      id: string;
      name: string;
    };
  };
}

export interface CategoryStats {
  items: GearItem[];
  totalWeight: number;
  itemCount: number;
  wornCount: number;
}