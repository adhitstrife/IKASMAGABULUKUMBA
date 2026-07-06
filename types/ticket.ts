export type TicketTypeVariant = 'standard' | 'student' | 'community';

export interface TicketTypeAddon {
  id: string;
  ticket_type_id: string;
  name: string;
  description?: string | null;
  price: number;
  max_quantity: number | null;
  quantity_sold: number;
  is_active: boolean;
  sort_order: number;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  normal_price?: number;
  quantity: number;
  quantity_sold: number;
  quantity_reserved: number | null;
  sale_start: string;
  sale_end: string;
  min_per_order: number;
  max_per_order: number;
  is_active: boolean;
  variant?: TicketTypeVariant;
  bonus_threshold: number | null;
  bonus_quantity: number | null;
  addons?: TicketTypeAddon[];
}

export interface EventAddition {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  tickets: Ticket[];
}

export interface ApiEvent {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  additions: EventAddition[];
}

export interface SelectedAddonInput {
  addon_id: string;
}

export interface ParticipantFormData {
  bib_name: string;
  shirt_size: string;
  is_bonus: boolean;
  addons: SelectedAddonInput[];
}
