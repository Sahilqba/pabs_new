"use client";
import Header from "@/components/Header";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
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
    } finally {
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
    // const jwtToken = localStorage.getItem("jwtToken");

    // if (!jwtToken) {
    //   alert("Please log in again and try deleting.");
    //   router.push(`/userlogin`);
    //   return;
    // }
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
        alert("Appointment deleted successfully");
      } else if (response.status === 404) {
        alert("Appointment not found");
      } else if (response.status === 401) {
        alert("Token has expired. Please log in again and try deleting.");
        Cookies.remove('jwtCookie', { path: '/' });
        sessionStorage.clear();
        localStorage.clear();
        router.push(`/userlogin`);
      } else {
        const errorMessage = await response.text();
        console.error("Failed to delete appointment:", errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("An error occurred while deleting the appointment");
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
    if (!modalAppointmentDate) {
      alert("Please select a valid appointment date.");
      return;
    }
    // const appointmentDate = // get the new date value from your form or state
    console.log("New date:", appointmentDate);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updateAppointment/${modalAppointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // replace with your actual token
          },
          body: JSON.stringify({ appointmentDate: modalAppointmentDate }),
        }
      );

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
      } else if (response.status === 401) {
        alert("Token has expired. Please log in again and try rescheduling.");
        Cookies.remove('jwtCookie', { path: '/' });
        sessionStorage.clear();
        localStorage.clear();
        router.push(`/userlogin`);
      } else if (response.status === 400) {
        alert("Please log in again and try rescheduling.");
        router.push(`/userlogin`);
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
        alert("Appointment booked successfully");
        // router.push(`/userProfile`);
      } else if (response.status === 401) {
        alert("Token has expired. Please log in again.");
        Cookies.remove("jwtCookie", { path: "/" });
        sessionStorage.clear();
        localStorage.clear();
        router.push(`/userlogin`);
      } else {
      const errorMessage = await response.text();
      console.error("Failed to book appointment:", errorMessage);
      alert(errorMessage);
    }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(
        "An error occurred while booking the appointment. Please try again."
      );
      router.push(`/userlogin`);
    }
  };

  return (
    <>
      <Header />
      <h1>Appointment booking page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your disease"
          value={disease}
          onChange={(e) => {
            setDisease(e.target.value);
          }}
          required
        />
        {/* <input
          type="text"
          placeholder="Enter your allergies"
          value={allergies}
          onChange={(e) => {
            setAllergies(e.target.value);
          }}
        /> */}
        <select
          type="text"
          placeholder="Enter your allergies"
          value={allergies}
          onChange={(e) => {
            setAllergies(e.target.value);
          }}
        >
          <option value="">Not any</option>
          <option value="Vomiting">Vomiting</option>
          <option value="Nausea">Nausea</option>
          <option value="Food allergies">Food allergies</option>
          <option value="Rash">Rash</option>
          <option value="Any other allergies">Any other allergies</option>
        </select>
        {/* <input
          type="text"
          placeholder="Enter your appointment date"
          value={appointmentDate}
          onChange={(e) => {
            setAppointmentDate(e.target.value);
          }}
        /> */}
        <input
          type="date"
          placeholder="Enter your appointment date"
          value={appointmentDate}
          onChange={(e) => {
            setAppointmentDate(e.target.value);
          }}
          min={new Date().toISOString().split("T")[0]}
          required
        />

        <button className="appointment-button">Submit</button>
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
              <th>Disease</th>
              <th>Allergies</th>
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
                <td>
                  <button
                    onClick={() => handleDelete(appointment._id)}
                    className="appointment-button"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleModal(appointment._id)}
                    className="appointment-button"
                  >
                    Edit appointment date
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
                Please update the appointment date
              </div>
              <div className="modal-body">
                <input
                  type="date"
                  placeholder="Enter your updated appointment date"
                  value={modalAppointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setModalAppointmentDate(e.target.value);
                  }}
                  required
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEdit}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default page;
