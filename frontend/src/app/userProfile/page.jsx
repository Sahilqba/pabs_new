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
    setRole(storedRole || userRoleGoogle);
    setIsDoctor(storedisDoctor);
    setUserName(storedUserName || nameFromGoogle);
  }, []);

  if (!userName || !isDoctor) {
    return <div>Loading...</div>;
  }
  const normalizedRole = role?.toLowerCase();
  return (
    <>
      {/* {normalizedRole === 'doctor' ? <DoctorProfile /> : <PatientProfile /> } */}
      {isDoctor === "true" ? <DoctorProfile /> : <PatientProfile />}
      {<PatientProfile />}
    </>
  );
}

export default page;
