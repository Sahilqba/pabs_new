"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
    finally {
      setLoading(false); // Reset loading state
    }

  };
  return (
    <>
      {/* <Header /> */}
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Login with Email</h2>
          <div>
            {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="5"
                    maxLength="10"
                    pattern="^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{5,10}$"
                  />
                </div>
                <div className="btn-grp">
                <button
                  type="submit"
                  className="btn btn-primary"
                  // onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
              // type="submit"
              className="btn btn-primary"
              onClick={() => router.push("/userRegistration")}
            >
              Register
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
