import React from 'react';
import { User, ContractorApplication, Job, UserRole, VerificationStatus, JobStatus, RecentWork, ActionLog, PaymentStatus } from './types';

interface NavLink {
  path: string;
  name: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

export const ADMIN_NAV_LINKS: NavLink[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: '/vetting',
    name: 'Vetting',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/users',
    name: 'User Management',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197m0 0A4 4 0 0012 4.354" />
       </svg>
    ),
  },
   {
    path: '/jobs',
    name: 'Job Monitoring',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
  },
  {
    path: '/finance',
    name: 'Finance',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
  },
  {
    path: '/ai-pricing',
    name: 'AI Pricing Engine',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
        </svg>
    ),
    roles: [UserRole.Admin],
  },
  {
    path: '/ai-marketing',
    name: 'AI Marketing',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    roles: [UserRole.Admin],
  },
];

export const CONTRACTOR_NAV_LINKS: NavLink[] = [
    {
        path: '/dashboard',
        name: 'Earnings',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    // Add other contractor-specific links here, e.g., Job Board, Profile
];

export const CONTRACTEE_NAV_LINKS: NavLink[] = [
    {
        path: '/dashboard',
        name: 'My Jobs',
        icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        ),
    },
    // Add other contractee-specific links here, e.g., Payments, Profile
];


const MOCK_SKILLS = ['Plumbing', 'Electrical', 'Carpentry', 'HVAC', 'Painting', 'Gardening'];

const generateRecentWork = (count: number, seed: string): RecentWork[] => {
    return Array.from({ length: count }, (_, i) => {
        const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        return {
            imageUrl: `https://picsum.photos/seed/${seed}-work-${i}/400/300`,
            date: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        };
    });
};

const generateActionLogs = (count: number, userId: string): ActionLog[] => {
    const actions = [
        'Logged In',
        'Updated Profile Information',
        'Changed Password',
        'Viewed Contractor Profile',
        'Posted Job: Fix Leaky Faucet',
        'Received Bid on Job',
        'Accepted Bid on Job',
        'Completed Vetting Process',
        'Sent Message to Contractor',
        'Left a Review',
    ];

    return Array.from({ length: count }, (_, i) => {
        const date = new Date(Date.now() - (i + Math.random()) * 2 * 24 * 60 * 60 * 1000);
        return {
            id: `log-${userId}-${i}`,
            action: actions[Math.floor(Math.random() * actions.length)],
            timestamp: date.toISOString(),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};


const generateUsers = (count: number, role: UserRole): User[] => {
  return Array.from({ length: count }, (_, i) => {
    const userId = `${role.toLowerCase()}-${i + 1}`;
    const baseUser: User = {
        id: userId,
        fullName: role === UserRole.Contractor ? `Carlos Ramirez ${i + 1}` : `Contractee User ${i + 1}`,
        email: `${role.toLowerCase()}${i + 1}@example.com`,
        phone: `555-01${String(i).padStart(2, '0')}`,
        role,
        avatarUrl: `https://i.pravatar.cc/150?u=${role}${i}`,
        registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isBlocked: Math.random() > 0.9,
        actionLogs: generateActionLogs(Math.floor(Math.random() * 8) + 5, userId),
        // Add a base rating for all users
        rating: Math.round((Math.random() * (5 - 3.8) + 3.8) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 50) + 5,
    };

    if (role === UserRole.Contractor) {
        return {
            ...baseUser,
            aboutMe: 'Experiencia de 15+ años en plomería, electricida, y carpintería. ¡Soluciones rápidas y confiables!',
            skills: MOCK_SKILLS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2),
            // Override with higher, more specific contractor rating data
            rating: Math.round((Math.random() * (5 - 4.2) + 4.2) * 10) / 10,
            reviewCount: Math.floor(Math.random() * 200) + 20,
            recentWork: generateRecentWork(6, baseUser.id),
        }
    }
    return baseUser;
  });
};

export const MOCK_USERS: User[] = [
    ...generateUsers(20, UserRole.Contractor),
    ...generateUsers(50, UserRole.Contractee),
];

if (MOCK_USERS[0].role === UserRole.Contractor) {
    MOCK_USERS[0].fullName = 'Carlos Ramirez';
}


export const MOCK_APPLICATIONS: ContractorApplication[] = (MOCK_USERS.filter(u => u.role === UserRole.Contractor).slice(0, 5)).map((user, i) => ({
    id: `app-${i + 1}`,
    contractor: user,
    status: VerificationStatus.Pending,
    submissionDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    documents: [
        { id: `doc-id-${i}`, type: 'Govt ID', url: `https://picsum.photos/seed/id${i}/400/250` },
        { id: `doc-selfie-${i}`, type: 'Selfie', url: `https://picsum.photos/seed/selfie${i}/400/400` },
        { id: `doc-ap-${i}`, type: 'Antecedentes Penales', url: `https://picsum.photos/seed/ap${i}/400/550` },
        { id: `doc-spnc-${i}`, type: 'Solvencia PNC', url: `https://picsum.photos/seed/spnc${i}/400/550` },
    ],
    attempts: Math.floor(Math.random() * 2) + 1,
}));


export const jobTitles = ['Plumbing Repair', 'Electrical Wiring', 'House Painting', 'Garden Maintenance', 'Carpentry Work', 'AC Installation', 'Roof Leak Fix'];

export const MOCK_JOBS: Job[] = Array.from({ length: 30 }, (_, i) => {
    const contractee = MOCK_USERS.filter(u => u.role === UserRole.Contractee)[i % 50];
    const contractor = Math.random() > 0.3 ? MOCK_USERS.filter(u => u.role === UserRole.Contractor)[i % 20] : null;
    let status = JobStatus.Pending;
    if (contractor) {
        status = Math.random() > 0.5 ? JobStatus.Active : JobStatus.Completed;
    }
    if (Math.random() > 0.95) {
        status = JobStatus.Cancelled;
    }

    const budget = Math.floor(Math.random() * 200) + 50;
    
    // NEW DISCOUNT LOGIC
    let discountPercentage = 0;
    // Apply discount only to a subset of completed jobs
    if (status === JobStatus.Completed && Math.random() > 0.7) { 
        discountPercentage = (Math.floor(Math.random() * 10) + 1) / 100; // 1% to 10%
    }
    
    const discountAmount = budget * discountPercentage;
    const commissionAmount = budget * 0.05; // HAMMR fee is 5% of the pre-discount budget
    const payoutAmount = budget - commissionAmount - discountAmount;

    let paymentStatus: PaymentStatus;
    switch (status) {
        case JobStatus.Completed:
            paymentStatus = PaymentStatus.Released;
            break;
        case JobStatus.Active:
            paymentStatus = PaymentStatus.InEscrow;
            break;
        case JobStatus.Cancelled:
            paymentStatus = Math.random() > 0.5 ? PaymentStatus.Refunded : PaymentStatus.PendingDeposit;
            break;
        case JobStatus.Pending:
        default:
            paymentStatus = PaymentStatus.PendingDeposit;
            break;
    }
    
    // Sprinkle in some disputed cases for realism
    if ((status === JobStatus.Active || status === JobStatus.Completed) && Math.random() > 0.95) {
        paymentStatus = PaymentStatus.Disputed;
    }

    return {
        id: `job-${i+1}`,
        title: jobTitles[i % jobTitles.length],
        contractee,
        contractor,
        status,
        location: 'San Salvador',
        postedDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget,
        discountPercentage,
        discountAmount,
        paymentStatus,
        commissionAmount,
        payoutAmount,
    };
});