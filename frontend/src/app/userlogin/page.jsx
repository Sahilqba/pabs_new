"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formValidated, setFormValidated] = useState(false);
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

    const form = e.currentTarget;
    if (!form.checkValidity() || passwordError) {
      e.stopPropagation();
      setFormValidated(true);
      toast.error("Please enter the values.");
      return;
    }
    setFormValidated(true);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/userLogin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Login successful");
        // console.log("Data:", data);
        toast.success("Login successful !");
        localStorage.setItem("jwtToken", data.token);
        setTimeout(() => {
          router.push(`/userProfile`);
        }, 2000);
      } else {
        // const errorResult = await response.json();
        // console.log(errorResult.error);
        const errorMessage = data?.error || "Invalid credentials";
        console.error("Login failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Incorrect email or password.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  return (
    <>
      {/* <Header /> */}
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Login with Email</h2>
          {/* <div> */}
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
                    className={`form-control ${passwordError ? "is-invalid" : password && !passwordError ? "is-valid" : ""}`}
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
                    className="btn btn-outline-primary"
                    // onClick={handleSubmit}
                  >
                    Submit
                  </button>
                  {/* <div className="register-link">
                    Don't have an account?{" "}
                    <a
                      href="/userRegistration"
                      className="sign-up-link"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/userRegistration");
                      }}
                    >
                      Sign Up
                    </a>
                  </div> */}
                   <div className="register-link">
      Don't have an account?{" "}
      {loading ? (
        <span className="loader">Loading...</span> // Replace with your loader component
      ) : (
        <a href="/userRegistration" className="sign-up-link" onClick={handleSignUpClick}>
          Sign Up
        </a>
      )}
    </div>
                </div>
              </form>
            )}
          </div>
        </div>
      {/* </div> */}
      <ToastContainer />
      {/* <Footer /> */}
    </>
  );
}

export default page;
