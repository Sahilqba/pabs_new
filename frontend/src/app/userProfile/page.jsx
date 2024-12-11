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
  // const userName = localStorage.getItem("userName");
  // const role = localStorage.getItem("role");
  const [role, setRole] = useState(null); 
  const [userName, setUserName] = useState(null); 
  const userIdfetched = localStorage.getItem("userId");
  const jwtToken = localStorage.getItem("jwtToken");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Initialize user data from localStorage
    const storedRole = localStorage.getItem("role");
    const storedUserName = localStorage.getItem("userName");
    setRole(storedRole);
    setUserName(storedUserName);
    // console.log("Fetched Role:", storedRole);
    // console.log("Fetched Username:", storedUserName);
  }, []);
  
  useEffect(() => {
    if (role === "patient") {
      fetchAppointments();
    }
  }, [role]);

  const fetchAppointments = async () => {
    // const userIdFetched = localStorage.getItem("userId");
    // const jwtToken = localStorage.getItem("jwtToken");

    if (!userIdfetched || !jwtToken) return;
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
      const sortedAppointments = data.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA - dateB;
      });
      setAppointments(sortedAppointments);
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
  
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const dateObj = new Date(isoString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); 
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  };
  if (!role || !userName) {
    // console.log("Loading state, role or username not ready");
    return <div>Loading...</div>;
  }
  const normalizedRole = role?.toLowerCase();
  console.log("Final Role Evaluation:", normalizedRole);
  
  if (normalizedRole === "admin") {
    console.log("Rendering admin block");
    return (
      <>
        <Header />
        <main className="main">
          <h3>Hi {userName.toUpperCase()}, you are admin.</h3>
        </main>
        <Footer />
      </>
    );
  }

  if (normalizedRole === "doctor") {
    console.log("Rendering doctor block");
    return (
      <>
        <Header />
        <main className="main">
          <h3>Hi {userName.toUpperCase()}, you are doctor.</h3>
        </main>
        <Footer />
      </>
    );
  }

  if(normalizedRole === "patient" ){
    console.log("Rendering patient block");
  return (
    <>
      <Header />
      {/* <h1>Profile page</h1> */}
      <main className="main">
      <div className="prof-hdng">
          <h3>Welcome {userName.toUpperCase()}, {role}. You can view your appointments here.</h3>
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
                      <th>Appointment Time(IST)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>{appointment.disease}</td>
                        <td>{appointment.allergies}</td>
                        <td>{formatDateTime(appointment.appointmentDate)}</td>
                        <td>{appointment.appointmentTime}</td>
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
// console.log("Rendering fallback block");
return (
  <div>
    <Header />
    <main className="main">
      <h3>Unable to determine role. Please contact support.</h3>
    </main>
    <Footer />
  </div>
);
}

export default page;
