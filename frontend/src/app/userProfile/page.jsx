"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
// import withAuth from "../../withAuth";
// import withAuth from "@/withAuth";
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
      <h1>
        <strong>
          Welcome {userName}. You can view your appointments here.
        </strong>
      </h1>
      {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
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
              Your appointments
            </button>
          </h2>
          <div
            id="collapseOne"
            className="accordion-collapse collapse show"
            data-bs-parent="#accordionExample"
          >
            <div className="accordion-body">
              {appointments.length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Disease</th>
                      <th>Allergies</th>
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

      <button
        className="appointment-button"
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
// export default withAuth(Page);