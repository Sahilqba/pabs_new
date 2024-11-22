"use client";
import Header from "@/components/Header";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function page() {
  // const [disease, setDisease] = React.useState("");
  // const [allergies, setAllergies] = React.useState("");
  // const [appointmentDate, setAppointmentDate] = React.useState("");
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAppointmentId, setModalAppointmentId] = useState(null);
  const [modalAppointmentDate, setModalAppointmentDate] = useState("");
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

  useEffect(() => {
    sessionStorage.setItem("disease", disease);
  }, [disease]);

  useEffect(() => {
    sessionStorage.setItem("allergies", allergies);
  }, [allergies]);

  useEffect(() => {
    sessionStorage.setItem("appointmentDate", appointmentDate);
  }, [appointmentDate]);

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

  const handleDelete = async (appointmentId) => {
    console.log("Delete appointment with id:", appointmentId);
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
    if (!modalAppointmentDate) {
      toast.error("Please select a valid appointment date.");
      return;
    }
 
   console.log("New date:", appointmentDate);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/updateAppointment/${modalAppointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}` // replace with your actual token
        },
        body: JSON.stringify({ appointmentDate: modalAppointmentDate })
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Appointment date updated successfully", data);
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === modalAppointmentId
              ? { ...appointment, appointmentDate: modalAppointmentDate }
              : appointment
          )
        );
        setIsModalOpen(false);
        // handle success (e.g., update state, close modal, show notification)
      } 
      else if (response.status === 401) {
        toast.warning("Token has expired. Please log in again and try rescheduling.");
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
        }),
      }
    );

    if (response.ok) {
      const appointment = await response.json();
      setAppointments((prevAppointments) => [...prevAppointments, appointment]);
      console.log("Appointment booked:", appointment);
      toast.success("Appointment booked successfully");
      // router.push(`/userProfile`);
    } else if (response.status === 401) {
      toast.warning("Token has expired. Please log in again.");
      sessionStorage.clear();
      router.push(`/userlogin`);
    } else {
      const errorMessage = await response.text();
      console.error("Failed to book appointment:", errorMessage);
      toast.error(errorMessage);
    }
    
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
              <option value="General Physician">General Physician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Neurology">Neurology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="col-md-3">
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.disease}</td>
              <td>{appointment.allergies}</td>
              <td>{appointment.appointmentDate}</td>
              <td className="action-symbol">
                <button onClick={() => handleDelete(appointment._id)} className="btn btn-outline-danger" title="Delete Appointment">
                <i class="fa-solid fa-trash"></i> 
                </button>
                <button onClick={() => handleModal(appointment._id)} className="btn btn-outline-primary" title="Reschedule Appointment">
                <i class="fa-solid fa-calendar-days"></i>
                </button>
                
                 {/* <i
            className="fas fa-times-circle"
            onClick={() => handleDelete(appointment._id)}
            title="Cancel Appointment"
          ></i>
           <i
            className="fas fa-calendar-check "
            onClick={() => handleModal(appointment._id)}
            title="Reschedule Appointment"
          ></i> */}
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
                Please update the appointment date
              </div>
              <div className="modal-body">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Enter your updated appointment date"
                  value={modalAppointmentDate}
                  onChange={(e) => {
                    setModalAppointmentDate(e.target.value);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  // onChange={(e) => {
                  //   const appointmentDate = e.target.value;
                  //   setAppointmentDate(appointmentDate);
                  //   // handleEdit(appointmentDate);
                  // }}
                  // required
                />
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
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default page;
