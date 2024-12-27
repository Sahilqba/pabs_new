// import React from "react";

// const DoctorSelect = ({ doctors, selectedDoctor, setSelectedDoctor }) => {
//   return (
//     <div className="custom-select">
//       <select
//         className="form-control"
//         value={selectedDoctor}
//         onChange={(e) => setSelectedDoctor(e.target.value)}
//         required
//       >
//         <option value="">Select Doctor</option>
//         {doctors.map((doc) => (
//           <option key={doc._id} value={doc._id}>
//             Dr. {doc.name.toUpperCase()} ({doc.department})
//           </option>
//         ))}
//       </select>
//       <div className="doctor-images">
//         {doctors.map((doc) => (
//           <div key={doc._id} className="doctor-option">
//             <img src={`${process.env.NEXT_PUBLIC_API_URL}/${doc.path}`} alt={doc.name} />
//             <span>Dr. {doc.name.toUpperCase()} ({doc.department})</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DoctorSelect;

import React, { useState } from "react";

const DoctorSelect = ({ doctors, selectedDoctor, setSelectedDoctor }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctor(doctorId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="custom-select">
      <div
        className="form-control dropdown-toggle"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedDoctor
          ? `Dr. ${doctors.find((doc) => doc._id === selectedDoctor).name.toUpperCase()}`
          : "Select Doctor"}
      </div>
      {isDropdownOpen && (
        <div className="dropdown-menu show">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="dropdown-item doctor-option"
              onClick={() => handleSelectDoctor(doc._id)}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${doc.path}`}
                alt={doc.name}
                className="doctor-image"
              />
              <span>
                Dr. {doc.name.toUpperCase()} ({doc.department})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSelect;