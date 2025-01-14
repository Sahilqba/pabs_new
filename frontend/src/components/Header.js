"use client";
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
function Header({toggleSidebar}) {
  const router = useRouter();
    const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    // Dynamically load Bootstrap's JS bundle
    import("bootstrap/dist/js/bootstrap.bundle.min").then(() => {
      // console.log("Bootstrap JS loaded successfully");
    }).catch((err) => {
      console.error("Error loading Bootstrap JS:", err);
    });
  }, []);
  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setLoading(false);
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        sessionStorage.clear();
        Cookies.remove("jwtCookie", { path: "/" });
        Cookies.remove("emailFromGoogle", { path: "/" });
        Cookies.remove("nameFromGoogle", { path: "/" });
        Cookies.remove("userId", { path: "/" });
        Cookies.remove("userRoleGoogle", { path: "/" });
        Cookies.remove("passwordFromLoginPage", { path: "/" });
        Cookies.remove("emailFromLoginPage", { path: "/" });
        Cookies.remove("userIdinDb", { path: "/" });
        await router.push("/userlogin");
      } else {
        console.error("Logout failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark">
      {loading ? (
            <div className="spinner-border" role="status">
              <span className="sr-only"></span>
            </div>
          ) : (
        <div className="container-fluid">
          <div className="hmbrgr-drpdwn">
          <a className="navbar-brand">
            <i className="bi bi-superscript"></i>
          </a>
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <i className="bi bi-list"></i>
          </button>
          </div>
          <div className="logout-drpdwn">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
              <a
                  className="nav-link"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-power" onClick={handleLogout} title="Logout"></i>
                </a>
              </li>
            </ul>
          </div>
          </div>
        </div>
          )}
      </nav>
    </>
  );
}

export default Header;
