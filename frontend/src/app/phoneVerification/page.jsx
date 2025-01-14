"use client";
import React from "react";
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
  const jwtToken = localStorage.getItem("jwtToken");
  const sendOtp = async (e) => {
    e.preventDefault();
    setShowRoleModal(true);
    console.log("email", email);
    Cookies.set("emailfromPhoneVerification", email, { expires: 1, path: "/" });
    Cookies.set("rolefromPhoneVerification", role, { expires: 1, path: "/" });
    try {
      const formattedNumber = `+${contactNumber}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sendOtp`,
        {
          method: "POST",
          headers: {
            // Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contactNumber: formattedNumber }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVerificationSid(data.sid);
        toast.success("OTP sent to your contact number");
        // Additional API call
        const additionalResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/getuserIdfromEmail`,
          {
            method: "POST",
            headers: {
              // Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, role: role }),
          }
        );
        if (additionalResponse.ok) {
          const additionalData = await additionalResponse.json();
          console.log("Additional API call successful:", additionalData);
          Cookies.set(
            "userIdfromPhoneVerification",
            additionalData.user[0]._id,
            { expires: 1, path: "/" }
          );
        } else {
          console.error("Failed to make additional API call");
        }
      } else {
        console.error("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const verifyOtp = async () => {
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
        toast.success("OTP verified successfully");
        router.push("/updatePassword");
      } else {
        console.error("Failed to verify OTP");
        toast.error("Time limit execeeded. Please try again");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
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
              </div>
              <div className="mb-3">
                <PhoneInput
                  country={"in"} // Set default country
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
                    <h5 className="modal-title">Select Your Role</h5>
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
                      className="btn btn-secondary mdl-btn m-2"
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
