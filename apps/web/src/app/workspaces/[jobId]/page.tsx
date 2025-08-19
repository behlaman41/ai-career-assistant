'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  PlayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Resume {
  id: string;
  name: string;
  uploadedAt: string;
  status: 'ready' | 'analyzing' | 'completed' | 'error';
  score?: number;
  suggestions?: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  createdAt: string;
}

interface AnalysisRun {
  id: string;
  resumeId: string;
  resumeName: string;
  status: 'running' | 'completed' | 'failed';
  score?: number;
  startedAt: string;
  completedAt?: string;
  suggestions?: string[];
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analysisRuns, setAnalysisRuns] = useState<AnalysisRun[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual data from API
    // Simulate API calls
    const fetchData = async () => {
      setLoading(true);

      // Mock job data
      const mockJob: Job = {
        id: jobId,
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        description: 'We are looking for a senior software engineer to join our team...',
        requirements: [
          '5+ years of experience in software development',
          'Proficiency in React, Node.js, and TypeScript',
          'Experience with cloud platforms (AWS, Azure)',
          'Strong problem-solving skills',
          "Bachelor's degree in Computer Science or related field",
        ],
        createdAt: '2024-01-15T10:00:00Z',
      };

      // Mock resumes data
      const mockResumes: Resume[] = [
        {
          id: '1',
          name: 'John_Doe_Resume_2024.pdf',
          uploadedAt: '2024-01-10T14:30:00Z',
          status: 'completed',
          score: 85,
          suggestions: [
            'Add more specific examples of React projects',
            'Include cloud platform certifications',
            'Highlight leadership experience',
          ],
        },
        {
          id: '2',
          name: 'John_Doe_Resume_Updated.pdf',
          uploadedAt: '2024-01-12T09:15:00Z',
          status: 'ready',
        },
        {
          id: '3',
          name: 'John_Doe_Resume_Final.pdf',
          uploadedAt: '2024-01-14T16:45:00Z',
          status: 'analyzing',
        },
      ];

      // Mock analysis runs
      const mockRuns: AnalysisRun[] = [
        {
          id: 'run-1',
          resumeId: '1',
          resumeName: 'John_Doe_Resume_2024.pdf',
          status: 'completed',
          score: 85,
          startedAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:32:00Z',
          suggestions: [
            'Add more specific examples of React projects',
            'Include cloud platform certifications',
            'Highlight leadership experience',
          ],
        },
        {
          id: 'run-2',
          resumeId: '2',
          resumeName: 'John_Doe_Resume_Updated.pdf',
          status: 'running',
          startedAt: '2024-01-15T11:00:00Z',
        },
      ];

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setJob(mockJob);
      setResumes(mockResumes);
      setAnalysisRuns(mockRuns);
      setLoading(false);
    };

    fetchData();
  }, [jobId]);

  const runAnalysis = async () => {
    if (!selectedResume) return;

    setIsRunningAnalysis(true);

    // TODO: Implement actual analysis API call
    // const response = await fetch('/api/runs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ resumeId: selectedResume, jobId }),
    // });

    // Simulate analysis
    const newRun: AnalysisRun = {
      id: `run-${Date.now()}`,
      resumeId: selectedResume,
      resumeName: resumes.find((r) => r.id === selectedResume)?.name || 'Unknown',
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    setAnalysisRuns((prev) => [newRun, ...prev]);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setAnalysisRuns((prev) =>
        prev.map((run) =>
          run.id === newRun.id
            ? {
                ...run,
                status: 'completed',
                score: Math.floor(Math.random() * 30) + 70, // Random score 70-100
                completedAt: new Date().toISOString(),
                suggestions: [
                  'Tailor your experience section to match job requirements',
                  'Add relevant keywords from the job description',
                  'Quantify your achievements with specific metrics',
                ],
              }
            : run,
        ),
      );
      setIsRunningAnalysis(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
      case 'analyzing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-2">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600">{job.company}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Details */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Run Analysis */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Run Analysis</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedResume || ''}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a resume to analyze</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={runAnalysis}
                  disabled={!selectedResume || isRunningAnalysis}
                  className={clsx(
                    'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md',
                    selectedResume && !isRunningAnalysis
                      ? 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed',
                  )}
                >
                  {isRunningAnalysis ? (
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <PlayIcon className="h-4 w-4 mr-2" />
                  )}
                  {isRunningAnalysis ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {analysisRuns.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No analysis runs yet</p>
                    <p className="text-sm">Select a resume and run an analysis to get started.</p>
                  </div>
                ) : (
                  analysisRuns.map((run) => (
                    <div key={run.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(run.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{run.resumeName}</p>
                            <p className="text-sm text-gray-500">
                              Started {new Date(run.startedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {run.score && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Compatibility Score</p>
                              <p className={clsx('text-2xl font-bold', getScoreColor(run.score))}>
                                {run.score}%
                              </p>
                            </div>
                          )}

                          {run.status === 'completed' && (
                            <div className="flex space-x-2">
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View
                              </button>
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Optimize
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {run.suggestions && run.suggestions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h4>
                          <ul className="space-y-1">
                            {run.suggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 flex items-start space-x-2"
                              >
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
