"use client";
import Header from "@/components/Header";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
function page() {
  // const [disease, setDisease] = React.useState("");
  // const [allergies, setAllergies] = React.useState("");
  // const [appointmentDate, setAppointmentDate] = React.useState("");
  const [disease, setDisease] = React.useState(sessionStorage.getItem("disease") || "");
  const [allergies, setAllergies] = React.useState(sessionStorage.getItem("allergies") || "");
  const [appointmentDate, setAppointmentDate] = React.useState(sessionStorage.getItem("appointmentDate") || "");
  const jwtToken = localStorage.getItem("jwtToken");
  console.log("jwtToken:", jwtToken);
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem("disease", disease);
  }, [disease]);

  useEffect(() => {
    sessionStorage.setItem("allergies", allergies);
  }, [allergies]);

  useEffect(() => {
    sessionStorage.setItem("appointmentDate", appointmentDate);
  }, [appointmentDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/createAppointment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          disease,
          allergies,
          appointmentDate,
        }),
      }
    );

    if (response.ok) {
      const appointment = await response.json();
      console.log("Appointment booked:", appointment);
      alert("Appointment booked successfully");
      router.push(`/userProfile`);
    } else if (response.status === 401) {
      alert("Token has expired. Please log in again.");
      router.push(`/userlogin`);
    }
    else {
      const errorMessage = await response.text();
      console.error("Failed to book appointment:", errorMessage);
      alert(errorMessage);
    }
  };
  return (
    <>
      <Header />
      <h1>Appointment booking page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your disease"
          value={disease}
          onChange={(e) => {
            setDisease(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Enter your allergies"
          value={allergies}
          onChange={(e) => {
            setAllergies(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Enter your appointment date"
          value={appointmentDate}
          onChange={(e) => {
            setAppointmentDate(e.target.value);
          }}
        />
        <button>Submit</button>
      </form>
    </>
  );
}

export default page;
