import { SwaggerSchema, SwaggerDefinition, ServiceSchema, FieldDefinition } from './types';

/**
 * Parse a Swagger JSON schema and extract field definitions
 * Extracts from BOTH paths (API parameters) AND definitions (DTOs)
 */
export function parseSwaggerSchema(swagger: SwaggerSchema, serviceName: string): ServiceSchema {
  const fields: FieldDefinition[] = [];
  const fieldNames = new Set<string>(); // To avoid duplicates
  const endpoints: ApiEndpoint[] = [];

  // 1. Extract endpoints from API paths
  if (swagger.paths) {
    Object.entries(swagger.paths).forEach(([path, pathItem]: [string, any]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (typeof operation === 'object' && operation.summary) {
          endpoints.push({
            path: (swagger.basePath || '') + path,
            method: method.toUpperCase(),
            summary: operation.summary
          });
        }
      });
    });
  }

  // 2. Extract parameters from API paths (headers, query params, body params)
  if (swagger.paths) {
    Object.values(swagger.paths).forEach((pathItem: any) => {
      Object.values(pathItem).forEach((operation: any) => {
        if (operation.parameters && Array.isArray(operation.parameters)) {
          operation.parameters.forEach((param: any) => {
            // Only include header, query, and formData parameters (not path params)
            if (['header', 'query', 'formData'].includes(param.in) && !fieldNames.has(param.name)) {
              const field: FieldDefinition = {
                name: param.name,
                type: mapSwaggerTypeToFieldType(param.type, param.enum),
                required: param.required || false,
                description: param.description || '',
                options: param.enum
              };
              fields.push(field);
              fieldNames.add(param.name);
            }
          });
        }
      });
    });
  }

  // 2. Extract fields from definitions (DTOs)
  if (swagger.definitions) {
    const definitions = swagger.definitions;
    const definitionKeys = Object.keys(definitions);

    // Try to find the main input definition
    const mainDefinition = findMainDefinition(definitions, definitionKeys);

    if (mainDefinition) {
      const def = definitions[mainDefinition];
      const requiredFields = def.required || [];

      if (def.properties) {
        // Include ALL fields (both required and optional)
        Object.entries(def.properties).forEach(([propName, propDef]) => {
          if (!fieldNames.has(propName)) {
            const field = createFieldDefinition(propName, propDef, requiredFields);
            fields.push(field);
            fieldNames.add(propName);
          }
        });
      }
    }
  }

  return { serviceName, fields, endpoints };
}

/**
 * Map Swagger type to field type
 */
function mapSwaggerTypeToFieldType(swaggerType: string, enumValues?: string[]): FieldDefinition['type'] {
  if (enumValues && enumValues.length > 0) {
    return 'dropdown';
  }

  switch (swaggerType) {
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'checkbox';
    default:
      return 'text';
  }
}

/**
 * Find the main definition to use for form generation
 * Priority: definitions ending with Input, Request, Dto
 */
function findMainDefinition(definitions: Record<string, SwaggerDefinition>, keys: string[]): string | null {
  // Priority patterns
  const patterns = ['Input', 'Request', 'Dto', 'Create', 'Update'];

  for (const pattern of patterns) {
    const found = keys.find(key => key.endsWith(pattern));
    if (found) return found;
  }

  // Return first definition if no pattern matches
  return keys.length > 0 ? keys[0] : null;
}

/**
 * Create a field definition from a Swagger property
 */
function createFieldDefinition(
  name: string,
  property: any,
  requiredFields: string[]
): FieldDefinition {
  const isRequired = requiredFields.includes(name);
  const description = property.description || '';

  let type: FieldDefinition['type'] = 'text';
  let options: string[] | undefined;

  // Determine field type based on Swagger type
  if (property.enum) {
    type = 'dropdown';
    options = property.enum;
  } else if (property.type === 'number' || property.type === 'integer') {
    type = 'number';
  } else if (property.type === 'boolean') {
    type = 'checkbox';
  } else if (property.type === 'string') {
    // Long descriptions might benefit from textarea
    if (name.toLowerCase().includes('description') ||
        name.toLowerCase().includes('comment') ||
        name.toLowerCase().includes('note')) {
      type = 'textarea';
    } else {
      type = 'text';
    }
  }

  return {
    name,
    type,
    required: isRequired,
    description,
    options
  };
}

/**
 * Get all definitions from a swagger schema
 * Useful for displaying multiple forms or nested objects
 */
export function getAllDefinitions(swagger: SwaggerSchema): string[] {
  if (!swagger.definitions) return [];
  return Object.keys(swagger.definitions);
}
