import { NextRequest, NextResponse } from 'next/server';
import { getDbData, ensureDbExists } from '@/lib/db-seed';

// GET handler for the root API endpoint
export async function GET(request: NextRequest) {
  try {
    // Ensure the database exists before trying to read it
    ensureDbExists();
    
    // Get the database data
    const data = getDbData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return NextResponse.json(
      { error: 'Failed to read database' },
      { status: 500 }
    );
  }
}