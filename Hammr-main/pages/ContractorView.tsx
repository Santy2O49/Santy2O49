import React, { useMemo, useState } from 'react';
import { User, JobStatus, Job } from '../types';
import { MOCK_JOBS } from '../constants';
import Card from '../components/ui/Card';
import DashboardCard from '../components/DashboardCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { getJobStatusColor } from '../utils/colorUtils';
import Modal from '../components/ui/Modal';


const ContractorView: React.FC<{ user: User }> = ({ user }) => {
    const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'cash'>('bank');
    const [amount, setAmount] = useState('');
    const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

    // Local state for jobs to allow modifications
    const [contractorJobs, setContractorJobs] = useState<Job[]>(() =>
        MOCK_JOBS.filter(job => job.contractor?.id === user.id)
    );

    // Modal state for adding discount
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [discountPercent, setDiscountPercent] = useState('');
    const [discountError, setDiscountError] = useState<string | null>(null);
    
    const { available, pending, total } = useMemo(() => {
        return contractorJobs.reduce((acc, job) => {
            if (job.status === JobStatus.Completed) {
                acc.available += job.payoutAmount;
                acc.total += job.payoutAmount;
            } else if (job.status === JobStatus.Active) {
                acc.pending += job.payoutAmount;
                acc.total += job.payoutAmount;
            }
            return acc;
        }, { available: 0, pending: 0, total: 0 });
    }, [contractorJobs]);

    const handleWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        setWithdrawalError(null);

        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            setWithdrawalError('Please enter a valid positive amount.');
            return;
        }
        if (withdrawalAmount > available) {
            setWithdrawalError('Withdrawal amount cannot exceed available balance.');
            return;
        }

        alert(`Withdrawal request for $${amount} via ${withdrawalMethod === 'bank' ? 'Bank Transfer' : 'Ugly Cash'} submitted!`);
        setAmount('');
    };
    
    const handleOpenDiscountModal = (job: Job) => {
        setSelectedJob(job);
        setDiscountPercent('');
        setDiscountError(null);
        setIsDiscountModalOpen(true);
    };

    const handleSaveDiscount = () => {
        setDiscountError(null);
        const percent = parseFloat(discountPercent);

        if (!selectedJob || isNaN(percent) || percent < 1 || percent > 10) {
            setDiscountError('Please enter a valid percentage between 1 and 10.');
            return;
        }

        setContractorJobs(prevJobs => prevJobs.map(job => {
            if (job.id === selectedJob.id) {
                const discountPercentage = percent / 100;
                const discountAmount = job.budget * discountPercentage;
                const commissionAmount = job.budget * 0.05; // Recalculate for safety, though it shouldn't change
                const payoutAmount = job.budget - commissionAmount - discountAmount;
                return { ...job, discountPercentage, discountAmount, payoutAmount };
            }
            return job;
        }));

        setIsDiscountModalOpen(false);
        setSelectedJob(null);
    };


    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Earnings Overview</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <DashboardCard 
                            title="Available for Withdrawal"
                            value={`$${available.toFixed(2)}`}
                            colorClass="bg-green-100 dark:bg-green-900"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                         />
                         <DashboardCard 
                            title="Pending (In Escrow)"
                            value={`$${pending.toFixed(2)}`}
                            colorClass="bg-yellow-100 dark:bg-yellow-900"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                         />
                         <DashboardCard 
                            title="Lifetime Earnings"
                            value={`$${total.toFixed(2)}`}
                            colorClass="bg-blue-100 dark:bg-blue-900"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                         />
                    </div>
                </Card>
                 <Card>
                    <h2 className="text-xl font-semibold mb-4">My Jobs</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payout</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {contractorJobs.map(job => (
                                    <tr key={job.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><Badge color={getJobStatusColor(job.status)}>{job.status}</Badge></td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                                            ${job.payoutAmount.toFixed(2)}
                                            {job.discountAmount && job.discountAmount > 0 && (
                                                <div className="text-xs text-gray-400 font-normal">(inc. ${job.discountAmount.toFixed(2)} discount)</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {job.status === JobStatus.Completed && (!job.discountPercentage || job.discountPercentage === 0) && (
                                                <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenDiscountModal(job)}>
                                                    Add Discount
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
                    <form onSubmit={handleWithdrawal} className="space-y-4">
                        <div>
                            <Input 
                                id="amount"
                                label="Amount to withdraw"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                aria-invalid={!!withdrawalError}
                                aria-describedby="amount-error"
                            />
                            {withdrawalError && <p id="amount-error" className="mt-1 text-xs text-red-500">{withdrawalError}</p>}
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</span>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <label className={`rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase cursor-pointer border ${withdrawalMethod === 'bank' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`} >
                                    <input type="radio" name="withdrawal-method" value="bank" className="sr-only" onChange={() => setWithdrawalMethod('bank')} checked={withdrawalMethod === 'bank'} />
                                    Bank Transfer
                                </label>
                                 <label className={`rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase cursor-pointer border ${withdrawalMethod === 'cash' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                    <input type="radio" name="withdrawal-method" value="cash" className="sr-only" onChange={() => setWithdrawalMethod('cash')} checked={withdrawalMethod === 'cash'} />
                                    Ugly Cash
                                </label>
                            </div>
                        </div>
                        {withdrawalMethod === 'bank' && (
                             <div className="space-y-3 pt-2">
                                <Input id="bank-name" label="Bank Name" placeholder="Banco Agrícola" required />
                                <Input id="account-number" label="Account Number" placeholder="00123456789" required />
                            </div>
                        )}
                         {withdrawalMethod === 'cash' && (
                             <div className="pt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                                Please proceed to the nearest HAMMR-affiliated pickup point with your government ID to collect your payment.
                            </div>
                        )}
                        <div className="pt-2">
                            <Button type="submit" className="w-full justify-center">
                                Request Withdrawal
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
        <Modal 
            isOpen={isDiscountModalOpen} 
            onClose={() => setIsDiscountModalOpen(false)} 
            title={`Add Discount for ${selectedJob?.title}`}
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Apply a discretionary discount for the client. The HAMMR platform fee will not be affected.
                </p>
                <div>
                    <Input 
                        id="discount"
                        label="Discount Percentage (1-10%)"
                        type="number"
                        placeholder="e.g., 5"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        required
                        min="1"
                        max="10"
                    />
                    {discountError && <p className="mt-1 text-xs text-red-500">{discountError}</p>}
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <Button variant="secondary" onClick={() => setIsDiscountModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveDiscount}>Save Discount</Button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default ContractorView;