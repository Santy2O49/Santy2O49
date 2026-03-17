import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_USERS, MOCK_JOBS } from '../constants';
import { User, UserRole, Job, ActionLog, JobStatus } from '../types';
import NotFound from './NotFound';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getJobStatusColor, getPaymentStatusColor } from '../utils/colorUtils';

const skillIcons: { [key: string]: React.ReactNode } = {
  Plumbing: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12v7a1 1 0 001 1h4a1 1 0 001-1v-7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 6a3 3 0 00-3-3H9a3 3 0 00-3 3v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 6h3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
  </svg>,
  Electrical: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v-1.5a3.5 3.5 0 00-3.5-3.5h-4A3.5 3.5 0 001 17.5V19" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.5V5a2 2 0 012-2h0a2 2 0 012 2v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 13a5 5 0 11-10 0 5 5 0 0110 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11l-4 4h2.5l-2 4" />
  </svg>,
  Carpentry: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5.5a2.5 2.5 0 11-3.536 3.536L9.5 10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-1.5 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l7 7h10V9.5L10 2.5 3 9.5v4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5l1-1 1-1 1-1 1-1" />
  </svg>,
  HVAC: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m-8-9H2m20 0h-2m-1.46-5.54l-1.42 1.42M6.88 17.12l-1.42 1.42m11.66 0l-1.42-1.42M6.88 6.88l-1.42-1.42" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 10V9a1.5 1.5 0 011.5-1.5h5A1.5 1.5 0 0116 9v1z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10l-2.5-2.5a1 1 0 010-1.414l0 0a1 1 0 011.414 0L9.5 8.5" />
  </svg>,
  Painting: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 14V5a1 1 0 011-1h14a1 1 0 011 1v9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 14v5a2 2 0 01-2 2h-2a2 2 0 01-2-2v-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17a.5.5 0 100-1 .5.5 0 000 1zm5 .5a.5.5 0 100-1 .5.5 0 000 1zm5-.5a.5.5 0 100-1 .5.5 0 000 1z" />
  </svg>,
  Gardening: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21v-8a2 2 0 012-2h0a2 2 0 012 2v8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 5h6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11c-2 0-3 1.34-3 3v7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-7a4 4 0 00-4-4h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10a3 3 0 103 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 13a3 3 0 11-3-3" />
  </svg>,
};

const UserActivityLog: React.FC<{ logs: ActionLog[] }> = ({ logs }) => (
  <div className="mt-8">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Activity Log</h2>
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Timestamp</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP Address</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {logs.length > 0 ? logs.map(log => (
            <tr key={log.id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{log.action}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.ipAddress}</td>
            </tr>
          )) : (
            <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No activity recorded.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);


const ContractorProfile: React.FC<{ user: User, onToggleBlock: (userId: string) => void }> = ({ user }) => {
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  const filteredSkills = useMemo(() => {
    if (!user.skills) return [];
    return user.skills.filter(skill => 
      skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
    );
  }, [user.skills, skillSearchTerm]);

  const contractorJobs = useMemo(() => MOCK_JOBS.filter(job => job.contractor?.id === user.id), [user.id]);
  const completedJobs = useMemo(() => contractorJobs.filter(job => job.status === JobStatus.Completed), [contractorJobs]);
  const totalEarned = useMemo(() => completedJobs.reduce((acc, job) => acc + job.payoutAmount, 0), [completedJobs]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <div className="flex flex-col items-center text-center">
                    <img className="h-32 w-32 rounded-full object-cover ring-4 ring-white dark:ring-gray-900" src={user.avatarUrl} alt={user.fullName} />
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">{user.fullName}</h1>
                     <div className="flex items-center justify-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="ml-1 text-gray-600 dark:text-gray-300 font-semibold">{user.rating}</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">({user.reviewCount} Reviews)</span>
                    </div>
                </div>
            </Card>
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">About Me</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{user.aboutMe}</p>
            </Card>
            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Skills</h2>
                </div>
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 mb-4 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                />
                 {filteredSkills.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                    {filteredSkills.map(skill => (
                        <div key={skill} className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            {skillIcons[skill] || <div className="h-8 w-8"></div>}
                            <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">{skill}</p>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    No skills found.
                    </div>
                )}
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Job History & Earnings</h2>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jobs Completed</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{completedJobs.length}</p>
                    </div>
                     <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earned</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalEarned.toFixed(2)}</p>
                    </div>
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job Price</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Discount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Your Payout</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {contractorJobs.map(job => (
                                <tr key={job.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                                    <td className="px-4 py-3 whitespace-nowrap"><Badge color={getJobStatusColor(job.status)}>{job.status}</Badge></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${job.budget.toFixed(2)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                                        {job.discountAmount && job.discountAmount > 0 ? (
                                            <span>-${job.discountAmount.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">${job.payoutAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Work Gallery</h2>
                 <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {user.recentWork?.map((work, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden group">
                            <img src={work.imageUrl} alt={`Recent work ${index + 1}`} className="h-40 w-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                                <p className="text-white text-xs font-semibold p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{work.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
             <UserActivityLog logs={user.actionLogs || []} />
        </div>
    </div>
  );
}

const ContracteeProfile: React.FC<{ user: User, jobs: Job[] }> = ({ user, jobs }) => (
    <Card className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img className="h-24 w-24 rounded-full object-cover" src={user.avatarUrl} alt={user.fullName} />
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{user.fullName}</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                <p className="text-md text-gray-500 dark:text-gray-400">{user.phone}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Member since {user.registrationDate}</p>
            </div>
        </div>
        <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Posted Jobs ({jobs.length})</h2>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price Paid</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {jobs.map(job => (
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
        </div>
        <UserActivityLog logs={user.actionLogs || []} />
    </Card>
);

const UserProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
    
    const user = useMemo(() => allUsers.find(u => u.id === userId), [allUsers, userId]);

    const userJobs = useMemo(() => {
        if (user?.role === UserRole.Contractee) {
            return MOCK_JOBS.filter(job => job.contractee.id === user.id);
        }
        return [];
    }, [user]);

    const handleToggleBlock = (id: string) => {
        setAllUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
    };

    if (!user) {
        return <NotFound />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <Link to="/users" className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to User Management
                </Link>
                <div className="flex items-center space-x-4">
                     {user.isBlocked ? (
                        <Badge color="red">Blocked</Badge>
                      ) : (
                        <Badge color="green">Active</Badge>
                      )}
                    <Button
                        variant={user.isBlocked ? 'success' : 'danger'}
                        onClick={() => handleToggleBlock(user.id)}
                    >
                        {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </Button>
                </div>
            </div>
           
            {user.role === UserRole.Contractor ? (
                <ContractorProfile user={user} onToggleBlock={handleToggleBlock} />
            ) : (
                <ContracteeProfile user={user} jobs={userJobs} />
            )}
        </div>
    );
};

export default UserProfile;