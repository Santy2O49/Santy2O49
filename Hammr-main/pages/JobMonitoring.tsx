import React, { useState, useMemo } from 'react';
import { MOCK_JOBS } from '../constants';
import { Job, JobStatus, PaymentStatus } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { getJobStatusColor, getPaymentStatusColor } from '../utils/colorUtils';

const JobMonitoring: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

    const filteredJobs = useMemo(() => {
        return jobs
            .filter(job =>
                statusFilter === 'all' || job.status === statusFilter
            )
            .filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.contractee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.contractor?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [jobs, searchTerm, statusFilter]);

    return (
        <Card>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Job Monitoring</h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
                    className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                    <option value="all">All Statuses</option>
                    <option value={JobStatus.Pending}>Pending</option>
                    <option value={JobStatus.Active}>Active</option>
                    <option value={JobStatus.Completed}>Completed</option>
                    <option value={JobStatus.Cancelled}>Cancelled</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contractor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job Status</th>
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
                                    <div className="text-sm text-gray-500 dark:text-gray-400">by {job.contractee.fullName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{job.contractor?.fullName || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={getJobStatusColor(job.status)}>{job.status}</Badge>
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
    );
};

export default JobMonitoring;