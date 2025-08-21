'use client';

import { useState, useEffect } from 'react';
import { useSessionUser } from '@/lib/auth';
import Link from 'next/link';
import {
  PlusIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { signOut } from 'next-auth/react';

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

interface AuditLog {
  id: string;
  action: string;
  meta: any;
  createdAt: string;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, session, isAuthenticated } = useSessionUser();

  if (!isAuthenticated) {
    return null; // Will be redirected by useSessionUser
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resumes, jobs, runs (mocked for now)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setResumes([
          { id: '1', name: 'Software Engineer Resume', versions: 3, lastModified: '2024-01-15' },
          { id: '2', name: 'Product Manager Resume', versions: 2, lastModified: '2024-01-10' },
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

        // Fetch audit logs
        if (session?.accessToken) {
          const response = await fetch('/api/audit/logs?take=10&skip=0', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          if (response.ok) {
            const logs = await response.json();
            setAuditLogs(logs);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

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
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowRightOnRectangleIcon className="-ml-1 mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* ... existing stats cards ... */}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Runs */}
          <div className="bg-white shadow rounded-lg">{/* ... existing recent runs ... */}</div>

          {/* Activity Panel */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <pre className="text-xs text-gray-500">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">{/* ... existing quick actions ... */}</div>
        </div>
      </main>
    </div>
  );
}
