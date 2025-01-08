"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Cookies from "js-cookie";
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formValidated, setFormValidated] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleSignUpClick = (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    router.push("/userRegistration").finally(() => setIsLoading(false)); // Hide loader after navigation
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGoogleLogin) return;
    const form = e.currentTarget;
    if (!form.checkValidity() || passwordError) {
      e.stopPropagation();
      setFormValidated(true);
      toast.error("Please enter the values.");
      return;
    }
    setFormValidated(true);
    setLoading(true);

    Cookies.set("emailFromLoginPage", email, { expires: 1, path: "/" });
    Cookies.set("passwordFromLoginPage", password, { expires: 1, path: "/" });
    // router.push("/userRoleVanilla");
    setShowRoleModal(true);
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // router.push("/userRoleGoogle");
    setIsGoogleLogin(true);
    setShowRoleModal(true);
    // window.location.href = "http://localhost:8080/auth/google";
  };

  const handleRoleSelection = async (role) => {
    setUserRole(role);
    setShowRoleModal(false);
    // You can now use the selectedRole state to capture the input
    // console.log("Selected Role:", role);

    if (isGoogleLogin) {
      Cookies.set("role", role, { expires: 1, path: "/" });
      Cookies.set("userRoleGoogle", role, { expires: 1, path: "/" });
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }

    Cookies.set("emailFromLoginPage", email, { expires: 1, path: "/" });
    Cookies.set("passwordFromLoginPage", password, { expires: 1, path: "/" });
    Cookies.set("role", role, { expires: 1, path: "/" });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/userLogin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            role: role,
          }),
        }
      );
      let errorMessage;
      if (response.ok) {
        const data = await response.json();
        console.log("Login successful");
        // console.log("Data:", data);
        toast.success("Login successful !");
        localStorage.setItem("jwtToken", data.token);
        // localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("role", data.user.role);
        // localStorage.setItem("department", data.user.department);
        Cookies.set("jwtCookie", data.token, { expires: 1, path: "/" });
        Cookies.set("userIdinDb", data.user._id, { expires: 1, path: "/" });
        Cookies.set("userId", data.user._id, { expires: 1, path: "/" });
        setTimeout(() => {
          router.push(`/userProfile`);
        }, 2000);
      }
      else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          errorMessage = data.message || "Failed to login";
        } else {
          errorMessage = await response.text();
        }
        console.error("Login failed:", errorMessage);
        toast.error(errorMessage);
        Cookies.remove("emailFromLoginPage", { path: "/" });
        Cookies.remove("role", { path: "/" });
        Cookies.remove("passwordFromLoginPage", { path: "/" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(error.message);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Login with Email</h2>
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
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                {/* <label htmlFor="email" className="form-label">
                    Email
                  </label> */}
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="invalid-feedback">
                  Please provide a valid email address.
                </div>
              </div>

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
                {passwordError ? (
                  <div className="invalid-feedback">{passwordError}</div>
                ) : password ? (
                  <div className="valid-feedback">Password looks good!</div>
                ) : null}
              </div>
              <div className="btn-grp">
                <button
                  type="submit"
                  className="btn btn-primary"
                  // onClick={handleSubmit}
                >
                  Submit
                </button>
                <div className="register-link">
                  Don't have an account?{" "}
                  {loading ? (
                    <span className="loader">Loading...</span> 
                  ) : (
                    <Link
                      href="/userRegistration"
                      className="sign-up-link"
                      onClick={handleSignUpClick}
                    >
                      Sign Up
                    </Link>
                  )}
                </div>
              </div>
              <div className="separator">
                <span>OR</span>
              </div>
              <div className="alternate-signin">
                <button
                  onClick={handleGoogleLogin}
                  className="btn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    ></path>
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    ></path>
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                  </svg>
                  <span>Login using Google</span>
                </button>
              </div>
            </form>
          )}
          {/* Bootstrap Modal */}
          {showRoleModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select Your Role</h5>
                    <button
                      type="button"
                      className="custom-close-btn"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => {
                        setShowRoleModal(false);
                        setLoading(false);
                      }}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>Please select your role to continue:</p>
                    <button
                      className="btn btn-primary mdl-btn m-2"
                      onClick={() => handleRoleSelection("Doctor")}
                    >
                      Doctor
                    </button>
                    <button
                      className="btn btn-secondary mdl-btn m-2"
                      onClick={() => handleRoleSelection("Patient")}
                    >
                      Patient
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Backdrop */}
          {showRoleModal && <div className="modal-backdrop fade show"></div>}
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default page;
