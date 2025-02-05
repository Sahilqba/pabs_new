"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const PatientProfile = () => {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const userIdfetched = Cookies.get("userId");
  const jwtToken = localStorage.getItem("jwtToken");
  const userIdinDb = Cookies.get("userIdinDb");
  const jwtCookie = Cookies.get("jwtCookie");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUserName = localStorage.getItem("userName");
    const nameFromGoogle = Cookies.get("nameFromGoogle");
    const userRoleGoogle = Cookies.get("userRoleGoogle");
    setRole(storedRole || userRoleGoogle);
    setUserName(storedUserName || nameFromGoogle);
  }, []);
  const fetchAppointments = async (userIdfetched) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/${userIdfetched}`,
        {
          method: "GET",
          headers: {
            // Authorization: `Bearer ${jwtToken}`,
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
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
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const userIdfetched = Cookies.get("userId");
    if (userIdfetched) {
      fetchAppointments(userIdfetched);
    }
  }, [userIdfetched]);
  const isPastAppointment = (appointmentDate, appointmentTime) => {
    const appointmentDateTime = new Date(
      `${appointmentDate}T${appointmentTime}`
    );
    const now = new Date();
    return appointmentDateTime < now;
  };
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const dateObj = new Date(isoString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  };
  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="patient-pnl">
        <Sidebar isOpen={isSidebarOpen} role="patient" />
        <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
          <div className="prof-hdng">
            <h3>Welcome {userName}. You can view your appointments here.</h3>
          </div>
          <div className="appnt-btn">
            <button
              className="btn btn-primary"
              onClick={() => {
                toast.info("Navigating to Appointment booking page...");
                // router.push(`/appointmentBooking`);
                setTimeout(() => {
                  router.push("/appointmentBooking");
                }, 2000); // Adjust the delay as needed
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
                            <th>Doctor</th>
                            <th>Department</th>
                            <th>Appointment Date</th>
                            <th>Appointment Time(IST)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appointment) => (
                            <tr
                              key={appointment._id}
                              className={
                                isPastAppointment(
                                  appointment.appointmentDate,
                                  appointment.appointmentTime
                                )
                                  ? "blurred"
                                  : ""
                              }
                            >
                              <td>{appointment.disease}</td>
                              <td>Dr. {appointment.doctor.toUpperCase()}</td>
                              <td>{appointment.department}</td>
                              <td>
                                {formatDateTime(appointment.appointmentDate)}
                              </td>
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
      </div>
      <Footer />
    </>
  );
};

export default PatientProfile;
