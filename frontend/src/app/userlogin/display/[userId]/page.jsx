'use client'
import React from "react";
import { useParams } from "next/navigation";

function page() {
  const params = useParams();
  return (
    <>
      <h1>display page</h1>
      {params.userId}
    </>
  );
}

export default page;
