import React, { useState } from 'react';
import { generateAdCopy, generateCampaignSuggestions, CampaignSuggestion } from '../services/geminiService';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { MOCK_JOBS, MOCK_USERS } from '../constants';
import { JobStatus, UserRole } from '../types';

const AiMarketing: React.FC = () => {
  const [segment, setSegment] = useState('Homeowners in San Salvador');
  const [category, setCategory] = useState('Plumbing');
  const [platform, setPlatform] = useState('Facebook');
  const [adCopy, setAdCopy] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<CampaignSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formErrors, setFormErrors] = useState<{ segment?: string; category?: string }>({});

  const validateForm = () => {
    const newErrors: { segment?: string; category?: string } = {};
    if (!segment.trim()) newErrors.segment = "Target audience segment is required.";
    if (!category.trim()) newErrors.category = "Service category is required.";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setAdCopy('');

    try {
      const result = await generateAdCopy(segment, category, platform);
      setAdCopy(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    setError(null);
    
    const categoryCounts = MOCK_JOBS.reduce((acc, job) => {
        acc[job.title] = (acc[job.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    
    const popularCategories = sortedCategories.map(([title, count]) => `${title} (${count} jobs)`).join(', ');
    const completedJobs = MOCK_JOBS.filter(j => j.status === JobStatus.Completed).length;
    const activeJobs = MOCK_JOBS.filter(j => j.status === JobStatus.Active).length;
    const contractorCount = MOCK_USERS.filter(u => u.role === UserRole.Contractor).length;

    const dataSummary = `
- Total Contractors: ${contractorCount}
- Job Status Breakdown: ${completedJobs} completed, ${activeJobs} active jobs.
- Top 5 Most Requested Service Categories: ${popularCategories}.
- Geographic Focus: All jobs are currently located in San Salvador.
    `;

    try {
        const result = await generateCampaignSuggestions(dataSummary);
        setSuggestions(result);
    } catch (err: any) {
        setError(err.message || 'Failed to generate campaign suggestions.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleUseSuggestion = (suggestion: CampaignSuggestion) => {
    setSegment(suggestion.segment);
    setCategory(suggestion.category);
    setPlatform(suggestion.platform);
    setFormErrors({});
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI Marketing Assistant</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Use Gemini to analyze market data and generate targeted ad copy.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <h2 className="text-xl font-semibold mb-4">1. AI Campaign Suggestions</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Let Gemini analyze your app's data to suggest effective marketing campaigns.
                </p>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full justify-center">
                    {isAnalyzing ? 'Analyzing Data...' : 'Analyze & Suggest Campaigns'}
                </Button>
                <div className="mt-6 space-y-4">
                    {isAnalyzing && (
                        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                            <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating suggestions...
                        </div>
                    )}
                    {suggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{s.category} on {s.platform}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For: {s.segment}</p>
                            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">{s.rationale}</p>
                            <div className="text-right mt-3">
                                <Button onClick={() => handleUseSuggestion(s)} variant="secondary" className="text-xs px-3 py-1">
                                    Use Suggestion
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">2. Generate Ad Copy</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Fill in the details below or use a suggestion, then generate the ad copy.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        id="segment"
                        label="Target Audience Segment"
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        required
                      />
                      {formErrors.segment && <p className="mt-1 text-xs text-red-500">{formErrors.segment}</p>}
                    </div>
                    <div>
                      <Input
                        id="category"
                        label="Service Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      />
                      {formErrors.category && <p className="mt-1 text-xs text-red-500">{formErrors.category}</p>}
                    </div>
                    <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Platform
                    </label>
                    <select
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option>Facebook</option>
                        <option>Instagram</option>
                        <option>TikTok</option>
                        <option>Google Ads</option>
                    </select>
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={isLoading} className="w-full justify-center">
                        {isLoading ? 'Generating...' : 'Generate Ad Copy'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>

        <div className="lg:col-span-3">
            <Card>
                <h2 className="text-xl font-semibold mb-4">3. Generated Ad Copy</h2>
                <div className="prose prose-sm sm:prose dark:prose-invert max-w-none p-4 min-h-[300px] bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700">
                    {isLoading && <p className="text-gray-500">Generating copy with Gemini...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {adCopy && <pre className="whitespace-pre-wrap font-sans">{adCopy}</pre>}
                    {!isLoading && !error && !adCopy && (
                    <p className="text-gray-500">Your generated ad copy will appear here.</p>
                    )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AiMarketing;
