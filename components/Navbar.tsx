'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  services?: string[];
}

export default function Navbar({ services: initialServices }: NavbarProps) {
  const [services, setServices] = useState<string[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialServices) {
      fetchServices();
    }
  }, [initialServices]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentService = () => {
    const match = pathname.match(/\/service\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const currentService = getCurrentService();

  const handleServiceSelect = (serviceName: string) => {
    router.push(`/service/${serviceName}`);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="shrink-0">
              <h1 className="text-xl font-bold text-blue-600">FLEXCUBE Automation</h1>
            </Link>
          </div>

          {/* Service Dropdown */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {currentService || 'Select a Service...'}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden z-50">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      autoFocus
                    />
                  </div>

                  {/* Services List */}
                  <div className="overflow-y-auto max-h-80">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No services found</div>
                    ) : (
                      <ul className="py-2">
                        {filteredServices.map((service) => (
                          <li key={service}>
                            <button
                              onClick={() => handleServiceSelect(service)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                currentService === service
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-700'
                              }`}
                            >
                              {service}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 text-center">
                    {filteredServices.length} of {services.length} services
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Count */}
          <div className="text-sm text-gray-600">
            {services.length} Services
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
