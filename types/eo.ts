export interface EoOrganization {
  id: string;
  name: string;
  email?: string;
  verification_status?: 'unverified' | 'pending' | 'rejected' | 'verified' | string;
  package?: string;
}

export interface EoEvent {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  capacity?: number | null;
  created_at?: string;
  allow_transfers?: boolean;
  allow_refunds?: boolean;
}

export interface EoAddition {
  id: string;
  name: string;
  race_date?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface EventStatistics {
  registrations_count?: number;
  total_registrations?: number;
  confirmed_registrations?: number;
  participants_count?: number;
  [key: string]: unknown;
}
