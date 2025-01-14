import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const DoctorProfile = () => {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [qualification, setQualification] = useState("");
  const [experianceyear, setExperianceyear] = useState("");
  const [previousCompany, setpreviousCompany] = useState("");
  const [userName, setUserName] = useState(null);
  const userIdfetched = Cookies.get("userId");
  const jwtToken = localStorage.getItem("jwtToken");
  const userIdinDb = Cookies.get("userIdinDb");
  const jwtCookie = Cookies.get("jwtCookie");
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [modal, setModal] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleMenu = () => {
    console.log("Menu toggled!");
    setMenuOpen(!menuOpen);
  };
  useEffect(() => {
    console.log("Menu state:", menuOpen);
  }, [menuOpen]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUserName = localStorage.getItem("userName");
    const nameFromGoogle = Cookies.get("nameFromGoogle");
    const userRoleGoogle = Cookies.get("userRoleGoogle");
    setRole(storedRole || userRoleGoogle);
    setUserName(storedUserName || nameFromGoogle);
  }, []);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  const fetchDepartment = async (userIdfetched) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorDepartment/${userIdfetched}`,
        {
          method: "GET",
          headers: {
            // Authorization: `Bearer ${jwtToken}`,
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // console.log("Department data:", data);
      setDepartment(data.department);
      setImageName(data.filename);
      setImagePath(data.path);
      setQualification(data.qualification);
      setExperianceyear(data.experianceyear);
      setpreviousCompany(data.previousCompany);
    } catch (error) {
      console.error("Failed to fetch department:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userIdfetched = Cookies.get("userId");
    if (userIdfetched) {
      fetchDepartment(userIdfetched);
    }
  }, [userIdfetched]);

  const validateForm = () => {
    const newErrors = {};

    if (!department) newErrors.department = "Please select your department.";
    if (!qualification) newErrors.qualification = "Qualification is required.";
    if (!experianceyear)
      newErrors.experianceyear = "Please select your experience.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!department || !qualification || !experianceyear) {
    //   toast.error("Please fill the required fields.");
    //   return;
    // }

    if (!validateForm()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("department", department);
    // formData.append("qualification", qualification);
    // formData.append("experianceyear", experianceyear);
    // formData.append("previousCompany", previousCompany);

    if (qualification) {
      formData.append("qualification", qualification);
    }
    if (experianceyear) {
      formData.append("experianceyear", experianceyear);
    }
    if (previousCompany) {
      formData.append("previousCompany", previousCompany);
    }
    console.log(formData);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updateDepartment/${userIdinDb}`,
        {
          method: "PATCH",
          headers: {
            // "Content-Type": "application/json", // Remove this line
            Authorization: `Bearer ${jwtToken ? jwtToken : jwtCookie}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        toast.success("Information set successfully");
        // setImageName(data.image);
        fetchDepartment(userIdfetched);
      } else if (response.status === 401) {
        toast.warning(
          "Token has expired. Please log in again and try rescheduling."
        );
      } else if (response.status === 400) {
        toast.warning("Appointment date is required.");
      } else {
        const errorData = await response.json();
        console.error("Error updating appointment date", errorData);
      }
    } catch (error) {
      console.error("Network error", error);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorDepartment/${userIdinDb}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken || jwtCookie}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImagePath(data.path);
        setImageName(data.filename);
      } else {
        throw new Error("Failed to fetch profile picture.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    console.log("File:", file);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updateDepartment/${userIdinDb}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${jwtToken || jwtCookie}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        toast.success("Profile picture updated successfully.");
        setImagePath(data.path);
        setImageName(data.filename);
        fetchProfilePicture(userIdfetched);
        setMenuOpen(false);
      } else if (response.status === 401) {
        toast.warning(
          "Token has expired. Please log in again and try rescheduling."
        );
      } else {
        toast.error("Failed to update profile picture");
        const errorData = await response.json();
        console.error("Error updating image", errorData);
      }
    } catch (error) {
      console.error("Network error", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deleteDoctorImage/${userIdinDb}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken || jwtCookie}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Profile picture deleted.");
        setImagePath("");
        setImageName("");
        setMenuOpen(false);
      } else {
        toast.error("Failed to delete picture.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  useEffect(() => {
    fetchProfilePicture();
  }, []);
  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="doc-panel">
        <Sidebar isOpen={isSidebarOpen} role="doctor" />
        <main className={`main-container ${isSidebarOpen ? "show" : ""}`}>
          {/* <div className="prof-hdng">
        <h3>Hi Dr. {userName}, Welcome.</h3>
        </div> */}
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="doc-details-card">
                <div className="profile-picture-container text-center">
                  {imagePath ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`}
                      alt="Profile"
                      className="avatar rounded-circle"
                      onClick={toggleMenu}
                      aria-haspopup="true"
                      aria-expanded={menuOpen}
                    />
                  ) : (
                    <div
                      className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center"
                      aria-label="Default profile picture"
                      onClick={toggleMenu}
                      aria-haspopup="true"
                      aria-expanded={menuOpen}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="currentColor"
                        className="bi bi-person-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                      </svg>
                    </div>
                  )}
                  {/* <div
                className="menu-trigger"
                onClick={toggleMenu}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                ...
              </div> */}
                  {menuOpen && (
                    <div className="menu position-absolute bg-light border shadow-sm">
                      <button
                        className="menu-item btn btn-sm btn-link text-start"
                        onClick={() =>
                          document.getElementById("file-input").click()
                        }
                      >
                        Upload Picture
                      </button>
                      <button
                        className="menu-item btn btn-sm btn-link text-start"
                        onClick={handleDelete}
                      >
                        Delete Picture
                      </button>
                    </div>
                  )}
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleUpload(e.target.files[0])}
                />

                <div className="prof-hdng">
                  <h3> Dr. {userName}</h3>
                </div>
                <div className="doc-dept">
                  <div className="row">
                    <div className="col-md-12">
                      <select
                        // type="text"
                        className={`form-select dept-sel doc-inp w-100 ${
                          errors.department ? "is-invalid" : ""
                        }`}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option value="">Select your Department</option>
                        <option value="GeneralPhysician">
                          General Physician
                        </option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Others">Others</option>
                      </select>
                      {errors.department && (
                        <div className="invalid-feedback">
                          {errors.department}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12">
                      <input
                        type="text"
                        className={`form-control doc-inp ${
                          errors.qualification ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your Qualification*"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                      />
                      {errors.qualification && (
                        <div className="invalid-feedback">
                          {errors.qualification}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12">
                      <select
                        className={`form-select dept-sel doc-inp w-100 ${
                          errors.experianceyear ? "is-invalid" : ""
                        }`}
                        value={experianceyear}
                        onChange={(e) => {
                          setExperianceyear(e.target.value);
                          console.log(
                            "Selected Experience Year:",
                            e.target.value
                          ); // Debugging
                        }}
                      >
                        <option value="">Select your Experience Year</option>
                        <option value="0-1year">0-1 year</option>
                        <option value="2-5years">2-5 years</option>
                        <option value="6-10years">6-10 years</option>
                        <option value="10+years">10+ years</option>
                      </select>
                      {errors.experianceyear && (
                        <div className="invalid-feedback">
                          {errors.experianceyear}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12">
                      <input
                        type="text"
                        className="form-control doc-inp"
                        placeholder="Enter your Previous workplace (if any)"
                        value={previousCompany}
                        onChange={(e) => setpreviousCompany(e.target.value)}
                      />
                    </div>
                    <div className="col-md-12">
                      <button
                        className="btn btn-primary dept-btn w-100 doc-inp"
                        type="button"
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};
export default DoctorProfile;
