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
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (value) => {
    const pattern = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{5,10}$/;
    if (!value) {
      return "Password is required.";
    }
    if (value.length < 5 || value.length > 10) {
      return "Password must be 5-10 characters long.";
    }
    if (!pattern.test(value)) {
      return "Password must include at least one letter and one number.";
    }
    return ""; // No error
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const error = validatePassword(value);
    setPasswordError(error);
  };
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password ? "Passwords do not match" : "");
  };
  const handleMouseDown = () => {
    setShowPassword(true);
    setShowConfirmPassword(true);
  };
  const handleMouseUp = () => {
    setShowPassword(false);
    setShowConfirmPassword(true);
  };

  // const handlePasswordChange = (e) => {
  //   const value = e.target.value;
  //   setPassword(value);

  //   const error = validatePassword(value);
  //   setPasswordError(error);
  // };

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
          body: JSON.stringify({ password: password, confirmPassword: confirmPassword }),
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
        Cookies.remove("verificationMessage", { path: "/" });
        Cookies.remove("contactfromPhoneVerification", { path: "/" });
        Cookies.remove("sidOTP", { path: "/" });
      } else if (response.status === 400) {
        toast.error("Password do not match");
        setLoading(false);
      } else {
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
              {/* <div className="mb-3">
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
              </div> */}
              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    passwordError
                      ? "is-invalid"
                      : password && !passwordError
                      ? "is-valid"
                      : ""
                  }`}
                  id="password"
                  placeholder="Password*"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordError ? (
                  <div className="invalid-feedback">{passwordError}</div>
                ) : password ? (
                  <div className="valid-feedback">Password looks good!</div>
                ) : null}
                <span
                  className="shw-pswrd"
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <i className="bi bi-eye"></i>
                </span>
              </div>
              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    confirmPasswordError
                      ? "is-invalid"
                      : confirmPassword && !confirmPasswordError
                      ? "is-valid"
                      : ""
                  }`}
                  id="confirmPassword"
                  placeholder="Confirm Password*"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                {confirmPasswordError ? (
                  <div className="invalid-feedback">{confirmPasswordError}</div>
                ) : confirmPassword ? (
                  <div className="valid-feedback">Passwords match!</div>
                ) : null}
                <span
                  className="shw-pswrd"
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <i className="bi bi-eye"></i>
                </span>
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
