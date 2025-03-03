"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import DoctorProfile from "@/components/DoctorProfile";
import PatientProfile from "@/components/PatientProfile";
 
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const [role, setRole] = useState(null);
  const [isDoctor, setIsDoctor] = useState(null);
  const [userName, setUserName] = useState(null);
  // const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedisDoctor = localStorage.getItem("isDoctor");
    const storedUserName = localStorage.getItem("userName");
    const nameFromGoogle = Cookies.get("nameFromGoogle");
    const userRoleGoogle = Cookies.get("userRoleGoogle");
    const isDoctorGoogle = Cookies.get("isDoctor");
    setRole(storedRole || userRoleGoogle);
    setIsDoctor(storedisDoctor || isDoctorGoogle);
    setUserName(storedUserName || nameFromGoogle);
  }, []);

  // const handleLogout = async () => {
  //   try {
  //     const response = await fetch("http://localhost:8080/logout", {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //     if (response.ok) {
  //       setLoading(false);
  //       toast.success("Logging you out...");
  //       localStorage.removeItem("jwtToken");
  //       localStorage.removeItem("role");
  //       localStorage.removeItem("userName");
  //       localStorage.removeItem("userId");
  //       localStorage.removeItem("isDoctor");
  //       sessionStorage.clear();
  //       Cookies.remove("jwtCookie", { path: "/" });
  //       Cookies.remove("emailFromGoogle", { path: "/" });
  //       Cookies.remove("nameFromGoogle", { path: "/" });
  //       Cookies.remove("userId", { path: "/" });
  //       Cookies.remove("userRoleGoogle", { path: "/" });
  //       Cookies.remove("passwordFromLoginPage", { path: "/" });
  //       Cookies.remove("emailFromLoginPage", { path: "/" });
  //       Cookies.remove("userIdinDb", { path: "/" });
  //       await router.push("/userlogin");
  //     } else {
  //       console.error("Logout failed");
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (!userName || !isDoctor) {
  //     handleLogout();
  //   }
  // }, [userName, isDoctor]);
 
  if (!userName || !isDoctor) {
    return <div>Please refresh the page...</div>;
  }
  const normalizedRole = role?.toLowerCase();
  return (
    <>
      {/* {normalizedRole === 'doctor' ? <DoctorProfile /> : <PatientProfile /> } */}
      {isDoctor === "true" ? <DoctorProfile /> : <PatientProfile />}
      {/* {<PatientProfile />} */}
    </>
  );
}

export default page;
