import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
export function middleware(request) {
  const token = request.cookies.get("jwtCookie");
  // console.log("Token:", token);
  const roleObject = request.cookies.get("role");
  console.log("RoleObject:", roleObject);
  const role = roleObject ? roleObject.value : null;
  console.log("Role:", role);
  if (
    (request.nextUrl.pathname === "/userlogin" ||
      request.nextUrl.pathname === "/userRegistration") &&
    token
  ) {
    console.log("User already logged in, redirecting to /userProfile");
    return NextResponse.redirect(new URL("/userProfile", request.nextUrl));
  }

  if (
    (request.nextUrl.pathname === "/userProfile" ||
      request.nextUrl.pathname === "/appointmentBooking" ||
      request.nextUrl.pathname === "/docAppointment" ||
      request.nextUrl.pathname === "/docPastApp") &&
    !token
  ) {
    console.log("No token found, redirecting to /userlogin");
    return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
  }
  if (request.nextUrl.pathname === "/appointmentBooking" && role === "Doctor") {
    return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
  }

  if (request.nextUrl.pathname === "/docAppointment" && role === "Patient") {
    return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/userProfile",
    "/appointmentBooking",
    "/userlogin",
    "/userRegistration",
    "/userRoleVanilla",
    "/docAppointment",
    "/docPastApp",
  ],
};
