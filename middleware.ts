import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // For API routes, add cache control headers
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Set cache control headers to prevent caching of API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  // Note: Authentication is handled client-side through the AuthContext and ProtectedRoute component
  // For non-API routes, we just pass through all requests
  return NextResponse.next()
}

export const config = {
  // Match both API routes and other routes
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"]
}
