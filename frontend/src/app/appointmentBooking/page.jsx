"use client";
import Header from "@/components/Header";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';
import { Tooltip } from "bootstrap";
function page() {
  // useEffect(() => {
  //   require("bootstrap/dist/js/bootstrap.js");
  // });
  // useEffect(() => {
  //   // Initialize Bootstrap tooltips
  //   const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  //   tooltipTriggerList.forEach((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
  // }, []);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAppointmentId, setModalAppointmentId] = useState(null);
  const [modalAppointmentDate, setModalAppointmentDate] = useState("");
  const [modalAppointmentTime, setModalAppointmentTime] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const userIdfetched = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const jwtToken = localStorage.getItem("jwtToken");
  const router = useRouter();
  const [disease, setDisease] = React.useState(
    sessionStorage.getItem("disease") || ""
  );
  const [allergies, setAllergies] = React.useState(
    sessionStorage.getItem("allergies") || ""
  );
  const [appointmentDate, setAppointmentDate] = React.useState(
    sessionStorage.getItem("appointmentDate") || ""
  );
  const [appointmentTime, setAppointmentTime] = React.useState(
    sessionStorage.getItem("appointmentTime") || ""
  );
  useEffect(() => {
    sessionStorage.setItem("disease", disease);
  }, [disease]);

  useEffect(() => {
    sessionStorage.setItem("allergies", allergies);
  }, [allergies]);

  useEffect(() => {
    sessionStorage.setItem("appointmentDate", appointmentDate);
  }, [appointmentDate]);
  useEffect(() => {
    sessionStorage.setItem("appointmentTime", appointmentTime);
  }, [appointmentTime]);

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
 
    if (!jwtToken) {
      toast.warning("Please log in again and try deleting.");
      router.push(`/userlogin`);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deleteAppointment/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
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
        toast.warning("Token has expired. Please log in again and try deleting.");
        Cookies.remove('jwtCookie', { path: '/' });
        sessionStorage.clear();
        localStorage.clear();
        router.push(`/userlogin`);
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
    const appointment = appointments.find(app => app._id === appointmentIdmodal);
    setModalAppointmentDate(appointment.appointmentDate);
    setModalAppointmentTime(appointment.appointmentTime);
    return appointmentIdmodal;
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // const handleEdit = async () => {
  //   console.log("Editing appointment with id:", modalAppointmentId);
  //   setIsModalOpen(false);
  // };

  const handleEdit = async (appointmentDate) => {
    // const appointmentDate = // get the new date value from your form or state
    if (!modalAppointmentDate && !modalAppointmentTime) {
      toast.error("Please select a valid appointment date & time.");
      return;
    }
 
  //  console.log("New date:", appointmentDate);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/updateAppointment/${modalAppointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}` // replace with your actual token
        },
        body: JSON.stringify({ appointmentDate: modalAppointmentDate, appointmentTime: modalAppointmentTime })
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Appointment date updated successfully", data);
        toast.success("Appointment date & time updated successfully")
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === modalAppointmentId
              ? { ...appointment, appointmentDate: modalAppointmentDate, appointmentTime: modalAppointmentTime }
              : appointment
          )
        );
        setIsModalOpen(false);
        // handle success (e.g., update state, close modal, show notification)
      } 
      else if (response.status === 401) {
        toast.warning("Token has expired. Please log in again and try rescheduling.");
        Cookies.remove('jwtCookie', { path: '/' });
        sessionStorage.clear();
        localStorage.clear();
        router.push(`/userlogin`);
      }
      else {
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
    const existingDateTime = new Date(`${appt.appointmentDate}T${appt.appointmentTime}`);
    return (
      Math.abs(selectedDateTime - existingDateTime) < twoHoursInMs
    );
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
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            disease,
            allergies,
            appointmentDate,
            appointmentTime
          }),
        }
      );
 
      if (response.ok) {
        const appointment = await response.json();
        setAppointments((prevAppointments) => [
          ...prevAppointments,
          appointment,
        ]);
        console.log("Appointment booked:", appointment);
        toast.success("Appointment booked successfully");
        // router.push(`/userProfile`);
      } else if (response.status === 401) {
        toast.warning("Token has expired. Please log in again.");
        Cookies.remove("jwtCookie", { path: "/" });
        sessionStorage.clear();
        localStorage.clear();
        router.push(`/userlogin`);
      } else {
      const errorMessage = await response.text();
      console.error("Failed to book appointment:", errorMessage);
      toast.error(errorMessage);
    }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(
        "An error occurred while booking the appointment. Please try again."
      );
      router.push(`/userlogin`);
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
  return (
    <>
      <Header />
      <main className="main">
      <div className="prof-hdng">  
      <h3>Manage Appointment</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row">
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
          <div className="col-md-3">
            <select
              type="text"
              className="form-control"
              placeholder="Enter your allergies"
              value={allergies}
              onChange={(e) => {
                setAllergies(e.target.value);
              }}
            >
              <option value="">Select Department</option>
              <option value="GeneralPhysician">General Physician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Neurology">Neurology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="col-md-2">
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
          <div className="col-md-1">
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
          <div className="col-md-2">
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
            <th>Department</th>
            <th>Appointment Date</th>
            <th>Appointment Time (IST)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.disease}</td>
              <td>{appointment.allergies}</td>
              <td>{formatDateTime(appointment.appointmentDate)}</td>
              <td>{appointment.appointmentTime}</td>
              <td className="action-symbol">
                 <button onClick={() => openConfirmModal(appointment._id)} className="btn btn-outline-danger"  data-bs-toggle="tooltip"
        data-bs-placement="bottom" title="Delete Appointment"> 
                <i className="fa-solid fa-trash"></i> 
                </button>
                <button onClick={() => handleModal(appointment._id)} className="btn btn-outline-primary"  data-bs-toggle="tooltip"
        data-bs-placement="bottom" title="Reschedule Appointment">
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
                <button type="button" className="btn btn-primary" onClick={handleEdit} >
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
      <Footer />
      <ToastContainer />
    </>
  );
}

export default page;
