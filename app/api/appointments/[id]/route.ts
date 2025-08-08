import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read the db.json file
function readDbFile() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// GET handler for a specific appointment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    const appointment = data.appointments.find((a: any) => a.id === params.id);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error reading appointment data:', error);
    return NextResponse.json(
      { error: 'Failed to read appointment data' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating an appointment
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    const appointmentIndex = data.appointments.findIndex((a: any) => a.id === params.id);
    
    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    const updateData = await request.json();
    data.appointments[appointmentIndex] = { ...data.appointments[appointmentIndex], ...updateData };
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(data.appointments[appointmentIndex]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an appointment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = readDbFile();
    const appointmentIndex = data.appointments.findIndex((a: any) => a.id === params.id);
    
    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Remove the appointment
    const deletedAppointment = data.appointments[appointmentIndex];
    data.appointments.splice(appointmentIndex, 1);
    
    // Write back to db.json
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json(deletedAppointment);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}