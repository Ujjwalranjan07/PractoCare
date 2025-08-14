import { NextRequest, NextResponse } from 'next/server';
import { getDbData, ensureDbExists } from '@/lib/db-seed';

// GET handler for a patient's medical history
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure the database exists before trying to read it
    ensureDbExists();
    
    // Get the database data
    const data = getDbData();
    const patientId = params.id;
    
    // Find the patient
    const patient = data.patients.find((p: any) => p.id === patientId);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Get all appointments for this patient
    const appointments = data.appointments.filter((a: any) => a.patientId === patientId);
    
    // Get all prescriptions for this patient
    const prescriptions = data.prescriptions.filter((p: any) => p.patientId === patientId);
    
    // Combine the data into a medical history object
    // Sort by date (most recent first)
    const sortedAppointments = [...appointments].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    const sortedPrescriptions = [...prescriptions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Create a chronological history with both appointments and prescriptions
    const medicalHistory = sortedAppointments.map(appointment => {
      // Find any prescriptions associated with this appointment
      const relatedPrescriptions = sortedPrescriptions.filter(
        prescription => prescription.appointmentId === appointment.id
      );
      
      return {
        date: appointment.date,
        type: 'appointment',
        details: appointment,
        prescriptions: relatedPrescriptions
      };
    });
    
    // Add any prescriptions that aren't associated with appointments
    const unlinkedPrescriptions = sortedPrescriptions.filter(
      prescription => !sortedAppointments.some(app => app.id === prescription.appointmentId)
    );
    
    unlinkedPrescriptions.forEach(prescription => {
      medicalHistory.push({
        date: prescription.date,
        type: 'prescription',
        details: null,
        prescriptions: [prescription]
      });
    });
    
    // Sort the combined history by date (most recent first)
    const sortedHistory = medicalHistory.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Return the medical history
    return NextResponse.json({
      patient,
      history: sortedHistory,
      stats: {
        totalAppointments: appointments.length,
        totalPrescriptions: prescriptions.length
      }
    });
  } catch (error) {
    console.error('Error reading medical history:', error);
    return NextResponse.json(
      { error: 'Failed to read medical history' },
      { status: 500 }
    );
  }
}