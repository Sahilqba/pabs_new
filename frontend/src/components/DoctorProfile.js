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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department) {
      toast.error("Please select your department.");
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
        toast.success("Department set successfully");
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
        toast.success("Profile picture updated successfully.");
        setImagePath(data.path);
        setImageName(data.filename);
        fetchProfilePicture(userIdfetched);
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
          <div className="prof-main">
            <div className="prof-hdng">
              <h3>Hi Dr. {userName}, Welcome.</h3>
            </div>
            <div className="profile-picture-container">
              <div className="avatar-wrapper">
                {imagePath ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`}
                    alt="Profile"
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-person-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>
                  </div>
                )}
                <div
                  className="menu-trigger"
                  onClick={toggleMenu}
                  style={{ cursor: "pointer" }}
                >
                  ...
                </div>
              </div>
              {menuOpen && (
                <div className="menu">
                  <button
                    className="menu-item"
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    Upload Picture
                  </button>
                  <button className="menu-item" onClick={handleDelete}>
                    Delete Picture
                  </button>
                  {/* <button
                    className="menu-item"
                    onClick={() => setPreviewImage(imagePath)}
                  >
                    Preview Picture
                  </button> */}
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
          </div>
          {/* {previewImage && (
              <div className="modal">
                <div className="modal-content">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${previewImage}`}
                    alt="Preview"
                  />
                  <button
                    className="close-btn"
                    onClick={() => setPreviewImage(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )} */}
          <form>
            <div className="doc-dept">
                <div className="doc-sel">
              <select
                type="text"
                className="form-select dept-sel"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select your Department</option>
                <option value="GeneralPhysician">General Physician</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Neurology">Neurology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Others">Others</option>
              </select>
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your Qualification*"
                  // value={qualification}
                  value={qualification || ""}
                  onChange={(e) => {
                    setQualification(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your Experience year*"
                  // value={experianceyear}
                  value={experianceyear || ""}
                  onChange={(e) => {
                    setExperianceyear(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your Previous work place if any"
                  // value={previousCompany}
                  value={previousCompany || ""}
                  onChange={(e) => {
                    setpreviousCompany(e.target.value);
                  }}
                />
              </div>
              
              <button
                className="btn btn-primary dept-btn"
                type="button"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};
export default DoctorProfile;
