import Link from "next/link";
import Cookies from "js-cookie";
const Sidebar = ({ isOpen, role }) => {
  let isDoctor = localStorage.getItem("isDoctor");
  let isDoctorGoogle = Cookies.get("isDoctor");
  console.log("isDoctor:", isDoctor);
  return (
    <aside className={`sidebar bg-light p-3 ${isOpen ? "show" : "hide"}`}>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link href="/userProfile" className="nav-link sd-link">
            <i className="bi bi-house"></i>
            Home Page
          </Link>
        </li>
        {role === "doctor" && (
          <>
            <li className="nav-item">
              <Link href="/docAppointment" className="nav-link sd-link">
                <i className="bi bi-capsule-pill"></i>
                Appointments
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/docPastApp" className="nav-link sd-link">
                <i className="bi bi-prescription2"></i>
                Past Appointments
              </Link>
            </li>
          </>
        )}
        {role === "patient" && (
          <li className="nav-item">
            <Link href="/appointmentBooking" className="nav-link sd-link">
              <i className="bi bi-capsule-pill"></i>
              Book Appointment
            </Link>
          </li>
        )}
        {/* {isDoctor === "true" ||
          (isDoctorGoogle === "true" && (
            <li className="nav-item">
              <Link
                // href="/appointmentBooking"
                href="/doctorProfilePage"
                className="nav-link sd-link"
              >
                <i className="bi bi-capsule-pill"></i>
                Go to doctor's profile
              </Link>
            </li>
          ))} */}
          {(isDoctor === "true" || isDoctorGoogle === "true") && (
  <li className="nav-item">
    <Link
      // href="/appointmentBooking"
      href="/doctorProfilePage"
      className="nav-link sd-link"
    >
      <i className="bi bi-capsule-pill"></i>
      Go to doctor's profile
    </Link>
  </li>
)}
      </ul>
    </aside>
  );
};
export default Sidebar;
