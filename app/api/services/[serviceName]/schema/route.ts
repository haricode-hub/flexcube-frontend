import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseSwaggerSchema } from '@/utils/schemaParser';
import type { SwaggerSchema } from '@/utils/types';

/**
 * GET /api/services/[serviceName]/schema
 * Returns the parsed schema for a specific service
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceName: string }> }
) {
  try {
    const { serviceName } = await params;

    if (!serviceName) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Path to the swagger.json file
    const swaggerPath = path.join(
      process.cwd(),
      '..',
      'Rest Documentation',
      'Rest Documentation',
      serviceName,
      'swagger.json'
    );

    // Check if file exists
    if (!fs.existsSync(swaggerPath)) {
      return NextResponse.json(
        { error: `Swagger file not found for service: ${serviceName}` },
        { status: 404 }
      );
    }

    // Read and parse the swagger.json file
    const swaggerContent = fs.readFileSync(swaggerPath, 'utf-8');
    const swagger: SwaggerSchema = JSON.parse(swaggerContent);

    // Parse the schema to extract form fields
    const schema = parseSwaggerSchema(swagger, serviceName);

    return NextResponse.json({
      success: true,
      schema
    });
  } catch (error) {
    console.error('Error reading schema:', error);
    return NextResponse.json(
      { error: 'Failed to read schema', details: String(error) },
      { status: 500 }
    );
  }
}
