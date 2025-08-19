'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Resume {
  id: string;
  name: string;
  versions: number;
  lastModified: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  status: 'active' | 'completed';
  runs: number;
  lastRun?: string;
}

interface RecentRun {
  id: string;
  jobTitle: string;
  company: string;
  score: number;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch data from API
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setResumes([
          {
            id: '1',
            name: 'Software Engineer Resume',
            versions: 3,
            lastModified: '2024-01-15',
          },
          {
            id: '2',
            name: 'Product Manager Resume',
            versions: 2,
            lastModified: '2024-01-10',
          },
        ]);
        
        setJobs([
          {
            id: '1',
            title: 'Senior Frontend Developer',
            company: 'TechCorp',
            status: 'active',
            runs: 5,
            lastRun: '2024-01-15',
          },
          {
            id: '2',
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            status: 'active',
            runs: 2,
            lastRun: '2024-01-12',
          },
        ]);
        
        setRecentRuns([
          {
            id: '1',
            jobTitle: 'Senior Frontend Developer',
            company: 'TechCorp',
            score: 87,
            status: 'completed',
            createdAt: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            jobTitle: 'Full Stack Engineer',
            company: 'StartupXYZ',
            score: 92,
            status: 'completed',
            createdAt: '2024-01-12T14:20:00Z',
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's an overview of your resume optimization progress.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/uploads"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Upload Resume
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Resumes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {resumes.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.filter(job => job.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Runs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.reduce((sum, job) => sum + job.runs, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recentRuns.length > 0
                        ? Math.round(
                            recentRuns.reduce((sum, run) => sum + run.score, 0) /
                              recentRuns.length
                          )
                        : 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Runs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Analysis Runs
              </h3>
              <div className="space-y-4">
                {recentRuns.length > 0 ? (
                  recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {run.jobTitle}
                        </p>
                        <p className="text-sm text-gray-500">{run.company}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={clsx(
                            'text-lg font-semibold',
                            getScoreColor(run.score)
                          )}
                        >
                          {run.score}%
                        </span>
                        <span
                          className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            getStatusColor(run.status)
                          )}
                        >
                          {run.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No analysis runs yet. Upload a resume and create a job to get started.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/uploads"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  Upload New Resume
                </Link>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  Add Job Description
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <ChartBarIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}