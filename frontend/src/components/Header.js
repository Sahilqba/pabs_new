"use client";
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
function Header({toggleSidebar}) {
  const router = useRouter();
  useEffect(() => {
    // Dynamically load Bootstrap's JS bundle
    import("bootstrap/dist/js/bootstrap.bundle.min").then(() => {
      console.log("Bootstrap JS loaded successfully");
    }).catch((err) => {
      console.error("Error loading Bootstrap JS:", err);
    });
  }, []);
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
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
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // useEffect(() => {
  //   import("bootstrap/dist/js/bootstrap.bundle").catch(console.error);
  // }, []);
  // const handleProfileClick = (e) => {
  //   e.preventDefault();
  //   router.push("/user/profile");
  // };
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark">
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
              {/* <li className="nav-item dropdown">
                <button
                  className="nav-link"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-fill"></i>
                </button>
                <ul className="dropdown-menu drpdwn-sec">
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Logout</span>
                    </a>
                  </li>
                </ul>
              </li> */}
              <li className="nav-item dropdown">
              <a
                  className="nav-link"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
    {/* <i className="bi bi-person-fill"></i> */}
  {/* </a> */}
  {/* <ul className="dropdown-menu drpdwn-sec" aria-labelledby="navbarDropdown">
    <li>
      <button
        className="dropdown-item"
        onClick={handleLogout}
        style={{ background: "none", border: "none", color: "inherit" }}
      >
        <i className="bi bi-box-arrow-right"></i>
        <span>Logout</span>
      </button>
    </li>
  </ul> */}
{/* </li> */}
                  <i className="bi bi-power" onClick={handleLogout} title="Logout"></i>
                </a>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
