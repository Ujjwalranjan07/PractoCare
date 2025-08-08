import { NextRequest, NextResponse } from 'next/server';
import { getDbData, ensureDbExists } from '@/lib/db-seed';

// GET handler for appointments
export async function GET(request: NextRequest) {
  try {
    // Ensure the database exists before trying to read it
    ensureDbExists();
    
    // Get the database data
    const data = getDbData();
    return NextResponse.json(data.appointments);
  } catch (error) {
    console.error('Error reading appointments data:', error);
    return NextResponse.json(
      { error: 'Failed to read appointments data' },
      { status: 500 }
    );
  }
}

// POST handler for appointments
export async function POST(request: NextRequest) {
  try {
    // Ensure the database exists before trying to modify it
    ensureDbExists();
    
    // Get the current database data
    const data = getDbData();
    const newAppointment = await request.json();
    
    // Add ID if not provided
    if (!newAppointment.id) {
      newAppointment.id = Date.now().toString();
    }
    
    // Add the new appointment to the data
    data.appointments.push(newAppointment);
    
    // Write the updated data back to the database
    const { writeDbData } = await import('@/lib/db-seed');
    writeDbData(data);
    
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}