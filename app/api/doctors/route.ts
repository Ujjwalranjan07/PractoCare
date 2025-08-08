import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for doctors
export async function GET(request: NextRequest) {
  try {
    const data = readDbFile();
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
    const data = readDbFile();
    const newDoctor = await request.json();
    
    // Add ID if not provided
    if (!newDoctor.id) {
      newDoctor.id = Date.now().toString();
    }
    
    data.doctors.push(newDoctor);
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}