'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment, Review, reviewsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
  readOnly?: boolean;
}

const StarRating = ({ rating, setRating, readOnly = false }: StarRatingProps) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && setRating(star)}
          className={`text-2xl ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={readOnly}
          aria-label={`Rate ${star} stars out of 5`}
        >
          {star <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};

interface ReviewFormProps {
  appointment: Appointment;
  patientId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ appointment, patientId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkExistingReview = async () => {
      try {
        const review = await reviewsAPI.getByAppointmentId(appointment.id);
        setExistingReview(review);
        if (review) {
          setRating(review.rating);
          setReviewText(review.reviewText);
        }
      } catch (error) {
        console.error('Error checking existing review:', error);
        toast({
          title: 'Error',
          description: 'Failed to check if you already reviewed this appointment',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (appointment.status === 'completed') {
      checkExistingReview();
    } else {
      setIsLoading(false);
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId,
        rating,
        reviewText,
      };

      if (existingReview) {
        await reviewsAPI.update(existingReview.id, reviewData);
        toast({
          title: 'Success',
          description: 'Your review has been updated',
        });
      } else {
        await reviewsAPI.create(reviewData);
        toast({
          title: 'Success',
          description: 'Your review has been submitted',
        });
      }

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      router.refresh();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    setIsSubmitting(true);

    try {
      await reviewsAPI.delete(existingReview.id);
      toast({
        title: 'Success',
        description: 'Your review has been deleted',
      });
      setExistingReview(null);
      setRating(0);
      setReviewText('');

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (appointment.status !== 'completed') {
    return null;
  }

  const isEditable = !existingReview || (
    existingReview && new Date().getTime() - new Date(existingReview.createdAt).getTime() < 24 * 60 * 60 * 1000
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{existingReview ? 'Your Review' : 'Leave a Review'}</CardTitle>
        <CardDescription>
          {existingReview 
            ? isEditable 
              ? 'You can edit your review within 24 hours of submission.' 
              : 'This review can no longer be edited (24 hour period has passed).'
            : 'Share your experience with Dr. ' + appointment.doctorName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">Rating</label>
            <StarRating rating={rating} setRating={setRating} readOnly={!isEditable} />
          </div>
          <div className="space-y-2">
            <label htmlFor="reviewText" className="font-medium">Your Review</label>
            <Textarea
              id="reviewText"
              placeholder="Share your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={!isEditable}
              className="min-h-[100px] text-gray-900 dark:text-white"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {existingReview && isEditable && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDelete} 
              disabled={isSubmitting}
            >
              Delete Review
            </Button>
          )}
          {isEditable && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}