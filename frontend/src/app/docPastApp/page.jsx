"use client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
const docApp = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [role, setRole] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUserName = localStorage.getItem("userName");
    const nameFromGoogle = Cookies.get("nameFromGoogle");
    const userRoleGoogle = Cookies.get("userRoleGoogle");

    // console.log("storedRole:", storedRole);
    // console.log("storedUserName:", storedUserName);
    // console.log("nameFromGoogle:", nameFromGoogle);
    // console.log("userRoleGoogle:", userRoleGoogle);

    setRole(storedRole || userRoleGoogle);
    setUserName(storedUserName || nameFromGoogle);
  }, []);

  const viewAppointments = async () => {
    setLoading(true);
    try {
      // console.log("Fetching appointments for doctor:", userName);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/viewDoctorAppointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ doctor: userName }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let appointmentsData = data.user || []; // Adjust based on the actual response structure
        const now = Date.now();
        appointmentsData = appointmentsData.filter((appointment) => {
          const appointmentDateTime = new Date(
            `${appointment.appointmentDate}T${appointment.appointmentTime}`
          );
          return appointmentDateTime < now; // Include only future appointments
        });
        // Sort appointments by date and time
        appointmentsData = appointmentsData.sort((a, b) => {
          const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
          const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
          return dateA - dateB; // Ascending order
        });
  
        setAppointments(appointmentsData);

        // Extract _ids and call viewUserData
        const userIds = data.user
          .map((appointment) => appointment.userId)
          .join(",");
        console.log("userIds:", userIds);
        // viewUserData(userIds);
        if (userIds) {
          viewUserData(userIds);
        } else {
          console.error("No userIds found to fetch user data");
        }
      } else {
        const errorMessage = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? (await response.json()).message || "Failed to fetch appointments"
          : await response.text();
        console.error("Error fetching appointments:", errorMessage);
      }
    } catch (error) {
      console.error("Error during fetch:", error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // console.log("Role:", role);
    // console.log("userName from localStorage or Cookies:", userName);
    if (userName) {
      viewAppointments();
    }
  }, [userName]);

  const viewUserData = async (userIds) => {
    setLoading(true);
    try {
      // console.log("Fetching appointments for doctor:", userName);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user?userIds=${userIds}`
      );
      if (response.ok) {
        const data = await response.json();
        const userDataMap = data.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});
        setUserData(userDataMap);
        // console.log("API Response Data:", data);
      } else {
        const errorMessage = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? (await response.json()).message || "Failed to fetch appointments"
          : await response.text();
        console.error("Error fetching appointments:", errorMessage);
      }
    } catch (error) {
      console.error("Error during fetch:", error.message);
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   // console.log("Role:", role);
  //   // console.log("userName from localStorage or Cookies:", userName);
  //   // if (userName) {
  //   viewUserData();
  //   // }
  // }, []);
  const groupAppointmentsByUser = (appointments) => {
    return appointments.reduce((acc, appointment) => {
      const userId = appointment.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(appointment);
      return acc;
    }, {});
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
      <div className="doc-app">
        <Sidebar isOpen={isSidebarOpen} role="doctor" />
        <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
          <h2>Appointment History:-</h2>
          <div className="appointments-list">
            {loading && <p>Loading appointments...</p>}
            {!loading && appointments?.length === 0 && (
              <p>No appointments history found.</p>
            )}
              {!loading &&
            Object.entries(groupAppointmentsByUser(appointments)).map(
              ([userId, userAppointments], index) => (
                <div key={userId}>
                    <h3>Patient {index + 1}: {userData[userId]?.name || "Unknown"}</h3>
                    <div className="appointment-card">
                  {/* <h3>{userData[userId]?.name || "Unknown"}</h3> */}
                  {userAppointments.map((appointment, appointmentIndex) => (
                    <div key={appointment._id} className="appointment-details">
                      {userAppointments.length > 1 && (
                        <h4>Appointment {appointmentIndex + 1}:</h4>
                      )}
                      <p>
                        <span>Appointment Date & Time:</span>{" "}
                        {formatDateTime(appointment.appointmentDate)},{" "}
                        {appointment.appointmentTime}
                      </p>
                      <p>
                        <span>Disease Symptoms:</span> {appointment.disease}
                      </p>
                    </div>
                  ))}
                </div>
                </div>
              )
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default docApp;
