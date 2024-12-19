import Link from "next/link";
const Sidebar = ({ isOpen }) => {
    return(
        <aside className={`sidebar bg-light p-3 ${isOpen ? "show" : "hide"}`}>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href="#" className="nav-link sd-link">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link href="#" className="nav-link sd-link">
              Appointments
            </Link>
          </li>
          <li className="nav-item">
            <Link href="#" className="nav-link sd-link">
              Patients
            </Link>
          </li>
          <li className="nav-item">
            <Link href="#" className="nav-link sd-link">
              Reports
            </Link>
          </li>
        </ul>
      </aside>
    )
}
export default Sidebar;