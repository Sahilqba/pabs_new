"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (value) => {
    const pattern = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{5,10}$/;
    if (value.length < 5 || value.length > 10) {
      setPasswordError("Password must be 5-10 characters long.");
    } else if (!pattern.test(value)) {
      setPasswordError("Password must include letters and numbers.");
    } else {
      setPasswordError(""); // No error
    }
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (passwordError) {
      toast.error("Please fix the password errors before submitting.");
      return;
    }
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
        }, 3000)
      } else {
        const errorResult = await response.json();
        console.log(errorResult.error)
        console.error(
          "Failed to create user:",
          errorResult.error
        );
        toast.error(
          `Failed to create user: ${errorResult.error}`
        );
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
        <div className="flex-item">
          <h1>User reg</h1>
          <div>
            {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <input
                    type="name"
                    className="form-control mb-3"
                    id="exampleInputName"
                    aria-describedby="nameHelp"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    className="form-control mb-3"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className={`form-control ${passwordError ? "is-invalid" : ""}`}
                    id="exampleInputPassword1"
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    // minLength="5"
                    // maxLength="10"
                    // pattern="^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{5,10}$"
                  />
                   {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  // onClick={handleSubmit}
                >
                  Submit
                </button>
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
