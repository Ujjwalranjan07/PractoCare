import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Review } from '@/lib/api';

const DB_PATH = path.join(process.cwd(), 'db.json');

// Helper function to read the database
function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Helper function to write to the database
function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');

    const db = readDB();
    let reviews = db.reviews || [];

    if (doctorId) {
      reviews = reviews.filter((review: Review) => review.doctorId === doctorId);
    }

    if (patientId) {
      reviews = reviews.filter((review: Review) => review.patientId === patientId);
    }

    if (appointmentId) {
      reviews = reviews.filter((review: Review) => review.appointmentId === appointmentId);
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const db = readDB();
    const reviewData = await request.json();

    // Validate required fields
    if (!reviewData.appointmentId || !reviewData.doctorId || !reviewData.patientId || !reviewData.rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a review already exists for this appointment
    const existingReview = db.reviews?.find(
      (review: Review) => review.appointmentId === reviewData.appointmentId
    );

    if (existingReview) {
      return NextResponse.json(
        { error: 'A review already exists for this appointment' },
        { status: 409 }
      );
    }

    // Create new review
    const newReview = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Add to database
    if (!db.reviews) {
      db.reviews = [];
    }
    db.reviews.push(newReview);
    writeDB(db);

    // Update doctor's rating
    updateDoctorRating(db, newReview.doctorId);

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

// Helper function to update doctor's rating
function updateDoctorRating(db: any, doctorId: string) {
  const doctorReviews = db.reviews.filter((review: Review) => review.doctorId === doctorId);
  
  if (doctorReviews.length > 0) {
    const totalRating = doctorReviews.reduce(
      (sum: number, review: Review) => sum + review.rating, 0
    );
    const averageRating = totalRating / doctorReviews.length;
    
    // Find the doctor and update rating
    const doctorIndex = db.doctors.findIndex((doctor: any) => doctor.id === doctorId);
    if (doctorIndex !== -1) {
      db.doctors[doctorIndex].rating = parseFloat(averageRating.toFixed(1));
      db.doctors[doctorIndex].reviewCount = doctorReviews.length;
      writeDB(db);
    }
  }
}