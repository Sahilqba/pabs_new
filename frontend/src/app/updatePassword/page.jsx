"use client";
import React, { useEffect } from "react";
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
  const [lastPassword, setLastPassword] = useState(""); // Add state to store the last password
   const userIdfetched = Cookies.get("userIdfromPhoneVerification");

  const fetchLastPassword = async (userIdfetched) => {
    if (!userIdfetched) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getLastPassword/${userIdfetched}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
              if (response.ok) {
          const data = await response.json();
          setLastPassword(data.lastPassword);
          console.log("Fetched Last Password:", data.lastPassword);
        } else {
          toast.error("Failed to fetch last password.");
        }
    } catch (error) {
      console.error("Error fetching last password:", error);
    } finally {
      setLoading(false);
    }
  };

     useEffect(() => {
     const userIdfetched = Cookies.get("userIdfromPhoneVerification");
     console.log("userIdfetched from cookies:", userIdfetched);
     if (userIdfetched) {
      fetchLastPassword(userIdfetched);
     }
    // fetchLastPassword();
   }, [userIdfetched]);
 
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
    return "";
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
  const handleMouseDown = (field) => {
    if (field === "password") {
      setShowPassword(true);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(true);
    }
  };

  const handleMouseUp = (field) => {
    if (field === "password") {
      setShowPassword(false);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(false);
    }
  };

  const passwordUpdate = async (e) => {
    e.preventDefault();
    setFormValidated(true);

    console.log("Password :" , password);
    console.log("lastPassword :", lastPassword);
    if (password === lastPassword) {
      toast.error("New password cannot be the same as the last password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const userIdfromPhoneVerification = Cookies.get("userIdfromPhoneVerification");
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updatePassword/${userIdfromPhoneVerification}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password, confirmPassword }),
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

        // ["userIdfromPhoneVerification", "emailfromPhoneVerification", "rolefromPhoneVerification", "verificationMessage", "contactfromPhoneVerification", "sidOTP"].forEach(cookie => Cookies.remove(cookie, { path: "/" }));
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message === "Passwords do not match") {
          toast.error("Passwords do not match");
        } else if (errorData.message === "New password cannot be the same as the old password") {
          toast.error("New password cannot be the same as the last password.");
        } else if (errorData.error === "Password fields are required") {
          toast.error("Password fields are required");
        }else {
          toast.error("Failed to update password. Please try again.");
        }
        setLoading(false);
      } else {
        toast.error("Failed to update password. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    } finally {
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
                    onMouseDown={() => handleMouseDown("password")}
                    onMouseUp={() => handleMouseUp("password")}
                    onMouseLeave={() => handleMouseUp("password")}
                  >
                    <i className="bi bi-eye"></i>
                  </span>
                </div>
                <div className="mb-3 position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
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
                    <div className="invalid-feedback">
                      {confirmPasswordError}
                    </div>
                  ) : confirmPassword ? (
                    <div className="valid-feedback">Passwords match!</div>
                  ) : null}
                  <span
                    className="shw-pswrd"
                    onMouseDown={() => handleMouseDown("confirmPassword")}
                    onMouseUp={() => handleMouseUp("confirmPassword")}
                    onMouseLeave={() => handleMouseUp("confirmPassword")}
                  >
                    <i className="bi bi-eye"></i>
                  </span>
                </div>
              <div className="btn-grp">
                <button type="submit" className="btn btn-primary" disabled={loading || !lastPassword}>
                  Update
                </button>
              </div>
            </form>
          )}
          {/* {showRoleModal && <div className="modal-backdrop fade show"></div>} */}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default page;
