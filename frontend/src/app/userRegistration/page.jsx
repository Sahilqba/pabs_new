"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from 'next/navigation';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const user = { name, email, password };
    console.log("User:", user);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User created:", result);
        router.push(`/userProfile`);
      } else {
        console.error("Failed to create user:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
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
    {/* <Footer /> */}
    </>
  );
}

export default page;
