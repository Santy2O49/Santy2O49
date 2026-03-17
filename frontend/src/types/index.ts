export enum UserRole {
  CUSTOMER = 'customer',
  CONTRACTOR = 'contractor',
  ADMIN = 'admin'
}

export enum JobStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  IN_ESCROW = 'in_escrow',
  RELEASED = 'released',
  REFUNDED = 'refunded'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  subscription_tier?: string;
  skills: string[];
  about_me?: string;
  location: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  base_price: number;
  is_featured: boolean;
}

export interface Job {
  id: string;
  customer_id: string;
  contractor_id?: string;
  service_id: string;
  service_name: string;
  description: string;
  location: string;
  status: JobStatus;
  scheduled_date?: string;
  budget: number;
  final_price?: number;
  commission_rate: number;
  commission_amount: number;
  payment_status: PaymentStatus;
  customer_rating?: number;
  contractor_rating?: number;
  created_at: string;
  completed_at?: string;
}

export interface FinanceSummary {
  total_jobs: number;
  completed_jobs: number;
  total_revenue: number;
  total_commissions: number;
  pending_payouts: number;
}

export interface ContractorEarnings {
  total_earned: number;
  completed_jobs: number;
  pending_amount: number;
  pending_jobs: number;
}
