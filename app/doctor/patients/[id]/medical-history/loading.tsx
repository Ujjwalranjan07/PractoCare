import { ModernNavbar } from "@/components/ModernNavbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <ModernNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Skeleton className="h-9 w-20 mr-4" />
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Patient Info Card Skeleton */}
        <Card className="mb-8 border border-teal-100 bg-gradient-to-br from-white to-teal-50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <Skeleton className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <Skeleton className="h-4 w-36 mb-1 sm:mb-0" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-16 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History Timeline Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          
          {Array(3).fill(0).map((_, index) => (
            <Card key={index} className="border border-slate-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, idx) => (
                      <div key={idx}>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-36" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Skeleton className="h-px w-full my-4" />
                
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="space-y-3">
                  {Array(2).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-24 w-full rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}