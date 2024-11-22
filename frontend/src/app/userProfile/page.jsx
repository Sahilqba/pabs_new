"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function page() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const userName = localStorage.getItem("userName");
  const userIdfetched = localStorage.getItem("userId");
  const jwtToken = localStorage.getItem("jwtToken");
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async (userIdfetched) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/${userIdfetched}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Appointments:", data);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userIdfetched) {
      fetchAppointments(userIdfetched);
    }
  }, [userIdfetched]);
  return (
    <>
      <Header />
      {/* <h1>Profile page</h1> */}
      <main className="main">
      <div className="prof-hdng">
          <h3>Welcome {userName.toUpperCase()}. You can view your appointments here.</h3>
      </div>
      <div className="appnt-btn">
      <button
        className="btn btn-primary"
        onClick={() => {
          router.push(`/appointmentBooking`);
        }}
      >
        Book an Appointment
      </button>
      </div>
      {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="no-booking">
                <p>No booking history available.</p>
              </div>
            ) :  (
      <div className="accordion" id="accordionExample">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              Appointment History
            </button>
          </h2>
          <div
            id="collapseOne"
            className="accordion-collapse collapse show"
            data-bs-parent="#accordionExample"
          >
            <div className="accordion-body">
              {appointments.length > 0 ? (
                <table className="appointments-table app-hist">
                  <thead>
                    <tr>
                      <th>Disease Symptoms</th>
                      <th>Department</th>
                      <th>Appointment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>{appointment.disease}</td>
                        <td>{appointment.allergies}</td>
                        <td>{appointment.appointmentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                "No appointments booked yet"
              )}
            </div>
          </div>
        </div>
      </div>
            )}
      </main>
      <Footer />
    </>
  );
}

export default page;
