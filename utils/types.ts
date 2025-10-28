// Type definitions for the application

export interface FieldDefinition {
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'textarea';
  required: boolean;
  description?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
}

export interface ServiceSchema {
  serviceName: string;
  fields: FieldDefinition[];
  definitions?: Record<string, any>;
}

export interface SwaggerProperty {
  type: string;
  description?: string;
  enum?: string[];
  format?: string;
}

export interface SwaggerDefinition {
  type: string;
  properties?: Record<string, SwaggerProperty>;
  required?: string[];
}

export interface SwaggerSchema {
  basePath?: string;
  definitions?: Record<string, SwaggerDefinition>;
  paths?: Record<string, any>;
}
