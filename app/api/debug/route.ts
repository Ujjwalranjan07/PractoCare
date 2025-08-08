import { NextResponse } from 'next/server';
import { ensureDbExists, getDbData } from '@/lib/db-seed';

// This endpoint is used to debug server connectivity issues
export async function GET() {
  try {
    // Ensure the database exists
    await ensureDbExists();
    
    // Try to read the database
    const data = await getDbData();
    
    // Return a success response with diagnostic information
    return NextResponse.json({
      status: 'ok',
      message: 'Server is running correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: {
        exists: true,
        doctorsCount: data.doctors?.length || 0,
        patientsCount: data.patients?.length || 0,
        appointmentsCount: data.appointments?.length || 0
      }
    }, { status: 200 });
  } catch (error) {
    // Return detailed error information
    return NextResponse.json({
      status: 'error',
      message: 'Server encountered an error',
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}