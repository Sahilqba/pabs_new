import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Sidebar = ({ isOpen, role }) => {
  const router = useRouter();
  const handlehomeClick = (e) => {
    e.preventDefault();
    toast.info("Navigating to Home page...");
    setTimeout(() => {
      router.push("/userProfile");
    }, 2000); // Adjust the delay as needed
  };
  const handleAppointmentsClick = (e) => {
    e.preventDefault();
    toast.info("Navigating to Appointments...");
    setTimeout(() => {
      router.push("/docAppointment");
    }, 2000); // Adjust the delay as needed
  };

  const handlePastAppointmentsClick = (e) => {
    e.preventDefault();
    toast.info("Navigating to past appointments...");
    setTimeout(() => {
      router.push("/docPastApp");
    }, 2000); // Adjust the delay as needed
  };
  const handlebookAppointmentClick = (e) => {
    e.preventDefault();
    toast.info("Navigating to Appointment booking page...");
    setTimeout(() => {
      router.push("/appointmentBooking");
    }, 2000); // Adjust the delay as needed
  };
  return (
    <aside className={`sidebar bg-light p-3 ${isOpen ? "show" : "hide"}`}>
      <ul className="nav flex-column">
        <li className="nav-item">
          <a
            href="/userProfile"
            className="nav-link sd-link"
            onClick={handlehomeClick}
          >
            <i className="bi bi-house"></i>
            Home Page
          </a>
        </li>
        {role === "doctor" && (
          <>
            <li className="nav-item">
              <a
                href="/docAppointment"
                className="nav-link sd-link"
                onClick={handleAppointmentsClick}
              >
                <i className="bi bi-capsule-pill"></i>
                Appointments
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/docPastApp"
                className="nav-link sd-link"
                onClick={handlePastAppointmentsClick}
              >
                <i className="bi bi-prescription2"></i>
                Past Appointments
              </a>
            </li>
          </>
        )}
        {role === "patient" && (
          <li className="nav-item">
            <a
              href="/appointmentBooking"
              className="nav-link sd-link"
              onClick={handlebookAppointmentClick}
            >
              <i className="bi bi-capsule-pill"></i>
              Book Appointment
            </a>
          </li>
        )}
      </ul>
    </aside>
  );
};
export default Sidebar;
