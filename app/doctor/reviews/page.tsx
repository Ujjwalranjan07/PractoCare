'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ModernNavbar } from "@/components/ModernNavbar";
import DoctorReviews from '@/components/DoctorReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DoctorReviewsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400"
                  style={{ animation: 'spin 1.5s linear infinite' }}
                />
              </div>
              <p className="mt-6 text-lg text-gray-600">Loading your reviews...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Patient Reviews
                </h1>
                <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                  See what your patients are saying about your care
                </p>
              </div>

              <div className="mb-8">
                <DoctorReviews doctorId={user?.id || ''} />
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}