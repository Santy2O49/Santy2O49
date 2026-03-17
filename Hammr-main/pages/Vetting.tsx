
import React, { useState, useMemo } from 'react';
import { MOCK_APPLICATIONS } from '../constants';
import { ContractorApplication, VerificationStatus } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const Vetting: React.FC = () => {
  const [applications, setApplications] = useState<ContractorApplication[]>(MOCK_APPLICATIONS);
  const [selectedApplication, setSelectedApplication] = useState<ContractorApplication | null>(applications[0] || null);

  const pendingApplications = useMemo(() => applications.filter(app => app.status === VerificationStatus.Pending), [applications]);

  const handleSelectApplication = (application: ContractorApplication) => {
    setSelectedApplication(application);
  };
  
  const handleApplicationAction = (id: string, status: VerificationStatus) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    if (selectedApplication?.id === id) {
        const nextApp = applications.find(app => app.id !== id && app.status === VerificationStatus.Pending);
        setSelectedApplication(nextApp || null);
    }
  };


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Contractor Vetting</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Pending Applications ({pendingApplications.length})</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingApplications.map(app => (
              <li key={app.id} onClick={() => handleSelectApplication(app)} className={`p-4 cursor-pointer rounded-md ${selectedApplication?.id === app.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div className="flex items-center space-x-4">
                  <img className="h-12 w-12 rounded-full object-cover" src={app.contractor.avatarUrl} alt={app.contractor.fullName} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{app.contractor.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted: {app.submissionDate}</p>
                  </div>
                </div>
              </li>
            ))}
            {pendingApplications.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending applications.</p>
            )}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          {selectedApplication ? (
            <div>
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <img className="h-20 w-20 rounded-full object-cover" src={selectedApplication.contractor.avatarUrl} alt={selectedApplication.contractor.fullName} />
                <div>
                  <h2 className="text-2xl font-bold">{selectedApplication.contractor.fullName}</h2>
                  <p className="text-md text-gray-500 dark:text-gray-400">{selectedApplication.contractor.email}</p>
                  <div className="mt-2">
                    <Badge color="yellow">{selectedApplication.status}</Badge>
                    <span className="ml-4 text-sm text-gray-500">Attempt: {selectedApplication.attempts}/3</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedApplication.documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <p className="font-semibold text-sm mb-2">{doc.type}</p>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <img src={doc.url} alt={doc.type} className="w-full h-auto object-cover rounded-md aspect-[16/10]" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <Button variant="danger" onClick={() => handleApplicationAction(selectedApplication.id, VerificationStatus.Rejected)}>Reject</Button>
                <Button variant="success" onClick={() => handleApplicationAction(selectedApplication.id, VerificationStatus.Approved)}>Approve</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select an application to review.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Vetting;
