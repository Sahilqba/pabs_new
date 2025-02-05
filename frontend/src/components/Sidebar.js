// import Link from "next/link";
// import Cookies from "js-cookie";
// const Sidebar = ({ isOpen, role }) => {
//   let isDoctor = localStorage.getItem("isDoctor");
//   let isDoctorGoogle = Cookies.get("isDoctor");
//   console.log("isDoctor:", isDoctor);
//   return (
//     <aside className={`sidebar bg-light p-3 ${isOpen ? "show" : "hide"}`}>
//       <ul className="nav flex-column">
//         <li className="nav-item">
//           <Link href="/userProfile" className="nav-link sd-link">
//             <i className="bi bi-house"></i>
//             Home Page
//           </Link>
//         </li>
//         {role === "doctor" && (
//           <>
//             <li className="nav-item">
//               <Link href="/docAppointment" className="nav-link sd-link">
//                 <i className="bi bi-capsule-pill"></i>
//                 Appointments
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link href="/docPastApp" className="nav-link sd-link">
//                 <i className="bi bi-prescription2"></i>
//                 Past Appointments
//               </Link>
//             </li>
//           </>
//         )}
//         {role === "patient" && (
//           <li className="nav-item">
//             <Link href="/appointmentBooking" className="nav-link sd-link">
//               <i className="bi bi-capsule-pill"></i>
//               Book Appointment
//             </Link>
//           </li>
//         )}
//         {/* {isDoctor === "true" ||
//           (isDoctorGoogle === "true" && (
//             <li className="nav-item">
//               <Link
//                 // href="/appointmentBooking"
//                 href="/doctorProfilePage"
//                 className="nav-link sd-link"
//               >
//                 <i className="bi bi-capsule-pill"></i>
//                 Go to doctor's profile
//               </Link>
//             </li>
//           ))} */}
//           {(isDoctor === "true" || isDoctorGoogle === "true") && (
//   <li className="nav-item">
//     <Link
//       // href="/appointmentBooking"
//       href="/doctorProfilePage"
//       className="nav-link sd-link"
//     >
//       <i className="bi bi-capsule-pill"></i>
//       Go to Patient's profile
//     </Link>
//   </li>
// )}
//       </ul>
//     </aside>
//   );
// };
// export default Sidebar;

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Sidebar = ({ isOpen }) => {
  const [isDoctor, setIsDoctor] = useState(false);
  const [viewAsPatient, setViewAsPatient] = useState(false); 
  const router = useRouter();

  // useEffect(() => {
  //   const doctorStatus =
  //     localStorage.getItem("isDoctor") === "true" ||
  //     Cookies.get("isDoctor") === "true";
  //   setIsDoctor(doctorStatus);

  //   const storedView = localStorage.getItem("viewAsPatient") === "true";
  //   setViewAsPatient(storedView);
  // }, []);

  // const toggleProfileView = () => {
  //   const newView = !viewAsPatient;
  //   setViewAsPatient(newView);
  //   localStorage.setItem("viewAsPatient", newView.toString());

  //   // Redirect to the correct profile page
  //   router.push(newView ? "/patientProfilePage" : "/doctorProfilePage");
  // };
  useEffect(() => {
    const doctorStatus = localStorage.getItem("isDoctor") === "true" || Cookies.get("isDoctor") === "true";
    setIsDoctor(doctorStatus);
  }, []);

  const handleProfileClick = () => {
    setViewAsPatient(!viewAsPatient);
  };
  
  const profileHref = viewAsPatient ? "/userProfile" : "/patientProfilePage";

  return (
    <aside className={`sidebar bg-light p-3 ${isOpen ? "show" : "hide"}`}>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link href="/userProfile" className="nav-link sd-link">
            <i className="bi bi-house"></i>
            Home Page
          </Link>
        </li>

        {(!isDoctor || viewAsPatient) && (
          <li className="nav-item">
            <Link href="/appointmentBooking" className="nav-link sd-link">
              <i className="bi bi-capsule-pill"></i>
              Book Appointment
            </Link>
          </li>
        )}

        {isDoctor && !viewAsPatient && (
          <>
            <li className="nav-item">
              <Link href="/docAppointment" className="nav-link sd-link">
                <i className="bi bi-calendar-check"></i>
                Appointments
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/docPastApp" className="nav-link sd-link">
                <i className="bi bi-clock-history"></i>
                Past Appointments
              </Link>
            </li>
          </>
        )}

        {isDoctor && (
          <li className="nav-item">
            <Link
              href={profileHref}
              className="nav-link sd-link"
              onClick={handleProfileClick} // Toggle state on click
            >
              <i className="bi bi-person-badge"></i>{" "}
              {viewAsPatient ? "Switch to Doctor Profile" : "Switch to Patient Profile"}
            </Link>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
