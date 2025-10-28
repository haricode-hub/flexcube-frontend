'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      } else {
        setError(data.error || 'Failed to load services');
      }
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            FLEXCUBE Automation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dynamic form generation for FLEXCUBE services. Select a service from the navigation bar or browse available services below.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{services.length}</div>
              <div className="text-gray-600 mt-2">Total Services</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">100%</div>
              <div className="text-gray-600 mt-2">Dynamic</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">Auto</div>
              <div className="text-gray-600 mt-2">Form Generation</div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchServices}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 12).map((service) => (
                <Link
                  key={service}
                  href={`/service/${service}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && services.length > 12 && (
            <div className="mt-6 text-center text-gray-600">
              <p>Showing 12 of {services.length} services. Use the navigation bar to access all services.</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dynamic Forms</h3>
            <p className="text-gray-600 text-sm">
              Forms are automatically generated from Swagger schemas
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Responsive</h3>
            <p className="text-gray-600 text-sm">
              Built with Next.js and Tailwind CSS for optimal performance
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-purple-600 text-3xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation</h3>
            <p className="text-gray-600 text-sm">
              Built-in form validation based on required fields
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
