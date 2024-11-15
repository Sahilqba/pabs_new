"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
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
    try {
      const response = await fetch("http://localhost:8080/userLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Login successful");
        console.log("Data:", data);
        router.push(`/userlogin/profile/${data._id}`);
      } else {
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  return (
    <>
        <Header />
      <div className="flex-container">
        <div className="flex-item-login">
          <h1>User login</h1>
          <div>
            {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
              >
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
      <Footer />
    </>
  );
}

export default page;
