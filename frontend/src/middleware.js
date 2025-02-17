import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
export function middleware(request) {
  const token = request.cookies.get("jwtCookie");
  const roleObject = request.cookies.get("role");
  const role = roleObject ? roleObject.value : null;
  const userIdfromPhoneVerification = request.cookies.get(
    "userIdfromPhoneVerification"
  );
  const sidOTP = request.cookies.get("sidOTP");
  const sidOTPValue = sidOTP ? sidOTP.value : null;
  const jwtCookie = request.cookies.get("jwtCookie");

  if (request.nextUrl.pathname === "/googleRoleSelect" && !jwtCookie) {
    console.log("User already logged in, redirecting to /userProfile");
    return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
  }

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
      request.nextUrl.pathname === "/docPastApp" ||
      request.nextUrl.pathname === "/patientProfilePage") &&
    !token
  ) {
    console.log("No token found, redirecting to /userlogin");
    return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
  }
  if (request.nextUrl.pathname === "/appointmentBooking" && role === "Doctor") {
    return NextResponse.redirect(new URL("/userlogin", request.nextUrl));
  }

  if (
    request.nextUrl.pathname === "/updatePassword" &&
    !userIdfromPhoneVerification &&
    !sidOTPValue
  ) {
    return NextResponse.redirect(
      new URL("/phoneVerification", request.nextUrl)
    );
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
    "/updatePassword",
    "/phoneVerification",
    "/patientProfilePage",
    "/googleRoleSelect",
  ],
};
