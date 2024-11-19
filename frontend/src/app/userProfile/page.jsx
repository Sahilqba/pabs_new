"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
function page() {
  const router = useRouter();
  return (
    <>
      <Header />
      <h1>Profile page</h1>
      <button
        onClick={() => {
          router.push(`/appointmentBooking`);
        }}
      >
        Book an appointment
      </button>
    </>
  );
}

export default page;
