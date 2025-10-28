import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/services
 * Returns a list of all available services from the Rest Documentation folder
 */
export async function GET() {
  try {
    // Path to the Rest Documentation folder
    const restDocPath = path.join(process.cwd(), '..', 'Rest Documentation', 'Rest Documentation');

    // Check if directory exists
    if (!fs.existsSync(restDocPath)) {
      return NextResponse.json(
        { error: 'Rest Documentation folder not found' },
        { status: 404 }
      );
    }

    // Read all directories in the Rest Documentation folder
    const entries = fs.readdirSync(restDocPath, { withFileTypes: true });

    // Filter only directories that contain a swagger.json file
    const services = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(serviceName => {
        const swaggerPath = path.join(restDocPath, serviceName, 'swagger.json');
        return fs.existsSync(swaggerPath);
      })
      .sort();

    return NextResponse.json({
      success: true,
      services,
      count: services.length
    });
  } catch (error) {
    console.error('Error reading services:', error);
    return NextResponse.json(
      { error: 'Failed to read services', details: String(error) },
      { status: 500 }
    );
  }
}
