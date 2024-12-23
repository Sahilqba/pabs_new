"use client";
import Header from "@/components/Header";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { Tooltip } from "bootstrap";
import Sidebar from "@/components/Sidebar";
// import React from "react";
function page() {
  const userEmailFromLoginPage = Cookies.get("emailFromLoginPage");
  const userEmailFromGoogle = Cookies.get("emailFromGoogle");
  // console.log("User email:", userEmail);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAppointmentId, setModalAppointmentId] = useState(null);
  const [modalAppointmentDate, setModalAppointmentDate] = useState("");
  const [modalAppointmentTime, setModalAppointmentTime] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  // const userIdfetched = localStorage.getItem("userId");
  const userIdfetched = Cookies.get("userId");
  const [loading, setLoading] = useState(false);
  const jwtToken = localStorage.getItem("jwtToken");
  const jwtCookie = Cookies.get("jwtCookie");
  const router = useRouter();

  const [disease, setDisease] = useState("");
  // const [department, setDepartment] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const fetchAppointments = async (userIdfetched) => {
    setLoading(true);
    try {
      // if (!jwtToken) {
      //   throw new Error("No token found");
      // }
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
  // const addAppointment = (newAppointment) => {
  //   setAppointments((prevAppointments) => {
  //     // Add the new appointment and sort the array
  //     const updatedAppointments = [...prevAppointments, newAppointment].sort(
  //       (a, b) => {
  //         const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
  //         const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
  //         return dateA - dateB;
  //       }
  //     );
  //     return updatedAppointments;
  //   });
  // };
  useEffect(() => {
    // const userIdfetched = localStorage.getItem("userId");
    const userIdfetched = Cookies.get("userId");
    console.log("userIdfetched from cookies:", userIdfetched);
    if (userIdfetched) {
      fetchAppointments(userIdfetched);
    }
  }, [userIdfetched]);

  const openConfirmModal = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    handleDelete(appointmentToDelete);
    setIsConfirmModalOpen(false);
  };

  const handleDelete = async (appointmentId) => {
    const jwtToken = localStorage.getItem("jwtToken");

    // if (!jwtToken) {
    //   toast.warning("Please log in again and try deleting.");
    //   setTimeout(() => {
    //     router.push(`/userlogin`);
    //   }, 4000);
    //   return;
    // }
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

  // Update handleModal function to show the modal
  const handleModal = async (appointmentIdmodal) => {
    console.log("Modal with id:", appointmentIdmodal);
    setIsModalOpen(true);
    setModalAppointmentId(appointmentIdmodal);
    const appointment = appointments.find(
      (app) => app._id === appointmentIdmodal
    );
    setModalAppointmentDate(appointment.appointmentDate);
    setModalAppointmentTime(appointment.appointmentTime);
    return appointmentIdmodal;
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEdit = async (appointmentDate) => {
    console.log("hiiiiiiiiiiii");
    // const jwtToken = localStorage.getItem("jwtToken");

    // if (!jwtToken) {
    //   toast.warning("Please log in again and try deleting.");
    //   router.push(`/userlogin`);
    //   return;
    // }
    // const appointmentDate = // get the new date value from your form or state
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
        fetchAppointments(userIdfetched);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentDate = new Date(); // Current date and time
    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    // Check if the selected appointment is in the past
    if (selectedDateTime <= currentDate) {
      toast.error("You cannot book an appointment in the past.");
      return;
    }

    // Check for a 2-hour gap from existing appointments
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const hasConflict = appointments.some((appt) => {
      const existingDateTime = new Date(
        `${appt.appointmentDate}T${appt.appointmentTime}`
      );
      return Math.abs(selectedDateTime - existingDateTime) < twoHoursInMs;
    });

    if (hasConflict) {
      toast.error("There must be at least a 2-hour gap between appointments.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/createAppointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
          },
          body: JSON.stringify({
            disease,
            doctor: selectedDoctor,
            appointmentDate,
            appointmentTime,
          }),
        }
      );

      if (response.ok) {
        const appointment = await response.json();
        setAppointments((prevAppointments) => [
          ...prevAppointments,
          appointment,
        ]);
        setDisease("");
        // setDepartment("");
        // setDoctors("");
        setSelectedDoctor("");
        setAppointmentDate("");
        setAppointmentTime("");
        console.log("Appointment booked:", appointment);
        toast.success("Appointment booked successfully");
        // router.push(`/userProfile`);
      } else if (response.status === 401) {
        toast.warning("Token has expired. Please log in again.");
        Cookies.remove("jwtCookie", { path: "/" });
        sessionStorage.clear();
        localStorage.clear();
        setTimeout(() => {
          router.push(`/userlogin`);
        }, 4000);
      } else {
        const errorMessage = await response.text();
        console.error("Failed to book appointment:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.warning(
        "An error occurred while booking the appointment. Please login and try again."
      );
      setTimeout(() => {
        router.push(`/userlogin`);
      }, 4000);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const doctors = data.filter(
        (user) => 
          user.role === "Doctor" && 
          user.email !== userEmailFromGoogle && 
          user.email !== userEmailFromLoginPage && 
          user.department
      );
      setDoctors(doctors);
      setFilteredDoctors(doctors);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setDoctors([]); 
      setFilteredDoctors([]); 
    } finally {
      setLoading(false);
    }
  };
 
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    if (department === ""){
      setFilteredDoctors(doctors.filter((doc) => doc.department));
    } else {
      const filtered = doctors.filter(
        (doc) => doc.department.toLowerCase() === department.toLowerCase()
      )
      setFilteredDoctors(filtered);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <>
      <Header toggleSidebar={toggleSidebar}/>
      <div className="app-bkng">
      <Sidebar isOpen={isSidebarOpen} role="patient"/>
      <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
        <div className="prof-hdng">
          <h3>Manage Appointment</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row app-frm">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your disease symptoms"
                value={disease}
                onChange={(e) => {
                  setDisease(e.target.value);
                }}
                required
              />
            </div>
            {/* <div className="col-md-3">
              <select
                type="text"
                className="form-control"
                placeholder="Enter your department"
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
            </div> */}
        {/* Department Filter with Icon */}
        <div className="col-md-4">
          <select
            className="form-control"
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
          >
            <option value="">Select Department</option>
            {Array.from(
          new Set(
            doctors
              .filter((doc) => doc.department) // Ensure only valid departments are listed
              .map((doc) => doc.department)
          )
        ).map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
          </select>
          {/* Filter Icon
          <i
            className="bi bi-filter position-absolute"
            style={{
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.2rem",
              color: "#6c757d",
            }}
          ></i> */}
        </div>

            <div className="col-md-4">
              <select
                // type="text"
                className="form-control"
                // placeholder="Choose doctor"
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                }}
                required
              >
                <option value="">Select Doctor</option>
                {Array.isArray(filteredDoctors) && filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc.name}>
                   Dr. {doc.name.toUpperCase()} ({doc.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                placeholder="Enter your appointment date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                }}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="time"
                className="form-control"
                placeholder="Enter Time"
                value={appointmentTime}
                onChange={(e) => {
                  setAppointmentTime(e.target.value);
                }}
                required
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary app-sub">Submit</button>
            </div>
          </div>

          {/* <input
          type="text"
          placeholder="Enter your allergies"
          value={allergies}
          onChange={(e) => {
            setAllergies(e.target.value);
          }}
        /> */}

          {/* <input
          type="text"
          placeholder="Enter your appointment date"
          value={appointmentDate}
          onChange={(e) => {
            setAppointmentDate(e.target.value);
          }}
        /> */}
        </form>
        {/* <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>
            Disease: {appointment.disease}
            Allergies: {appointment.allergies}
            Appointment Date: {appointment.appointmentDate}
            <button>Delete</button>
          </li>
        ))}
      </ul> */}
        {loading ? (
          <div className="spinner-border" role="status">
            <span className="sr-only"></span>
          </div>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Disease Symptoms</th>
                <th>Doctor</th>
                {/* <th>Department</th> */}
                <th>Appointment Date</th>
                <th>Appointment Time (IST)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.disease}</td>
                  <td>Dr. {appointment.doctor.toUpperCase()}</td>
                  {/* <td>{appointment.department}</td> */}
                  <td>{formatDateTime(appointment.appointmentDate)}</td>
                  <td>{appointment.appointmentTime}</td>
                  <td className="action-symbol">
                    <button
                      onClick={() => openConfirmModal(appointment._id)}
                      className="btn btn-outline-danger"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Delete Appointment"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    <button
                      onClick={() => handleModal(appointment._id)}
                      className="btn btn-outline-primary"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Reschedule Appointment"
                    >
                      <i className="fa-solid fa-calendar-days"></i>
                    </button>
                  </td>
                  {/* <td>
                <button onClick={() => handleModal(appointment._id)} className="appointment-button">
                  Edit appointment date
                </button>
              </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {isModalOpen && (
          <div
            className="modal fade show"
            id="exampleModal"
            // tabindex="-1"
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
                    onClick={handleEdit}
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
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default page;
