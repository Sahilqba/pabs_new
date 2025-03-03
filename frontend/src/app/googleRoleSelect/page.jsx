"use client";
import React from "react";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
function page() {
  const router = useRouter();
  const [googleEmail, setGoogleEmail] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [verificationSid, setVerificationSid] = useState("");
  const jwtToken = Cookies.get("jwtCookie");
  const [resendCount, setResendCount] = useState(0);
  const [formattedContactNumber, setFormattedContactNumber] = useState("");
  const [googleRoleEmail, setGoogleRoleEmail] = useState("");
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });
  useEffect(() => {
    const email = Cookies.get("googleEmail");
    console.log("Fetched googleEmail from cookies:", email);
    setGoogleEmail(email);
  }, []);

  const handleLogout = async () => {
    // setLoading(true);
    try {
      // setLoading(true);
      const response = await fetch("http://localhost:8080/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setLoading(false);
        toast.success("Logging you out...");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        localStorage.removeItem("isDoctor");
        sessionStorage.clear();
        Cookies.remove("jwtCookie", { path: "/" });
        Cookies.remove("emailFromGoogle", { path: "/" });
        Cookies.remove("nameFromGoogle", { path: "/" });
        Cookies.remove("userId", { path: "/" });
        Cookies.remove("userRoleGoogle", { path: "/" });
        Cookies.remove("passwordFromLoginPage", { path: "/" });
        Cookies.remove("emailFromLoginPage", { path: "/" });
        Cookies.remove("userIdinDb", { path: "/" });
        await router.push("/userlogin");
      } else {
        console.error("Logout failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };
  const handlePhoneChange = (number) => {
    setContactNumber(number);
    // const isValid = phone.length >= 10;
    setContactNumberValid(validatePhoneNumber(number));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addRolenIsdoctorinGmailAccount`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: googleEmail,
            role: "Patient",
            isDoctor: isDoctor,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("User updated successfully:", data);
        Cookies.set("isDoctor", isDoctor);
        Cookies.set("role", "Patient");
        // Redirect or show success message
        router.push(`/userProfile`);
      } else {
        handleLogout();
        console.error("Error updating user:", data.message);
        // Show error message
        toast.error("Incorrect path. Please login again and try.");
        router.push(`/userlogin`);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      // Show error message
    }
  };

const addContacttoGoogleAccount = async () => {
  try {
    const response = await fetch("http://localhost:8080/addContactNumbertoGoogleDb", {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleEmail: googleRoleEmail, contactNumber: formattedContactNumber}),
    });

    if (response.ok) {
      // setLoading(false);
      // toast.success("Phone Number verified successfully");
      // handleSubmit();
    } else {
      console.error("Failed to verify OTP");
      // toast.error("Failed to verify OTP");
      // setLoading(false);
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    setLoading(false);
  }
}

  const sendOtp = async (e) => {
    e.preventDefault();
    if (resendCount >= 3) {
      toast.error("OTP limit exceeded, try after some time");
      return;
    }
    try {
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkWhetherContactExistsGoogle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contactNumber: `+${contactNumber}` }),
        }
      );
      console.log("checkResponse status:", checkResponse.status);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log("checkData:", checkData);
        console.log("checkData.message:", checkData.message);
        if (checkData.message === "Contact number already exist") {
          toast.error(checkData.message);
          return;
        }
      } else {
        const errorData = await checkResponse.json();
        console.error("Error data:", errorData);
        toast.error(`Error: ${errorData.message}`);
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sendOtpGoogle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactNumber: `+${contactNumber}`,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("OTP sent successfully:", data);
        Cookies.set("contactNumber", data.formattedNumber);
        // Cookies.get("googleEmail");
        setFormattedContactNumber(data.formattedNumber); 
        setGoogleRoleEmail(Cookies.get("googleEmail"));
        setVerificationSid(data.sid);
        toast.success("OTP sent to your contact number");
        setLoading(false);
        setShowRoleModal(true);
        setIsResendDisabled(true);
        setTimer(5);
        setResendCount(resendCount + 1);
      } else if (response.status === 400) {
        setShowRoleModal(false);
        toast.error("Please provide valid Phone Number");
        setLoading(false);
      } else {
        console.error("Failed to send OTP");
        toast.error(
          "Failed to send OTP. Please refresh the page and try again."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setLoading(false);
    }
  };



////do not delete/////
  // const sendOtp = async (e) => {
  //   e.preventDefault();
  //   if (resendCount >= 3) {
  //     toast.error("OTP limit exceeded, try after some time");
  //     return;
  //   }
  //   try {
  //     const roleResponse = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/addRolenIsdoctornContactinGmailAccount`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email: googleEmail }),
  //       }
  //     );
  
  //     const roleData = await roleResponse.json();
  //     if (roleResponse.ok) {
  //       if (roleData.message === "User already has contact number set") {
  //         toast.error(roleData.message);
  //         // router.push('/userlogin');
  //         return;
  //       }
  //     } else {
  //       // if (roleData.message === "User with this email does not exist") {
  //         if (roleData.message === "User with this email does not exist" || roleData.message === "Email found with no contact and role") {
  //         // Proceed with the OTP sending process
  //         const checkResponse = await fetch(
  //           `${process.env.NEXT_PUBLIC_API_URL}/checkWhetherContactExistsGoogle`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({ contactNumber: `+${contactNumber}` }),
  //           }
  //         );
  //         console.log("checkResponse status:", checkResponse.status);
  //         if (checkResponse.ok) {
  //           const checkData = await checkResponse.json();
  //           console.log("checkData:", checkData);
  //           console.log("checkData.message:", checkData.message);
  //           if (checkData.message === "Contact number already exist") {
  //             toast.error(checkData.message);
  //             return;
  //           }
  //         } else {
  //           const errorData = await checkResponse.json();
  //           console.error("Error data:", errorData);
  //           toast.error(`Error: ${errorData.message}`);
  //           return;
  //         }
  //         const response = await fetch(
  //           `${process.env.NEXT_PUBLIC_API_URL}/sendOtpGoogle`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({
  //               contactNumber: `+${contactNumber}`,
  //             }),
  //           }
  //         );
  
  //         if (response.ok) {
  //           const data = await response.json();
  //           console.log("OTP sent successfully:", data);
  //           Cookies.set("contactNumber", data.formattedNumber);
  //           setFormattedContactNumber(data.formattedNumber);
  //           setGoogleRoleEmail(Cookies.get("googleEmail"));
  //           setVerificationSid(data.sid);
  //           toast.success("OTP sent to your contact number");
  //           setLoading(false);
  //           setShowRoleModal(true);
  //           setIsResendDisabled(true);
  //           setTimer(5);
  //           setResendCount(resendCount + 1);
  //         } else if (response.status === 400) {
  //           setShowRoleModal(false);
  //           toast.error("Please provide valid Phone Number");
  //           setLoading(false);
  //         } else {
  //           console.error("Failed to send OTP");
  //           toast.error(
  //             "Failed to send OTP. Please refresh the page and try again."
  //           );
  //           setLoading(false);
  //         }
  //       } else {
  //         toast.error(roleData.message);
  //         return;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error sending OTP:", error);
  //     setLoading(false);
  //   }
  // };
/////////



  const verifyOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/verifyOtp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sid: verificationSid, token: otp }),
      });

      if (response.ok) {
        setLoading(false);
        toast.success("Phone Number verified successfully");
        handleSubmit();
        addContacttoGoogleAccount();
      } else {
        console.error("Failed to verify OTP");
        toast.error("Failed to verify OTP");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setLoading(false);
    }
  };

  const maskNumber = (number) => {
    if (number.length < 6) return number;
    const firstFour = number.slice(0, 5);
    const lastTwo = number.slice(-2);
    const masked = `${firstFour}${"*".repeat(number.length - 6)}${lastTwo}`;
    return masked;
  };
  useEffect(() => {
    if (isResendDisabled && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
    if (timer === 0) {
      setIsResendDisabled(false);
    }
  }, [timer, isResendDisabled]);
  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Google Role Select</h2>
          <div className="mb-3">
            <PhoneInput
              country={"in"}
              value={contactNumber}
              onChange={handlePhoneChange}
              inputProps={{
                name: "phone",
                required: true,
                autoFocus: true,
                className: `form-control ${
                  !contactNumberValid ? "is-invalid" : ""
                }`,
                id: "phone",
              }}
            />
            {!contactNumberValid && (
              <div className="invalid-feedback">
                Please provide a valid phone number.
              </div>
            )}
          </div>
          <div className="form-check doc-chk-mdl">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isDoctor}
              id="flexCheckDefault"
              onChange={(e) => setIsDoctor(e.target.checked)}
            />
            <label className="form-check-label">Are you a Doctor?</label>
          </div>
          <div className="modal-body">
            {/* <p>Are you a doctor:</p> */}
            <div className="btn-grp">
              <button className="btn btn-primary" onClick={sendOtp}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      {showRoleModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">OTP verification</h5>
                <button
                  type="button"
                  className="custom-close-btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setShowRoleModal(false);
                    setLoading(false);
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Please enter the 6-digit code that has been sent to your
                  registered number +{maskNumber(contactNumber)} :
                </p>
                <input
                  type="text"
                  className="form-control"
                  id="otp"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <div className="otp-btn">
                  <button
                    className="btn btn-primary mdl-btn m-2 sbmt-otp"
                    onClick={verifyOtp}
                  >
                    Submit OTP
                  </button>
                  <button
                    className="btn btn-secondary rsnd-otp mdl-btn m-2"
                    onClick={sendOtp}
                    disabled={isResendDisabled || resendCount >= 3}
                  >
                    Resend OTP
                  </button>
                  {isResendDisabled && (
                    <p className="text-muted mt-2">
                      Resend available in: <strong>{formatTimer(timer)}</strong>
                    </p>
                  )}
                  {resendCount >= 3 && (
                    <p className="text-danger mt-2">
                      OTP limit exceeded, try after some time
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && <div className="modal-backdrop fade show"></div>}
      <ToastContainer />
    </>
  );
}

export default page;
