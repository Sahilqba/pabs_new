'use client'
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  return (
    <>
    <Header />
      <div className="flex-container">
        <div className="flex-item">
          {/* <h1>User r</h1> */}
          <h1>You have successfully booked your appointment. Click below in order to do a new registration.</h1>
          {/* <button btn btn-link onClick = {()=>{router.push('/user')}}>Click</button> */}
          <button type="submit" className="btn btn-primary w-100 mt-3" onClick = {()=>{router.push('/user')}}>Click here to book a new appointment</button>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default page;
