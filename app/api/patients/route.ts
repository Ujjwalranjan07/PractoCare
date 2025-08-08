import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for patients
export async function GET(request: NextRequest) {
  try {
    const data = readDbFile();
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
    const data = readDbFile();
    const newPatient = await request.json();
    
    // Add ID if not provided
    if (!newPatient.id) {
      newPatient.id = Date.now().toString();
    }
    
    data.patients.push(newPatient);
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}