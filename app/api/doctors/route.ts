import { NextRequest, NextResponse } from 'next/server';
import { getDbData, ensureDbExists } from '@/lib/db-seed';

// GET handler for doctors
export async function GET(request: NextRequest) {
  try {
    // Ensure the database exists before trying to read it
    ensureDbExists();
    
    // Get the database data
    const data = getDbData();
    return NextResponse.json(data.doctors);
  } catch (error) {
    console.error('Error reading doctors data:', error);
    return NextResponse.json(
      { error: 'Failed to read doctors data' },
      { status: 500 }
    );
  }
}

// POST handler for doctors
export async function POST(request: NextRequest) {
  try {
    // Ensure the database exists before trying to modify it
    ensureDbExists();
    
    // Get the current database data
    const data = getDbData();
    const newDoctor = await request.json();
    
    // Add ID if not provided
    if (!newDoctor.id) {
      newDoctor.id = Date.now().toString();
    }
    
    // Add the new doctor to the data
    data.doctors.push(newDoctor);
    
    // Write the updated data back to the database
    const { writeDbData } = await import('@/lib/db-seed');
    writeDbData(data);
    
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}