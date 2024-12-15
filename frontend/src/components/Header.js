"use client";
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
function Header() {
  const router = useRouter();
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
        await router.push("/userlogin");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle").catch(console.error);
  }, []);
  // const handleProfileClick = (e) => {
  //   e.preventDefault();
  //   router.push("/user/profile");
  // };
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <a className="navbar-brand">
            <i className="bi bi-superscript"></i>
          </a>
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
                  <i className="bi bi-person-fill"></i>
                </a>
                <ul className="dropdown-menu drpdwn-sec">
                  <li>
                    {/* <a className="dropdown-item" href="#" 
                    // onClick = {handleProfileClick}
                    >
                      Profile
                    </a> */}
                  </li>
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
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
