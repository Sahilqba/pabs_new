"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
function page() {
  const params = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const fetchData = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchData/${userId}`
      );
      const data = await response.json();
      setUserData(data);
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
    router.push(`/userlogin/display/${params.userId}`);
  };
  return (
    <>
      <h1>Profile page</h1>
      {/* <div>
      {params.userId},{userData.name}, {userData.email}
      Here you can display the above information and form.
      </div> */}

      {params.userId && userData.name && userData.email ? (
        <div>
          {params.userId}, {userData.name}, {userData.email}
          {/* {userData.password} */}
          Here you can display the above information and form.
        </div>
      ) : (
        <div>Loading...</div>
      )}
      <button onClick={handleSubmit}>
        Click here to view your appointments
      </button>
    </>
  );
}

export default page;
