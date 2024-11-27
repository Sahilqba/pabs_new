import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
export function middleware(request) {
    const token = request.cookies.get('jwtCookie')

    if ((request.nextUrl.pathname === '/userlogin' || request.nextUrl.pathname === '/userRegistration') && token) {
        console.log("User already logged in, redirecting to /userProfile");
        return NextResponse.redirect(new URL("/userProfile", request.nextUrl));
    }

    // if (!token) {
    //   console.log("No token found, redirecting to /userlogin");
    //   return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
    // }

    if ((request.nextUrl.pathname === '/userProfile' || request.nextUrl.pathname === '/appointmentBooking') && !token) {
        console.log("No token found, redirecting to /userlogin");
        return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
    }
    
    return NextResponse.next();
}

export const config = {
  matcher: ["/userProfile", "/appointmentBooking", "/userlogin", "/userRegistration"]
}
