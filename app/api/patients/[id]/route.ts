import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for a specific patient
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    const patient = data.patients.find((p: any) => p.id === params.id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error reading patient data:', error);
    return NextResponse.json(
      { error: 'Failed to read patient data' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a patient
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    const patientIndex = data.patients.findIndex((p: any) => p.id === params.id);
    
    if (patientIndex === -1) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    const updateData = await request.json();
    data.patients[patientIndex] = { ...data.patients[patientIndex], ...updateData };
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(data.patients[patientIndex]);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}