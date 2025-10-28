'use client';

import { useState, FormEvent } from 'react';
import type { ServiceSchema, FieldDefinition } from '@/utils/types';

interface DynamicFormProps {
  schema: ServiceSchema;
}

/**
 * Format field name for display (make it consistent and readable)
 * Examples:
 * - "customerId" → "Customer Id"
 * - "BRANCH" → "Branch"
 * - "SOURCE" → "Source"
 * - "account_number" → "Account Number"
 * - "AccountClass" → "Account Class"
 */
function formatFieldLabel(fieldName: string): string {
  // First, handle snake_case and kebab-case
  let formatted = fieldName.replace(/_/g, ' ').replace(/-/g, ' ');

  // Check if the entire string is uppercase (like "BRANCH", "SOURCE")
  const isAllCaps = formatted === formatted.toUpperCase() && /[A-Z]/.test(formatted);

  if (isAllCaps) {
    // If all caps, just convert to Title Case
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    // Handle camelCase: Add space before capital letters that follow lowercase
    // This prevents "SOURCE" from becoming "S O U R C E"
    formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize first letter of each word
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return formatted.trim();
}

export default function DynamicForm({ schema }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    schema.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${formatFieldLabel(field.name)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmittedData(formData);
      console.log('Form submitted:', formData);
    }
  };

  const handleReset = () => {
    setFormData({});
    setSubmittedData(null);
    setErrors({});
  };

  const renderField = (field: FieldDefinition) => {
    const commonClasses = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
    const errorClasses = errors[field.name] ? "border-red-500" : "border-gray-300";

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            placeholder={field.description || `Enter ${formatFieldLabel(field.name)}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || '')}
            className={`${commonClasses} ${errorClasses}`}
            placeholder={field.description || `Enter ${formatFieldLabel(field.name)}`}
          />
        );

      case 'dropdown':
        return (
          <select
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
          >
            <option value="">Select {formatFieldLabel(field.name)}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.name} className="ml-3 text-sm text-gray-700">
              {field.description || formatFieldLabel(field.name)}
            </label>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses} min-h-[100px]`}
            placeholder={field.description || `Enter ${formatFieldLabel(field.name)}`}
            rows={4}
          />
        );

      default:
        return (
          <input
            type="text"
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            placeholder={field.description || `Enter ${formatFieldLabel(field.name)}`}
          />
        );
    }
  };

  if (schema.fields.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          No form fields could be extracted from this service schema.
        </p>
        <p className="text-sm text-yellow-600 mt-2">
          The swagger.json file may not contain input definitions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{schema.serviceName}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the required fields below
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schema.fields.map((field) => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {formatFieldLabel(field.name)}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {field.description && field.type !== 'checkbox' && (
                <p className="mt-1 text-xs text-gray-500">{field.description}</p>
              )}
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Submitted Data Display */}
      {submittedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            Submitted Data
          </h3>
          <pre className="bg-white p-4 rounded border border-green-200 overflow-x-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
