import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for a specific doctor
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    // In Next.js App Router, params are already available and don't need to be awaited
    // The error is likely due to a type mismatch, so we'll convert to string explicitly
    const doctorId = String(params.id);
    const doctor = data.doctors.find((doc: any) => String(doc.id) === doctorId);
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Error reading doctor data:', error);
    return NextResponse.json(
      { error: 'Failed to read doctor data' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a doctor
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    const doctorIndex = data.doctors.findIndex((doc: any) => doc.id === params.id);
    
    if (doctorIndex === -1) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    const updateData = await request.json();
    data.doctors[doctorIndex] = { ...data.doctors[doctorIndex], ...updateData };
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(data.doctors[doctorIndex]);
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}