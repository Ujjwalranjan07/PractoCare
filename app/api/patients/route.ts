import { NextRequest, NextResponse } from 'next/server';
import { getDbData, ensureDbExists } from '@/lib/db-seed';

// GET handler for patients
export async function GET(request: NextRequest) {
  try {
    // Ensure the database exists before trying to read it
    ensureDbExists();
    
    // Get the database data
    const data = getDbData();
    return NextResponse.json(data.patients);
  } catch (error) {
    console.error('Error reading patients data:', error);
    return NextResponse.json(
      { error: 'Failed to read patients data' },
      { status: 500 }
    );
  }
}

// POST handler for patients
export async function POST(request: NextRequest) {
  try {
    // Ensure the database exists before trying to modify it
    ensureDbExists();
    
    // Get the current database data
    const data = getDbData();
    const newPatient = await request.json();
    
    // Add ID if not provided
    if (!newPatient.id) {
      newPatient.id = Date.now().toString();
    }
    
    // Add the new patient to the data
    data.patients.push(newPatient);
    
    // Write the updated data back to the database
    const { writeDbData } = await import('@/lib/db-seed');
    writeDbData(data);
    
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}