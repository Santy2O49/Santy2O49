import React, { useMemo } from 'react';
import { User } from '../types';
import { MOCK_JOBS } from '../constants';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { getJobStatusColor, getPaymentStatusColor } from '../utils/colorUtils';
import Button from '../components/ui/Button';

const ContracteeView: React.FC<{ user: User }> = ({ user }) => {
    const contracteeJobs = useMemo(() => MOCK_JOBS.filter(job => job.contractee.id === user.id), [user.id]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">My Posted Jobs</h1>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {contracteeJobs.map(job => (
                                    <tr key={job.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><Badge color={getJobStatusColor(job.status)}>{job.status}</Badge></td>
                                        <td className="px-4 py-3 whitespace-nowrap"><Badge color={getPaymentStatusColor(job.paymentStatus)}>{job.paymentStatus}</Badge></td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${(job.budget - (job.discountAmount || 0)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Payment Methods</h2>
                        <Button variant="secondary" className="text-xs px-3 py-1">Add New</Button>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-10 mr-3" viewBox="0 0 38 24" fill="none"><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#3D5AFE"/><path d="M35.5 4H38v2h-2.5V4zM35.5 18H38v2h-2.5v-2z" fill="#3D5AFE"/><path d="M29 6a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V7a1 1 0 011-1h20z" fill="#FFF"/><path d="M9 11h20v2H9v-2z" fill="#CFD8DC"/></svg>
                                <div>
                                    <p className="font-medium text-sm">Visa **** 1234</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Expires 12/25</p>
                                </div>
                            </div>
                             <button className="text-gray-400 hover:text-red-500 text-xs font-bold">REMOVE</button>
                        </li>
                    </ul>
                </Card>
                 <Card>
                    <h2 className="text-xl font-semibold mb-4">Billing History</h2>
                    <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {contracteeJobs.map(job => (
                                    <tr key={job.id}>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{job.postedDate}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">Payment for: {job.title}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium text-gray-800 dark:text-gray-100">${(job.budget - (job.discountAmount || 0)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ContracteeView;
