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

// GET /api/reviews/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = readDB();
    const review = db.reviews?.find((r: Review) => r.id === params.id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

// PATCH /api/reviews/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = readDB();
    const reviewData = await request.json();

    // Find the review index
    const reviewIndex = db.reviews?.findIndex((r: Review) => r.id === params.id);

    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if the review was created within the last 24 hours
    const reviewCreatedAt = new Date(db.reviews[reviewIndex].createdAt);
    const now = new Date();
    const hoursDifference = (now.getTime() - reviewCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      return NextResponse.json(
        { error: 'Reviews can only be edited within 24 hours of creation' },
        { status: 403 }
      );
    }

    // Update the review
    db.reviews[reviewIndex] = {
      ...db.reviews[reviewIndex],
      ...reviewData,
    };

    writeDB(db);

    // Update doctor's rating
    updateDoctorRating(db, db.reviews[reviewIndex].doctorId);

    return NextResponse.json(db.reviews[reviewIndex]);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE /api/reviews/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = readDB();

    // Find the review
    const reviewIndex = db.reviews?.findIndex((r: Review) => r.id === params.id);

    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if the review was created within the last 24 hours
    const reviewCreatedAt = new Date(db.reviews[reviewIndex].createdAt);
    const now = new Date();
    const hoursDifference = (now.getTime() - reviewCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      return NextResponse.json(
        { error: 'Reviews can only be deleted within 24 hours of creation' },
        { status: 403 }
      );
    }

    // Store doctor ID before removing the review
    const doctorId = db.reviews[reviewIndex].doctorId;

    // Remove the review
    db.reviews.splice(reviewIndex, 1);
    writeDB(db);

    // Update doctor's rating
    updateDoctorRating(db, doctorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
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
  } else {
    // No reviews left, reset rating
    const doctorIndex = db.doctors.findIndex((doctor: any) => doctor.id === doctorId);
    if (doctorIndex !== -1) {
      db.doctors[doctorIndex].rating = 0;
      db.doctors[doctorIndex].reviewCount = 0;
      writeDB(db);
    }
  }
}