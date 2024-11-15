"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect } from "react";
function Footer() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  return (
    // <>
    //   <div className=" ftr-sec " 
    // //   style={{ textAlign: 'right' }}
    //   >
    //    <p>Copyright © 2024 QBA. All Rights Reserved.</p>
    //   </div>
    // </>
    <footer className="ftr-sec">
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
        <p>&copy; 2024. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
  );
}

export default Footer;
