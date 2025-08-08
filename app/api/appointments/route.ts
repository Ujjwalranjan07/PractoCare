import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for appointments
export async function GET(request: NextRequest) {
  try {
    const data = readDbFile();
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
    const data = readDbFile();
    const newAppointment = await request.json();
    
    // Add ID if not provided
    if (!newAppointment.id) {
      newAppointment.id = Date.now().toString();
    }
    
    data.appointments.push(newAppointment);
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}