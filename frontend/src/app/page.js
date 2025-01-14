"use client";
import Image from "next/image";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect } from "react";
import landng_img from "../../public/user_side_images/landingPg.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Home() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  return (
    <>
      <main className="hero-section">
        <div className="row align-items-center">
          <div className="col-md-7">
          <div className="hero-image">
          {/* Placeholder for the SVG/illustration */}
          {/* <img src={landng_img} alt="Blood Donation Illustration" /> */}
          <Image src={landng_img} alt="Blood Donation Illustration" />
        </div>
          </div>
          <div className="col-md-5">
          <div className="hero-content">
          <h1 className="hero-title">PABS</h1>
          <p className="hero-subtext">
            Welcome to our Hospital Appointment Booking App! We are committed to
            providing you with the best healthcare experience. Easily book your
            appointments with our trusted medical professionals and manage your
            health with convenience and confidence. Your well-being is our
            priority.
          </p>
          <div className="hero-buttons d-flex align-items-center justify-content-start g-2">
            {/* <Link to="/signin" className="btn watch-video"> */}
            <Link className="btn btn-primary"
              href="/userRegistration"
            >
              SignUp
            </Link>
            {/* </Link> */}
            {/* <Link to="/login" className="btn learn-more"> */}
            <Link className="btn btn-secondary"
              href="/userlogin"
            >
              LogIn
            </Link>

            {/* </Link> */}
          </div>
        </div>
          </div>
        </div>
       
       
      </main>
    </>
  );
}

