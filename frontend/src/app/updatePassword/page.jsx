"use client";
import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
function page() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formValidated, setFormValidated] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const [verificationSid, setVerificationSid] = useState("");
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const error = validatePassword(value);
    setPasswordError(error);
  };

  const passwordUpdate = async (e) => {
    e.preventDefault();
    // setShowRoleModal(true);
    const userIdfromPhoneVerification = Cookies.get(
      "userIdfromPhoneVerification"
    );
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updatePassword/${userIdfromPhoneVerification}`,
        {
          method: "PATCH",
          headers: {
            // Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: password }),
        }
      );

      if (response.ok) {
        toast.success("Password updated successfully");
        setLoading(false);
        const data = await response.json();
        setVerificationSid(data.sid);
        router.push("/userlogin");
        Cookies.remove("userIdfromPhoneVerification", { path: "/" });
        Cookies.remove("emailfromPhoneVerification", { path: "/" });
        Cookies.remove("rolefromPhoneVerification", { path: "/" });
      } else if (response.status === 400) {
        toast.error("Password is required");
        setLoading(false);
      } 
      else {
        console.error("Failed to send OTP");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Password update</h2>
          {loading ? (
            <div className="spinner-border" role="status">
              <span className="sr-only"></span>
            </div>
          ) : (
            <form
              className={`needs-validation ${
                formValidated ? "was-validated" : ""
              }`}
              noValidate
              onSubmit={passwordUpdate}
            >
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control ${
                    passwordError
                      ? "is-invalid"
                      : password && !passwordError
                      ? "is-valid"
                      : ""
                  }`}
                  id="Password"
                  placeholder="Password*"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="btn-grp">
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          )}
          {showRoleModal && <div className="modal-backdrop fade show"></div>}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default page;
