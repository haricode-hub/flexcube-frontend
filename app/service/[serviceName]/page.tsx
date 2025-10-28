'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DynamicForm from '@/components/DynamicForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { ServiceSchema } from '@/utils/types';

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceName = params.serviceName as string;

  const [schema, setSchema] = useState<ServiceSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceName) {
      fetchSchema();
    }
  }, [serviceName]);

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${serviceName}/schema`);
      const data = await response.json();

      if (data.success) {
        setSchema(data.schema);
      } else {
        setError(data.error || 'Failed to load schema');
      }
    } catch (err) {
      setError('Failed to fetch schema. Please try again.');
      console.error('Error fetching schema:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
          <p className="text-center text-gray-600 mt-4">Loading {serviceName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg
                className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Services
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={fetchSchema}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg
                className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Services
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No schema found for this service.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 border border-yellow-300 text-yellow-800 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{serviceName}</span>
          </nav>

          <button
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <svg
              className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Services
          </button>
        </div>

        <DynamicForm schema={schema} />
      </div>
    </div>
  );
}
