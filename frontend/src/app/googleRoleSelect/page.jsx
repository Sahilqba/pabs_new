"use client";
import React from "react";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function page() {
  const router = useRouter();
  const [googleEmail, setGoogleEmail] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  useEffect(() => {
    const email = Cookies.get("googleEmail");
    console.log("Fetched googleEmail from cookies:", email);
    setGoogleEmail(email);
  }, []);

  const handleLogout = async () => {
    // setLoading(true);
    try {
      // setLoading(true);
      const response = await fetch("http://localhost:8080/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setLoading(false);
        toast.success("Logging you out...");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        localStorage.removeItem("isDoctor");
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

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addRolenIsdoctorinGmailAccount`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: googleEmail,
            role: "Patient",
            isDoctor: isDoctor,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("User updated successfully:", data);
        Cookies.set("isDoctor", isDoctor);
        Cookies.set("role", "Patient");
        // Redirect or show success message
        router.push(`/userProfile`);
      } else {
        handleLogout();
        // Cookies.remove("jwtCookie", { path: "/" });
        // Cookies.remove("emailFromGoogle", { path: "/" });
        // Cookies.remove("nameFromGoogle", { path: "/" });
        // Cookies.remove("userId", { path: "/" });
        // Cookies.remove("userRoleGoogle", { path: "/" });
        // Cookies.remove("passwordFromLoginPage", { path: "/" });
        // Cookies.remove("emailFromLoginPage", { path: "/" });
        // Cookies.remove("userIdinDb", { path: "/" });
        // Cookies.remove("googleEmail", { path: "/" });
        // Cookies.remove("isDoctor", { path: "/" });
        // Cookies.remove("role", { path: "/" });
        // Cookies.remove("connect.sid", { path: "/" });
        console.error("Error updating user:", data.message);
        // Show error message
        toast.error("Incorrect path. Please login again and try.");
        router.push(`/userlogin`);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      // Show error message
    }
  };

  return (
    <>
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Google Role Select</h2>
          <div className="form-check doc-chk-mdl">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isDoctor}
              id="flexCheckDefault"
              onChange={(e) => setIsDoctor(e.target.checked)}
            />
            <label className="form-check-label">Are you a Doctor?</label>
          </div>
          <div className="modal-body">
            {/* <p>Are you a doctor:</p> */}
            <div className="btn-grp">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default page;
