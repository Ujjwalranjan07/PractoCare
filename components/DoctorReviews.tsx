'use client';

import { useState, useEffect } from 'react';
import { Review, reviewsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import '../app/styles/hover-fix.css';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ rating, size = 'md' }: StarRatingProps) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-md',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center ${sizeClass[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-yellow-400">
          {star <= Math.round(rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <StarRating rating={review.rating} />
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <p className="mt-2">{review.reviewText}</p>
      </CardContent>
    </Card>
  );
};

interface RatingDistributionProps {
  reviews: Review[];
}

const RatingDistribution = ({ reviews }: RatingDistributionProps) => {
  // Calculate rating distribution
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    distribution[review.rating as keyof typeof distribution]++;
  });

  const totalReviews = reviews.length;

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution];
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div key={rating} className="flex items-center gap-2">
            <div className="flex items-center w-12">
              <span className="font-medium">{rating}</span>
              <span className="ml-1 text-yellow-400">★</span>
            </div>
            <Progress value={percentage} className="h-2 flex-1" />
            <div className="w-12 text-right text-sm text-gray-500">{percentage}%</div>
          </div>
        );
      })}
    </div>
  );
};

interface DoctorReviewsProps {
  doctorId: string;
}

export default function DoctorReviews({ doctorId }: DoctorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewsAPI.getByDoctorId(doctorId);
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [doctorId]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const filteredReviews = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (activeTab !== 'all') {
      const ratingFilter = parseInt(activeTab);
      filtered = filtered.filter((review) => review.rating === ratingFilter);
    }

    // Sort reviews
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    return filtered;
  };

  if (isLoading) {
    return <div className="p-4">Loading reviews...</div>;
  }

  const averageRating = calculateAverageRating();
  const displayedReviews = filteredReviews();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
          <CardDescription>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-bold mb-2">{averageRating}</div>
              <StarRating rating={parseFloat(averageRating)} size="lg" />
              <p className="mt-2 text-sm text-gray-500">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Rating Distribution</h4>
              <RatingDistribution reviews={reviews} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="5">5 Star</TabsTrigger>
            <TabsTrigger value="4">4 Star</TabsTrigger>
            <TabsTrigger value="3">3 Star</TabsTrigger>
            <TabsTrigger value="2">2 Star</TabsTrigger>
            <TabsTrigger value="1">1 Star</TabsTrigger>
          </TabsList>
        </Tabs>

        <select
          className="border rounded p-2 ml-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'highest' | 'lowest')}
        >
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      <div className="space-y-4">
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <p className="text-center py-8 text-gray-500">
            {reviews.length > 0
              ? 'No reviews match the selected filters.'
              : 'No reviews yet. Be the first to leave a review!'}
          </p>
        )}
      </div>
    </div>
  );
}