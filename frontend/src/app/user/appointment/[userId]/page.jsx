"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  const [disease, setDisease] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [bloodGroup, setBloodGroup] = useState("Select blood group");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const params = useParams();
  const fetchData = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchData/${userId}`
      );
      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (params) {
      fetchData(params.userId);
    }
  }, [params]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const user = {
      disease,
      contact,
      bloodGroup,
      date,
      nameUser: userData.name,
      nameEmail: userData.email,
    };
    console.log("User:", user);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/createAppointment`,
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
        console.log("Appointment created:", result);
        router.push(`/user/appointment/success`);
        // alert("Appointment created successfully");
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
    <Header />
      <div className="flex-container-appointment">
        <div className="flex-item-appointment">
          <div>
            {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h4>
                  Hello {userData.name}. Please fill the below details to book
                  your appointment.
                </h4>
                <div>
                  <input
                    type="disease"
                    className="form-control mb-3"
                    id="exampleInputDisease"
                    aria-describedby="diseaseHelp"
                    placeholder="Enter disease"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="contact"
                    className="form-control mb-3"
                    id="exampleInputContact"
                    aria-describedby="contactHelp"
                    placeholder="Enter contact no."
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    pattern="[0-9]*"
                    required
                  />
                </div>
                <select
                  className="form-control"
                  id="bloodGroup"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="O positive">O positive</option>
                  <option value="A positive">A positive</option>
                  <option value="B positive">B positive</option>
                  <option value="AB positive">AB positive</option>
                  <option value="O negative">O negative</option>
                  <option value="A negative">A negative</option>
                  <option value="B negative">B negative</option>
                  <option value="AB negative">AB negative</option>
                </select>
                <div className="date-class">
                  <input
                    type="date"
                    className="form-control mb-3"
                    id="exampleInputDate"
                    aria-describedby="dateHelp"
                    placeholder="Select appointment date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <input
                  type="hidden"
                  name="userNameHidden"
                  value={userData.name}
                />
                <input
                  type="hidden"
                  name="userEmailHidden"
                  value={userData.email}
                />
                <div className="button-class">
                  <button type="submit" className="btn btn-primary w-100">
                    Submit
                  </button>
                </div>
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
