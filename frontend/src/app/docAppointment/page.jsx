"use client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
const docApp = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAppointmentId, setModalAppointmentId] = useState(null);
  const [role, setRole] = useState(null);
  const [modalAppointmentDate, setModalAppointmentDate] = useState("");
  const [modalAppointmentTime, setModalAppointmentTime] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
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
          return appointmentDateTime > now; // Include only future appointments
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

  const handleModal = async (appointmentIdmodal) => {
    console.log("Modal with id:", appointmentIdmodal);
    setIsModalOpen(true);
    setModalAppointmentId(appointmentIdmodal);
    const appointment = appointments.find(
      (app) => app._id === appointmentIdmodal
    );
    if (!appointment) {
      console.error("Appointment not found:", appointmentIdmodal);
      toast.error("Appointment not found");
      setIsModalOpen(false);
      return;
    }
    setModalAppointmentDate(appointment.appointmentDate);
    setModalAppointmentTime(appointment.appointmentTime);
    return appointmentIdmodal;
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEditAppointment = async () => {
    console.log("Edit appointment");
    if (!modalAppointmentDate || !modalAppointmentTime) {
      toast.error("Please select a valid appointment date & time.");
      return;
    }
    const currentDateTime = new Date(); // Current date and time
    const selectedDateTime = new Date(
      `${modalAppointmentDate}T${modalAppointmentTime}`
    );

    // Check if the selected appointment is in the past
    if (selectedDateTime <= currentDateTime) {
      toast.error("You cannot schedule an appointment in the past.");
      return;
    }

    // Check for a 2-hour gap from existing appointments
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const hasConflict = appointments.some((appointment) => {
      // Skip checking the current appointment being edited
      if (appointment._id === modalAppointmentId) return false;

      const existingDateTime = new Date(
        `${appointment.appointmentDate}T${appointment.appointmentTime}`
      );
      return Math.abs(selectedDateTime - existingDateTime) < twoHoursInMs;
    });

    if (hasConflict) {
      toast.error("There must be at least a 2-hour gap between appointments.");
      return;
    }
    //  console.log("New date:", appointmentDate);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updateAppointment/${modalAppointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${jwtToken}`,
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
          },
          body: JSON.stringify({
            appointmentDate: modalAppointmentDate,
            appointmentTime: modalAppointmentTime,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Appointment date updated successfully", data);
        toast.success("Appointment date & time updated successfully");
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === modalAppointmentId
              ? {
                  ...appointment,
                  appointmentDate: modalAppointmentDate,
                  appointmentTime: modalAppointmentTime,
                }
              : appointment
          )
        );
        setIsModalOpen(false);
        // fetchAppointments(userIdfetched);
        // handle success (e.g., update state, close modal, show notification)
      } else if (response.status === 401) {
        toast.warning(
          "Token has expired. Please log in again and try rescheduling."
        );
        Cookies.remove("jwtCookie", { path: "/" });
        sessionStorage.clear();
        localStorage.clear();
        // router.push(`/userlogin`);
        setTimeout(() => {
          router.push(`/userlogin`);
        }, 4000);
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
  const openConfirmModal = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setIsConfirmModalOpen(true);
  };
  const confirmDelete = () => {
    handleDeleteAppointment(appointmentToDelete);
    setIsConfirmModalOpen(false);
  };
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deleteAppointment/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${jwtToken}`,
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
          },
        }
      );

      if (response.ok) {
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
        console.log("Appointment deleted successfully");
        toast.success("Appointment deleted successfully");
      } else if (response.status === 404) {
        toast.error("Appointment not found");
      } else if (response.status === 401) {
        toast.warning(
          "Token has expired. Please log in again and try deleting."
        );
        Cookies.remove("jwtCookie", { path: "/" });
        sessionStorage.clear();
        localStorage.clear();
        setTimeout(() => {
          router.push(`/userlogin`);
        }, 4000);
      } else {
        const errorMessage = await response.text();
        console.error("Failed to delete appointment:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("An error occurred while deleting the appointment");
    }
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="doc-app">
        <Sidebar isOpen={isSidebarOpen} role="doctor" />
        <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
          <h2>Your upcoming Appointments:-</h2>
          <div className="appointments-list">
            {loading && <p>Loading appointments...</p>}
            {!loading && appointments?.length === 0 && (
              <p>No appointments found.</p>
            )}
            {/* {!loading &&
              appointments?.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <h3>{userData[appointment.userId]?.name || "Unknown"}</h3>
                  <h3>{appointment.patientName}</h3>
                  <p>
                    <span>Appointment Date & Time:</span>{" "}
                    {formatDateTime(appointment.appointmentDate)}, {appointment.appointmentTime}
                  </p>
                  <p>
                    <span>Disease Symptoms:</span> {appointment.disease}
                  </p>
                </div>
              ))} */}
            {!loading &&
              Object.entries(groupAppointmentsByUser(appointments)).map(
                ([userId, userAppointments]) => (
                  <div key={userId} className="appointment-card">
                    <h3>{userData[userId]?.name || "Unknown"}</h3>
                    {userAppointments.map((appointment, index) => (
                      <div
                        key={appointment._id}
                        className="appointment-details"
                      >
                        {userAppointments.length > 1 && (
                          <h4>Appointment {index + 1}:</h4>
                        )}
                        <p>
                          <span>Appointment Date & Time:</span>{" "}
                          {formatDateTime(appointment.appointmentDate)},{" "}
                          {appointment.appointmentTime}
                        </p>
                        <p>
                          <span>Disease Symptoms:</span> {appointment.disease}
                        </p>
                        <div>
                          {/* <button onClick={() => handleModal(appointment._id)}>
                            Edit
                          </button> */}
                          <button
                            onClick={() => handleModal(appointment._id)}
                            className="btn btn-outline-primary"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Reschedule Appointment"
                          >
                            <i className="fa-solid fa-calendar-days"></i>
                          </button>
                          {/* <button
                            onClick={() => openConfirmModal(appointment._id)}
                          >
                            Delete
                          </button> */}
                          <button
                            onClick={() => openConfirmModal(appointment._id)}
                            className="btn btn-outline-danger"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Delete Appointment"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                          {/* <button onClick={handleDeleteAppointment}>
                            Delete
                          </button> */}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            {isModalOpen && (
              <div
                className="modal fade show"
                id="exampleModal"
                role="dialog"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
                style={{ display: "block" }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      Please update the appointment Date & Time
                    </div>
                    <div className="modal-body">
                      <div className="modal-input">
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Enter your updated appointment date"
                          value={modalAppointmentDate}
                          onChange={(e) => {
                            setModalAppointmentDate(e.target.value);
                          }}
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <input
                          type="Time"
                          className="form-control"
                          value={modalAppointmentTime}
                          onChange={(e) => {
                            setModalAppointmentTime(e.target.value);
                          }}
                        />
                        {/* <input
                          type="text"
                          className="form-control"
                          placeholder="HH:MM (24-hour format)"
                          value={modalAppointmentTime}
                          onChange={(e) => {
                            setModalAppointmentTime(e.target.value);
                          }}
                          onBlur={(e) => {
                            const isValidTime =
                              /^([01]\d|2[0-3]):([0-5]\d)$/.test(
                                modalAppointmentTime
                              );
                            if (!isValidTime && modalAppointmentTime !== "") {
                              toast.error(
                                "Please enter a valid time in HH:MM format (24-hour clock)."
                              );
                            }
                          }}
                          required
                        /> */}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleEditAppointment}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isConfirmModalOpen && (
              <div
                className="modal fade show"
                role="dialog"
                style={{ display: "block" }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">Confirm Deletion</div>
                    <div className="modal-body">
                      Are you sure you want to delete this appointment?
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsConfirmModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={confirmDelete}
                        // onClick={handleDeleteAppointment}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default docApp;
