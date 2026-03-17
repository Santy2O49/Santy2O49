export enum UserRole {
  Contractee = 'Contractee',
  Contractor = 'Contractor',
  Admin = 'Admin',
}

export enum VerificationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum JobStatus {
  Pending = 'Pending',
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum PaymentStatus {
  PendingDeposit = 'Pending Deposit',
  InEscrow = 'In Escrow',
  Released = 'Released',
  Disputed = 'Disputed',
  Refunded = 'Refunded',
}

export interface RecentWork {
    imageUrl: string;
    date: string;
}

export interface ActionLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  registrationDate: string;
  isBlocked: boolean;
  // New optional fields for all user roles
  rating?: number;
  reviewCount?: number;
  // Contractor-specific fields
  aboutMe?: string;
  skills?: string[];
  recentWork?: RecentWork[];
  actionLogs?: ActionLog[];
}

export interface Document {
  id: string;
  type: 'Govt ID' | 'Selfie' | 'Antecedentes Penales' | 'Solvencia PNC';
  url: string;
}

export interface ContractorApplication {
  id: string;
  contractor: User;
  status: VerificationStatus;
  submissionDate: string;
  documents: Document[];
  attempts: number;
}

export interface Job {
  id: string;
  title: string;
  contractee: User;
  contractor: User | null;
  status: JobStatus;
  location: string;
  postedDate: string;
  budget: number;
  discountPercentage?: number;
  discountAmount?: number;
  paymentStatus: PaymentStatus;
  commissionAmount: number;
  payoutAmount: number;
}