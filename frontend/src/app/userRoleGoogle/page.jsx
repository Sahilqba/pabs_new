"use client";
import { React, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
function page() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    Cookies.set("userRoleGoogle", role, { expires: 1, path: "/" });
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };
  return (
    <div>
      <h1>user role google page</h1>
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
    </div>
  );
}

export default page;
