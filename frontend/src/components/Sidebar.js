import Link from "next/link";
const Sidebar = ({ isOpen, role }) => {
    return(
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
                Upcoming Appointments
              </Link>
            </li>
             <li className="nav-item">
              <Link href="/docPastApp" className="nav-link sd-link">
                Past Appointments
              </Link>
            </li>
           {/* <li className="nav-item">
              <Link href="#" className="nav-link sd-link">
                Reports
              </Link>
            </li> */}
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
        </ul>
      </aside>
    )
}
export default Sidebar;