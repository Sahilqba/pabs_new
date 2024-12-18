"use client";
import { React, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function page() {
  const router = useRouter();
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = Cookies.get("emailFromLoginPage");
    const password = Cookies.get("passwordFromLoginPage");
    // setLoading(true);
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
      const data = await response.json();
      if (response.ok) {
        console.log("Login successful");
        // console.log("Data:", data);
        toast.success("Login successful !");
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("role", data.user.role);
        Cookies.set("jwtCookie", data.token, { expires: 1, path: "/" });
        setTimeout(() => {
          router.push(`/userProfile`);
        }, 2000);
      } 
      else {
        // const errorResult = await response.json();
        // console.log(errorResult.error);
        const errorMessage = data?.error || "Invalid credentials";
        console.error("Login failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Incorrect Role.");
    } finally {
    //   setLoading(false); // Reset loading state
    }
  };
  return (
    <>
      <h1>user role page</h1>
      {/* <input
        type="text"
        placeholder="select role"
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
        }}
      /> */}
      <select
        type="text"
        placeholder="select role"
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
        }}
        required
      >
        <option value="">Select Role</option>
        <option value="Admin">Admin</option>
        <option value="Doctor">Doctor</option>
        <option value="Patient">Patient</option>
      </select>
      <button onClick={handleSubmit}>Click</button>
      <ToastContainer/>
    </>
  );
}

export default page;
