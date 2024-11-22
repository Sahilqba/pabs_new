"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formValidated, setFormValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity() || passwordError) {
      event.stopPropagation();
      setFormValidated(true);
      toast.error("Please fix the form before submitting.");
      return;
    }

    setFormValidated(true);
    setLoading(true);
    const user = { name, email, password };
    console.log("User:", user);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success("User created successfully. Please login to continue.");
        console.log("User created:", result);
        setTimeout(() => {
          router.push(`/userlogin`);
        }, 3000);
      } else {
        const errorResult = await response.json();
        console.log(errorResult.error);
        console.error("Failed to create user:", errorResult.error);
        toast.error(`Failed to create user: ${errorResult.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* <Header /> */}
      <div className="flex-container">
        <div className="flex-item reg-form">
          <h2>Sign Up</h2>
          <div>
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
                  {/* <label htmlFor="name" className="form-label">
                    Name
                  </label> */}
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Name*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid name.
                  </div>
                </div>

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
                  {/* <label htmlFor="password" className="form-label">
                    Password
                  </label> */}
                  <input
                    type="password"
                    className={`form-control ${passwordError ? "is-invalid" : password && !passwordError ? "is-valid" : ""}`}
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
                </div>
                <div className="btn-grp">
                <button
                  type="submit"
                  className="btn btn-primary"
                  // onClick={handleSubmit}
                >
                  Submit
                </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
      {/* <Footer /> */}
    </>
  );
}

export default page;
