"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
function Header() {

  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    sessionStorage.clear();
    router.push(`/userlogin`);
  };
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  // const handleProfileClick = (e) => {
  //   e.preventDefault();
  //   router.push("/user/profile");
  // };
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
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
                  className="nav-link "
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
