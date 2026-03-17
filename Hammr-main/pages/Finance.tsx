import React, { useState, useMemo } from 'react';
import { MOCK_JOBS } from '../constants';
import { Job, PaymentStatus, JobStatus } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import DashboardCard from '../components/DashboardCard';
import { getPaymentStatusColor } from '../utils/colorUtils';

const Finance: React.FC = () => {
    const [jobs] = useState<Job[]>(MOCK_JOBS);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');

    const filteredJobs = useMemo(() => {
        return jobs
            .filter(job =>
                paymentStatusFilter === 'all' || job.paymentStatus === paymentStatusFilter
            )
            .filter(job =>
                job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.contractee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.contractor?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [jobs, searchTerm, paymentStatusFilter]);

    // Calculate summary stats
    const totalRevenue = useMemo(() =>
        jobs
            .filter(j => j.status === JobStatus.Completed)
            .reduce((acc, job) => acc + job.commissionAmount, 0),
        [jobs]
    );

    const totalVolume = useMemo(() =>
        jobs
            .filter(j => j.status === JobStatus.Completed)
            .reduce((acc, job) => acc + (job.budget - (job.discountAmount || 0)), 0),
        [jobs]
    );
    
    const fundsInEscrow = useMemo(() =>
        jobs
            .filter(j => j.paymentStatus === PaymentStatus.InEscrow)
            .reduce((acc, job) => acc + (job.budget - (job.discountAmount || 0)), 0),
        [jobs]
    );

    const disputedTransactions = useMemo(() =>
        jobs.filter(j => j.paymentStatus === PaymentStatus.Disputed).length,
        [jobs]
    );


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Finance Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard 
                  title="Total Revenue (Commission)" 
                  value={`$${totalRevenue.toFixed(2)}`}
                  colorClass="bg-green-100 dark:bg-green-900"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
                <DashboardCard 
                  title="Total Volume (GMV)" 
                  value={`$${totalVolume.toFixed(2)}`}
                  colorClass="bg-blue-100 dark:bg-blue-900"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h.01M12 7h.01M16 7h.01M9 11h6M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" /></svg>}
                />
                <DashboardCard 
                  title="Funds in Escrow" 
                  value={`$${fundsInEscrow.toFixed(2)}`}
                  colorClass="bg-yellow-100 dark:bg-yellow-900"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <DashboardCard 
                  title="Disputed Transactions" 
                  value={disputedTransactions}
                  colorClass="bg-red-100 dark:bg-red-900"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                />
            </div>
            
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by ID, title, user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | 'all')}
                        className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">All Payment Statuses</option>
                        {Object.values(PaymentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Users</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">HAMMR Fee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payout</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredJobs.map(job => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {job.id}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Date: {job.postedDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">C: {job.contractee.fullName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-300">P: {job.contractor?.fullName || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge color={getPaymentStatusColor(job.paymentStatus)}>{job.paymentStatus}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        ${job.budget.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                                        {job.discountAmount && job.discountAmount > 0 ? (
                                            <span>-${job.discountAmount.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400">-${job.commissionAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">${job.payoutAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Finance;