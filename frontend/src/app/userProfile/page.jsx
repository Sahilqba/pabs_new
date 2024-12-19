"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import Cookies from "js-cookie";

function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  // const userName = localStorage.getItem("userName");
  // const role = localStorage.getItem("role");
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const userIdfetched = localStorage.getItem("userId");
  const jwtToken = localStorage.getItem("jwtToken");
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const userIdinDb = Cookies.get("userIdinDb");
  const jwtCookie = Cookies.get("jwtCookie");


  useEffect(() => {
    // Initialize user data from localStorage
    const storedRole = localStorage.getItem("role");
    const storedUserName = localStorage.getItem("userName");
    const nameFromGoogle = Cookies.get("nameFromGoogle");
    const userRoleGoogle = Cookies.get("userRoleGoogle");
    setRole(storedRole || userRoleGoogle);
    setUserName(storedUserName || nameFromGoogle);



    // console.log("Name from google:", nameFromGoogle);
    // console.log("userName from google:", userName);
    // console.log("Role from google:", role);
    // console.log("userRolegoogle from google:", userRoleGoogle);
    // console.log("use id in db:", userIdinDb);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userIdfetched) {
      fetchAppointments(userIdfetched);
    }
  }, [userIdfetched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Department selected:", department);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updateDepartment/${userIdinDb}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${jwtToken}`,
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`
          },
          body: JSON.stringify({
            department: department
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Department set successfully");
      } else if (response.status === 401) {
        toast.warning(
          "Token has expired. Please log in again and try rescheduling."
        );
        // Cookies.remove("jwtCookie", { path: "/" });
        // sessionStorage.clear();
        // localStorage.clear();
      } else if (response.status === 400) {
        toast.warning("Appointment date is required.");
      } else {
        const errorData = await response.json();
        console.error("Error updating appointment date", errorData);
        // handle error (e.g., show error message)
      }
    } catch (error) {
      console.error("Network error", error);
      // handle network error
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const dateObj = new Date(isoString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  };
  if (!role || !userName) {
    return <div>Loading...</div>;
  }
  const normalizedRole = role?.toLowerCase();
  // console.log("Final Role Evaluation:", normalizedRole);

  if (normalizedRole === "doctor") {
    // console.log("Rendering doctor block");
    return (
      <>
        <Header />
        <main className="main">
          <h3>Hi {userName.toUpperCase()}, you are doctor.</h3>
          <form>
            <div className="col-md-3">
              <select
                type="text"
                className="form-control"
                placeholder="Choose department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                }}
                required
              >
                <option value="">Select Department</option>
                <option value="GeneralPhysician">General Physician</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Neurology">Neurology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <button onClick={handleSubmit}>
              Click here to select your department
            </button>
          </form>
        </main>
        <Footer />
      </>
    );
  }

  if (normalizedRole === "patient") {
    // console.log("Rendering patient block");
    return (
      <>
        <Header />
        {/* <h1>Profile page</h1> */}
        <main className="main">
          <div className="prof-hdng">
            <h3>
              Welcome {userName.toUpperCase()}, {role}. You can view your
              appointments here.
            </h3>
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
                            <th>Appointment Date</th>
                            <th>Appointment Time(IST)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appointment) => (
                            <tr key={appointment._id}>
                              <td>{appointment.disease}</td>
                              <td>{appointment.doctor}</td>
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
        <Footer />
      </>
    );
  }
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
