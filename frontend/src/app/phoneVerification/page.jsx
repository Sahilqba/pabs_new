"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Cookies from "js-cookie";
function page() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");
  const [formValidated, setFormValidated] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [verificationSid, setVerificationSid] = useState("");
  const [otp, setOtp] = useState("");
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const jwtToken = localStorage.getItem("jwtToken");
  const sendOtp = async (e) => {
    // setLoading(true);
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity() || !contactNumber) {
      e.stopPropagation();
      setFormValidated(true);
      setContactNumberValid(!!contactNumber);
      toast.error("Please enter the values.");
      return;
    }
    setFormValidated(true);
    setContactNumberValid(true);
    setShowRoleModal(true);
    console.log("email", email);
    Cookies.set("emailfromPhoneVerification", email, { expires: 1, path: "/" });
    Cookies.set("rolefromPhoneVerification", role, { expires: 1, path: "/" });
  
    try {
      // First API call to get user ID from email
      const additionalResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getuserIdfromEmail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, role: role }),
        }
      );
  
      if (additionalResponse.ok) {
        setLoading(false);
        const additionalData = await additionalResponse.json();
        console.log("Additional API call successful:", additionalData);
        Cookies.set("userIdfromPhoneVerification", additionalData.user[0]._id, { expires: 1, path: "/" });
  
        // Check if role matches
        if (role === additionalData.user[0].role) {
          // Second API call to send OTP
          const formattedNumber = `+${contactNumber}`;
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sendOtp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ contactNumber: formattedNumber, email, role }),
            }
          );
  
          if (response.ok) {
            const data = await response.json();
            setVerificationSid(data.sid);
            toast.success("OTP sent to your contact number");
            setLoading(false);
          } else if (response.status === 400) {
            setShowRoleModal(false);
            toast.error("Incorrect Contact number, email, or role.");
            setLoading(false);
          } else {
            console.error("Failed to send OTP");
            setLoading(false);
          }
        } else {
          toast.error("Invalid credentials: role does not match");
          setLoading(false);
        }
      } else if (additionalResponse.status === 401) {
        setShowRoleModal(false);
        toast.error("Incorrect Contact number, email, or role.");
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
        setLoading(false);
        toast.success("OTP verified successfully");
        router.push("/updatePassword");
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
              <div className="mb-3">
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
              </div>
              <div className="mb-3">
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
              </div>
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
                    <p>Please enter the otp:</p>
                    <input
                      type="text"
                      className="form-control"
                      id="otp"
                      placeholder="OTP*"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <button
                      className="btn btn-primary mdl-btn m-2"
                      onClick={verifyOtp}
                    >
                      Submit OTP
                    </button>
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
