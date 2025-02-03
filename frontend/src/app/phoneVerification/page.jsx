"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Cookies from "js-cookie";
// import { cookies } from "next/headers";
function page() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");
  const [isDoctor, setIsDoctor] = React.useState(null);
  const [formValidated, setFormValidated] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [verificationSid, setVerificationSid] = useState("");
  const [otp, setOtp] = useState("");
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [formattedNumber, setFormattedNumber] = useState("");
  const jwtToken = localStorage.getItem("jwtToken");
  const sendOtp = async (e) => {
    // setLoading(true);
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity() ) {
      e.stopPropagation();
      setFormValidated(true);
      // setContactNumberValid(!!contactNumber);
      toast.error("Please enter the values.");
      return;
    }
    setFormValidated(true);
    // setContactNumberValid(true);
    // setShowRoleModal(true);
    console.log("email", email);
    Cookies.set("emailfromPhoneVerification", email, { expires: 1, path: "/" });
    // Cookies.set("rolefromPhoneVerification", role, { expires: 1, path: "/" });
    // Cookies.set("contactfromPhoneVerification", contactNumber, { expires: 1, path: "/" });
    
  
    try {
      // First API call to get user ID from email
      const additionalResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getuserIdfromEmail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email}),
        }
      );
  
      if (additionalResponse.ok) {
        setLoading(false);
        const additionalData = await additionalResponse.json();
        console.log("Additional API call successful:", additionalData);
        Cookies.set("userIdfromPhoneVerification", additionalData.user[0]._id, { expires: 1, path: "/" });
        Cookies.set("contactfromPhoneVerification", additionalData.user[0].contactNumber, { expires: 1, path: "/" });
        // Check if role matches
        console.log("check", additionalData.user[0].contactNumber);
        // setContactNumber(additionalData.user[0].contactNumber)
        let number= additionalData.user[0].contactNumber;
        // if (role === additionalData.user[0].role) {
          // Second API call to send OTP
          setFormattedNumber(number);
          console.log("number", number);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sendOtp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ contactNumber: number, email, role }),
            }
          );
  
          if (response.ok) {
            const data = await response.json();
            setVerificationSid(data.sid);
            toast.success("OTP sent to your contact number");
            setLoading(false);
            setShowRoleModal(true);
            setIsResendDisabled(true);
            setTimer(60);
          } else if (response.status === 400) {
            setShowRoleModal(false);
            toast.error("Incorrect email or role.");
            setLoading(false);
          } else {
            console.error("Failed to send OTP");
            setLoading(false);
          }
        // } 
      } else if (additionalResponse.status === 401) {
        setShowRoleModal(false);
        // toast.error("Incorrect email or role.");
        // const errorMessage = await additionalResponse.json();
        const errorMessage = await additionalResponse.text();
        console.log("errorMessage", errorMessage);
        toast.error(errorMessage || "Incorrect email or role.");
        setLoading(false);
      }
      else {
        console.error("Failed to make additional API call");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setLoading(false);
    }
  };

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
        const data = await response.json();
        console.log("OTP verified successfully:", data);
        setLoading(false);
        toast.success("OTP verified successfully");
        router.push("/updatePassword");
        Cookies.set("sidOTP", data.sid, { expires: 1, path: "/" });
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

  const maskNumber = (number) => {
    if (number.length < 6) return number;
    const firstFour = number.slice(0, 5);
    const lastTwo = number.slice(-2);
    const masked = `${firstFour}${"*".repeat(number.length - 6)}${lastTwo}`;
    return masked;
  };

  return (
    <>
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Phone verification</h2>
          {loading ? (
            <div className="spinner-border" role="status">
              <span className="sr-only"></span>
            </div>
          ) : (
            <form
              className={`needs-validation ${
                formValidated ? "was-validated" : ""
              }`}
              noValidate
              onSubmit={sendOtp}
            >
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="invalid-feedback">
                  Please provide a valid email address.
                </div>
              </div>
              {/* <div className="mb-3">
                <select
                  type="text"
                  className="form-control"
                  placeholder="Select Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select Role*</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                </select>
                <div className="invalid-feedback">
                  Please provide a valid role.
                </div>
              </div> */}
              {/* <div className="mb-3">
                <PhoneInput
                  country={"in"}
                  value={contactNumber}
                  onChange={(phone) => setContactNumber(phone)}
                  inputProps={{
                    name: "phone",
                    required: true,
                    autoFocus: true,
                    className: "form-control",
                    id: "phone",
                  }}
                />
                <div className="invalid-feedback">
                  Please provide a valid phone number.
                </div>
              </div> */}
              <div className="btn-grp">
                <button type="submit" className="btn btn-primary">
                  Send OTP
                </button>
              </div>
            </form>
          )}
          {/* Bootstrap Modal */}
          {showRoleModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
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
                    <p>Please enter the 6-digit code that has been sent to your registered phone number {maskNumber(formattedNumber)} :</p>
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
                      disabled={isResendDisabled}
                    >
                      Resend OTP
                    </button>
                    {isResendDisabled && (
                        <p className="text-muted mt-2">
                          Resend available in:{" "}
                          <strong>{formatTimer(timer)}</strong>
                        </p>
                      )}
                     </div> 
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Backdrop */}   
          {showRoleModal && <div className="modal-backdrop fade show"></div>}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default page;
