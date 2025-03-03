"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
const page = () => {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [role, setRole] = useState(null);
  const jwtToken = localStorage.getItem("jwtToken");
  const jwtCookie = Cookies.get("jwtCookie");
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

  // const viewAppointments = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/viewDoctorAppointments`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ doctor: userName }),
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       let appointmentsData = data.user || [];
  //       const now = Date.now();

  //       appointmentsData = appointmentsData.filter((appointment) => {
  //         const appointmentDateTime = new Date(
  //           `${appointment.appointmentDate}T${appointment.appointmentTime}`
  //         );
  //         return appointmentDateTime > now;
  //       });
  //       const groupedAppointments = appointmentsData.reduce((acc, appointment) => {
  //         const userId = appointment.userId;
  //         if (!acc[userId]) acc[userId] = [];
  //         acc[userId].push(appointment);
  //         return acc;
  //       }, {});
  //       const latestAppointments = Object.values(groupedAppointments)
  //       .map((userAppointments) =>
  //         userAppointments
  //           .sort(
  //             (a, b) =>
  //               new Date(`${a.appointmentDate}T${a.appointmentTime}`) -
  //               new Date(`${b.appointmentDate}T${b.appointmentTime}`)
  //           )
  //           .slice(0, 2) // Pick only the latest 2
  //       )
  //       .flat(); // Flatten to make it a single list

  //     setAppointments(latestAppointments);

  //     const userIds = [...new Set(latestAppointments.map((appt) => appt.userId))].join(",");
  //     if (userIds) {
  //       viewUserData(userIds);
  //       } else {
  //         console.error("No userIds found to fetch user data");
  //       }
  //     } else {
  //       const errorMessage = response.headers
  //         .get("content-type")
  //         ?.includes("application/json")
  //         ? (await response.json()).message || "Failed to fetch appointments"
  //         : await response.text();
  //       console.error("Error fetching appointments:", errorMessage);
  //     }
  //   } catch (error) {
  //     console.error("Error during fetch:", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (userName) {
  //     viewAppointments();
  //   }
  // }, [userName]);

  // const viewUserData = async (userIds) => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/user?userIds=${userIds}`
  //     );
  //     if (response.ok) {
  //       const data = await response.json();
  //       const userDataMap = data.reduce((acc, user) => {
  //         acc[user._id] = user;
  //         return acc;
  //       }, {});
  //       setUserData(userDataMap);
  //     } else {
  //       const errorMessage = response.headers
  //         .get("content-type")
  //         ?.includes("application/json")
  //         ? (await response.json()).message || "Failed to fetch appointments"
  //         : await response.text();
  //       console.error("Error fetching appointments:", errorMessage);
  //     }
  //   } catch (error) {
  //     console.error("Error during fetch:", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const groupAppointmentsByUser = (appointments) => {
  //   return appointments.reduce((acc, appointment) => {
  //     const userId = appointment.userId;
  //     if (!acc[userId]) {
  //       acc[userId] = [];
  //     }
  //     acc[userId].push(appointment);
  //     return acc;
  //   }, {});
  // };

  const viewAppointments = async () => {
    setLoading(true);
    try {
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

      if (!response.ok) {
        const errorMessage = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? (await response.json()).message || "Failed to fetch appointments"
          : await response.text();
        console.error("Error fetching appointments:", errorMessage);
        return;
      }

      const data = await response.json();
      let appointmentsData = data.user || [];
      const now = new Date();

      // Filter only future appointments
      appointmentsData = appointmentsData.filter((appointment) => {
        const appointmentDateTime = new Date(
          `${appointment.appointmentDate}T${appointment.appointmentTime}`
        );
        return appointmentDateTime > now;
      });
      console.log("Filtered Future Appointments:", appointmentsData);
      // Group appointments by user ID
      const groupedAppointments = appointmentsData.reduce(
        (acc, appointment) => {
          const userId = appointment.userId;
          if (!acc[userId]) acc[userId] = [];
          acc[userId].push(appointment);
          return acc;
        },
        {}
      );
      console.log("Grouped Appointments Before Slicing:", groupedAppointments);
      // Keep only the latest 2 upcoming appointments per user
      const latestAppointments = appointmentsData
      .sort(
        (a, b) =>
          new Date(`${a.appointmentDate}T${a.appointmentTime}`) -
          new Date(`${b.appointmentDate}T${b.appointmentTime}`)
      )
      .slice(0, 2);

        console.log("Latest 2 Per User:", latestAppointments);
      // Sort the final list based on appointment date
      latestAppointments.sort(
        (a, b) =>
          new Date(`${a.appointmentDate}T${a.appointmentTime}`) -
          new Date(`${b.appointmentDate}T${b.appointmentTime}`)
      );

      setAppointments(latestAppointments);

      // Fetch user data if appointments exist
      if (latestAppointments.length > 0) {
        const userIds = [
          ...new Set(latestAppointments.map((appt) => appt.userId)),
        ].join(",");
        viewUserData(userIds);
      }
    } catch (error) {
      console.error("Error during fetch:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details
  const viewUserData = async (userIds) => {
    setLoading(true);
    try {
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
      } else {
        console.error("Error fetching user data:", await response.text());
      }
    } catch (error) {
      console.error("Error during fetch:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Group appointments in state
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

  useEffect(() => {
    if (userName) {
      viewAppointments();
    }
  }, [userName]);

  const groupedAppointments = groupAppointmentsByUser(appointments);

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const dateObj = new Date(isoString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  };
  const router = useRouter();
  const handleUpcmngAppntmntClick = (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    router.push("/docAppointment").finally(() => setIsLoading(false)); // Hide loader after navigation
  };
  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} role="doctor" />
      <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
        <div className="prof-hdng">
          <h3>
            {" "}
            Hi Dr. {localStorage.getItem(userName)}, welcome to your dashboard!
          </h3>
        </div>
        <div className="apntmnt-stats">
          <div className="container">
            <div className="sec-contain">
              <div className="tracksec">
                <h2>225</h2>
                <div className="right-cont">
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className="tracksec">
                <h2>115</h2>
                <div className="right-cont">
                  <p>Upcoming Appointments</p>
                </div>
              </div>
              <div className="tracksec">
                <h2>35</h2>
                <div className="right-cont">
                  <p>Appointments this week</p>
                </div>
              </div>
              <div className="tracksec">
                <h2>5</h2>
                <div className="right-cont">
                  <p>Appointments today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="upcmng-apntmnt">
          <h2>Upcoming Appointments</h2>
          <div className="appointments-table">
            {loading && <p>Loading appointments...</p>}
            {!loading && appointments?.length === 0 && (
              <p>No appointments found.</p>
            )}
            {!loading && appointments?.length > 0 && (
              <>
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Patient Name</th>
                    <th>Appointment Date & Time</th>
                    <th>Disease Symptoms</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedAppointments).map(
                    ([userId, userAppointments], index) =>
                      userAppointments.map((appointment, appointmentIndex) => (
                        <tr key={appointment._id}>
                          {appointmentIndex === 0 && (
                            <td rowSpan={userAppointments.length}>
                              {index + 1}
                            </td>
                          )}
                          {appointmentIndex === 0 && (
                            <td rowSpan={userAppointments.length}>
                              {userData[userId]?.name || "Unknown"}
                            </td>
                          )}
                          <td>
                            {formatDateTime(appointment.appointmentDate)},{" "}
                            {appointment.appointmentTime}
                          </td>
                          <td>{appointment.disease}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
              <div className="register-link">
            {loading ? (
              <span className="loader">Loading...</span>
            ) : (
              <Link
                href="/docAppointment"
                className="sign-up-link upcmng-apt-link"
                onClick={handleUpcmngAppntmntClick}
              >
                Edit Appointments / View More Appointments
              </Link>
            )}
          </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default page;
