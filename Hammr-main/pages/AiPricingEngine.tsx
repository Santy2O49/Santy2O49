import React, { useState, useMemo } from 'react';
import { getAIPricingSuggestion } from '../services/geminiService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MOCK_USERS, jobTitles } from '../constants';
import { User, UserRole } from '../types';

type PriceResult = {
  basePrice: number;
  contractorAdjustment: number;
  contracteeAdjustment: number;
  demandAdjustment: number;
  finalPrice: number;
};

const AiPricingEngine: React.FC = () => {
  // Form State
  const [jobType, setJobType] = useState(jobTitles[0]);
  const [complexity, setComplexity] = useState('Medium');
  const [location, setLocation] = useState('San Salvador');
  const [demand, setDemand] = useState('Normal');

  // Participant State
  const contractors = useMemo(() => MOCK_USERS.filter(u => u.role === UserRole.Contractor), []);
  const contractees = useMemo(() => MOCK_USERS.filter(u => u.role === UserRole.Contractee), []);
  const [selectedContractorId, setSelectedContractorId] = useState(contractors[0]?.id || '');
  const [selectedContracteeId, setSelectedContracteeId] = useState(contractees[0]?.id || '');

  // API State
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View State for results
  const [view, setView] = useState<'admin' | 'contractor' | 'contractee'>('admin');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPriceResult(null);
    setView('admin'); // Reset to admin view on new calculation

    try {
        const { basePrice } = await getAIPricingSuggestion(jobType, complexity, location, demand);
        
        let adjustedPrice = basePrice;
        
        // Contractor Rating Adjustment
        const contractor = contractors.find(u => u.id === selectedContractorId);
        let contractorAdjustment = 0;
        if (contractor?.rating) {
            // Baseline rating is 4.0. For every 0.1 point above, add 1%.
            contractorAdjustment = basePrice * ((contractor.rating - 4.0) * 0.1);
            adjustedPrice += contractorAdjustment;
        }

        // Contractee Rating Adjustment (small discount for good contractees)
        const contractee = contractees.find(u => u.id === selectedContracteeId);
        let contracteeAdjustment = 0;
        if (contractee?.rating) {
            // Baseline is 4.0. For every 0.1 point above, give a 0.5% discount.
            contracteeAdjustment = -(basePrice * ((contractee.rating - 4.0) * 0.05));
            adjustedPrice += contracteeAdjustment;
        }

        // Demand/Surge Adjustment
        let demandAdjustment = 0;
        if (demand === 'High') {
            demandAdjustment = (basePrice + contractorAdjustment + contracteeAdjustment) * 0.25; // 25% surge
        } else if (demand === 'Low') {
            demandAdjustment = -(basePrice + contractorAdjustment + contracteeAdjustment) * 0.10; // 10% discount
        }
        adjustedPrice += demandAdjustment;

        setPriceResult({
            basePrice,
            contractorAdjustment,
            contracteeAdjustment,
            demandAdjustment,
            finalPrice: adjustedPrice,
        });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedContractor = contractors.find(c => c.id === selectedContractorId);
  const selectedContractee = contractees.find(c => c.id === selectedContracteeId);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI Pricing Engine</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Generate fair market prices with dynamic adjustments.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">1. Job Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Type</label>
                <select id="jobType" value={jobType} onChange={e => setJobType(e.target.value)} className="mt-1 custom-select">
                  {jobTitles.map(title => <option key={title} value={title}>{title}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complexity</label>
                <select id="complexity" value={complexity} onChange={e => setComplexity(e.target.value)} className="mt-1 custom-select">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
               <div>
                <label htmlFor="demand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Market Demand</label>
                <select id="demand" value={demand} onChange={e => setDemand(e.target.value)} className="mt-1 custom-select">
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </Card>
           <Card>
            <h2 className="text-xl font-semibold mb-4">2. Participants</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="contractor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contractor</label>
                <select id="contractor" value={selectedContractorId} onChange={e => setSelectedContractorId(e.target.value)} className="mt-1 custom-select">
                  {contractors.map(c => <option key={c.id} value={c.id}>{c.fullName} (Rating: {c.rating})</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="contractee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contractee (Client)</label>
                <select id="contractee" value={selectedContracteeId} onChange={e => setSelectedContracteeId(e.target.value)} className="mt-1 custom-select">
                  {contractees.map(c => <option key={c.id} value={c.id}>{c.fullName} (Rating: {c.rating})</option>)}
                </select>
              </div>
            </div>
          </Card>
          <Button type="submit" disabled={isLoading} className="w-full justify-center !py-3 !text-base">
            {isLoading ? 'Calculating...' : 'Calculate Suggested Price'}
          </Button>
        </form>

        <div className="lg:col-span-3">
          <Card className="min-h-full">
            <h2 className="text-xl font-semibold mb-4">3. Price Calculation</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 min-h-[300px] flex flex-col justify-center">
              {isLoading && (
                 <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Contacting Gemini Pricing AI...
                </div>
              )}
              {error && <p className="text-center text-red-500">{error}</p>}
              {!isLoading && !error && !priceResult && (
                <p className="text-center text-gray-500">Your price suggestion will appear here.</p>
              )}
              {priceResult && (
                <div>
                    <div className="flex border-b border-gray-300 dark:border-gray-600 mb-4">
                        <button onClick={() => setView('admin')} className={`px-4 py-2 text-sm font-medium ${view === 'admin' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            Admin View
                        </button>
                        <button onClick={() => setView('contractor')} className={`px-4 py-2 text-sm font-medium ${view === 'contractor' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            Contractor Preview
                        </button>
                        <button onClick={() => setView('contractee')} className={`px-4 py-2 text-sm font-medium ${view === 'contractee' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            Contractee Preview
                        </button>
                    </div>

                    {view === 'admin' && (
                        <div className="space-y-3 text-lg animate-fade-in">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">AI Base Price Suggestion</span>
                            <span className="font-medium text-gray-800 dark:text-gray-100">${priceResult.basePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400 pl-4">Contractor Adjustment ({selectedContractor?.rating}★)</span>
                            <span className={`font-medium ${priceResult.contractorAdjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                              {priceResult.contractorAdjustment >= 0 ? '+' : '-'} ${Math.abs(priceResult.contractorAdjustment).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400 pl-4">Contractee Adjustment ({selectedContractee?.rating}★)</span>
                             <span className={`font-medium ${priceResult.contracteeAdjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                              {priceResult.contracteeAdjustment >= 0 ? '+' : '-'} ${Math.abs(priceResult.contracteeAdjustment).toFixed(2)}
                            </span>
                          </div>
                           <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400 pl-4">{demand} Demand Adjustment</span>
                             <span className={`font-medium ${priceResult.demandAdjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                              {priceResult.demandAdjustment >= 0 ? '+' : '-'} ${Math.abs(priceResult.demandAdjustment).toFixed(2)}
                            </span>
                          </div>
                          <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                           <div className="flex justify-between items-center pt-2">
                            <span className="text-xl font-bold text-gray-800 dark:text-white">Final Suggested Price</span>
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${priceResult.finalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                    )}
                    
                    {view === 'contractor' && (
                        <div className="space-y-3 text-lg animate-fade-in">
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">Simulation of contractor's price view.</p>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">Base Price</span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">${priceResult.basePrice.toFixed(2)}</span>
                            </div>
                            {selectedContractor?.rating && selectedContractor.rating >= 4.5 ? (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 pl-4">Your Rating Adjustment ({selectedContractor.rating}★)</span>
                                    <span className={`font-medium ${priceResult.contractorAdjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {priceResult.contractorAdjustment >= 0 ? '+' : '-'} ${Math.abs(priceResult.contractorAdjustment).toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 pl-4">Rating Adjustment</span>
                                    <span className="italic text-gray-500 text-xs">Visible for ratings 4.5★ and up</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 pl-4">{demand} Demand Adjustment</span>
                                <span className={`font-medium ${priceResult.demandAdjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {priceResult.demandAdjustment >= 0 ? '+' : '-'} ${Math.abs(priceResult.demandAdjustment).toFixed(2)}
                                </span>
                            </div>
                             <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-bold text-gray-800 dark:text-white">Final Offer Price</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${priceResult.finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {view === 'contractee' && (
                        <div className="space-y-3 text-lg animate-fade-in">
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">Simulation of contractee's price view.</p>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">Base Price</span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">${priceResult.basePrice.toFixed(2)}</span>
                            </div>
                             {selectedContractee?.rating && selectedContractee.rating >= 4.5 ? (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 pl-4">Your Rating Discount ({selectedContractee.rating}★)</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        - ${Math.abs(priceResult.contracteeAdjustment).toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 pl-4">Rating Discount</span>
                                    <span className="italic text-gray-500 text-xs">Visible for ratings 4.5★ and up</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 pl-4">{demand} Demand Adjustment</span>
                                <span className={`font-medium ${priceResult.demandAdjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {priceResult.demandAdjustment >= 0 ? '+' : '-'} ${Math.abs(priceResult.demandAdjustment).toFixed(2)}
                                </span>
                            </div>
                             <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-bold text-gray-800 dark:text-white">Final Job Price</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${priceResult.finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
       <style>{`
        .custom-select {
          appearance: none;
          background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
          -webkit-appearance: none;
          -moz-appearance: none;
           display: block;
            width: 100%;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            border-width: 1px;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .dark .custom-select {
            border-color: rgb(75 85 99);
            background-color: rgb(55 65 81);
            color: rgb(229 231 235);
        }
        .custom-select:focus {
            outline: 2px solid transparent;
            outline-offset: 2px;
            --tw-ring-color: rgb(59 130 246);
            border-color: rgb(59 130 246);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AiPricingEngine;