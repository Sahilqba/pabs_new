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
import Sidebar from "@/components/Sidebar";
 
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
  // const userIdfetched = localStorage.getItem("userId");
  const userIdfetched = Cookies.get("userId");
  const jwtToken = localStorage.getItem("jwtToken");
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const userIdinDb = Cookies.get("userIdinDb");
  const jwtCookie = Cookies.get("jwtCookie");

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

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
    console.log("Role from google:", storedRole || userRoleGoogle);
    console.log("userRolegoogle from google:", userRoleGoogle);
    // console.log("use id in db:", userIdinDb);
  }, []);

  useEffect(() => {
    if (role === "patient") {
      fetchAppointments();
    }
  }, [role]);

  const fetchAppointments = async (userIdfetched) => {
    // const userIdFetched = localStorage.getItem("userId");
    // const jwtToken = localStorage.getItem("jwtToken");

    // if (!userIdfetched || !jwtToken) return;
    console.log("Fetching appointments for user:", userIdfetched);
    console.log("JWT Token:", jwtToken);
    console.log("JWT Cookie:", jwtCookie);
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
    console.log("userIdfetched from cookies:", userIdfetched);
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
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
          },
          body: JSON.stringify({
            department: department,
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

  const viewAppointments = async () => {
    // router.push("/viewDoctorAppointments");
       try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/viewDoctorAppointments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              doctor: userName
            }),
          }
        );
        let errorMessage;
        if (response.ok) {
          const data = await response.json();
          // console.log("Login successful");
          // console.log("Data:", data);
          // toast.success("Login successful !");
          // localStorage.setItem("jwtToken", data.token);
          // localStorage.setItem("userId", data.user._id);
          // localStorage.setItem("userName", data.user.name);
          // localStorage.setItem("role", data.user.role);
          // Cookies.set("jwtCookie", data.token, { expires: 1, path: "/" });
          // Cookies.set("userIdinDb", data.user._id, { expires: 1, path: "/" });
          // Cookies.set("userId", data.user._id, { expires: 1, path: "/" });
          // setTimeout(() => {
          //   router.push(`/viewDoctorAppointments`);
          // }, 2000);
        } else {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            errorMessage = data.message || "Failed to login";
          } else {
            errorMessage = await response.text();
          }
          console.error("Login failed:", errorMessage);
          // toast.error(errorMessage);
          // Cookies.remove("emailFromLoginPage", { path: "/" });
          // Cookies.remove("role", { path: "/" });
          // Cookies.remove("passwordFromLoginPage", { path: "/" });
        }
      } catch (error) {
        console.error("Error during login:", error);
        toast.error(error.message);
      } finally {
        setLoading(false); // Reset loading state
      }
  }

    // const handleRoleSelection = async (role) => {
    //   setUserRole(role);
    //   setShowRoleModal(false);
    //   // You can now use the selectedRole state to capture the input
    //   console.log("Selected Role:", role);
  
    //   if (isGoogleLogin) {
    //     Cookies.set("role", role, { expires: 1, path: "/" });
    //     Cookies.set("userRoleGoogle", role, { expires: 1, path: "/" });
    //     window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    //     return;
    //   }
  
    //   Cookies.set("emailFromLoginPage", email, { expires: 1, path: "/" });
    //   Cookies.set("passwordFromLoginPage", password, { expires: 1, path: "/" });
    //   Cookies.set("role", role, { expires: 1, path: "/" });
    //   try {
    //     const response = await fetch(
    //       `${process.env.NEXT_PUBLIC_API_URL}/userLogin`,
    //       {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           email: email,
    //           password: password,
    //           role: role,
    //         }),
    //       }
    //     );
    //     let errorMessage;
    //     if (response.ok) {
    //       const data = await response.json();
    //       console.log("Login successful");
    //       // console.log("Data:", data);
    //       toast.success("Login successful !");
    //       localStorage.setItem("jwtToken", data.token);
    //       // localStorage.setItem("userId", data.user._id);
    //       localStorage.setItem("userName", data.user.name);
    //       localStorage.setItem("role", data.user.role);
    //       Cookies.set("jwtCookie", data.token, { expires: 1, path: "/" });
    //       Cookies.set("userIdinDb", data.user._id, { expires: 1, path: "/" });
    //       Cookies.set("userId", data.user._id, { expires: 1, path: "/" });
    //       setTimeout(() => {
    //         router.push(`/userProfile`);
    //       }, 2000);
    //     } else {
    //       const contentType = response.headers.get("content-type");
    //       if (contentType && contentType.includes("application/json")) {
    //         const data = await response.json();
    //         errorMessage = data.message || "Failed to login";
    //       } else {
    //         errorMessage = await response.text();
    //       }
    //       console.error("Login failed:", errorMessage);
    //       toast.error(errorMessage);
    //       Cookies.remove("emailFromLoginPage", { path: "/" });
    //       Cookies.remove("role", { path: "/" });
    //       Cookies.remove("passwordFromLoginPage", { path: "/" });
    //     }
    //   } catch (error) {
    //     console.error("Error during login:", error);
    //     toast.error(error.message);
    //   } finally {
    //     setLoading(false); // Reset loading state
    //   }
    // };

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
      <Header toggleSidebar={toggleSidebar}/>
      <div className="doc-panel">
      <Sidebar isOpen={isSidebarOpen} role={normalizedRole}/>
      <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
        <div className="prof-hdng">
          <h3>Hi Dr. {userName.toUpperCase()}, Welcome.</h3>
        </div>
        <form className="doc-form">
          {/* <div className="row">
          <div className="mb-3 col-md-6"> */}
           <div className="doc-dept"> 
            <select
              type="text"
              className="form-select dept-sel"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select your Department</option>
              <option value="GeneralPhysician">General Physician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Neurology">Neurology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Others">Others</option>
            </select>
            <button
            className="btn btn-primary dept-btn"
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          {/* </div>
          </div> */}
          </div>
          {/* <button
            className="btn btn-primary"
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </button> */}
        </form>
        <button onClick = {viewAppointments}>Click here to view your appointments</button>
      </main>
      </div>
      <Footer />
      <ToastContainer />
    </>
    );
  }

  if (normalizedRole === "patient") {
    // console.log("Rendering patient block");
    return (
      <>
        <Header toggleSidebar={toggleSidebar}/>
        <div className="patient-pnl">
        <Sidebar isOpen={isSidebarOpen} role={normalizedRole}/>
        <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
          <div className="prof-hdng">
            <h3>
              Welcome {userName.toUpperCase()}. You can view your
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
                              <td>Dr. {appointment.doctor.toUpperCase()}</td>
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
  }
  return (
    <div>
      <Header />
      <main className="main">
        <h3>Unable to determine role. Please try again.</h3>
      </main>
      <Footer />
    </div>
  );
}

export default page;
