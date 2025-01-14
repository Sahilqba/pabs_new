"use client";
import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
function page() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formValidated, setFormValidated] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const [verificationSid, setVerificationSid] = useState("");
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const error = validatePassword(value);
    setPasswordError(error);
  };

  const passwordUpdate = async (e) => {
    e.preventDefault();
    // setShowRoleModal(true);
    const userIdfromPhoneVerification = Cookies.get(
      "userIdfromPhoneVerification"
    );
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/updatePassword/${userIdfromPhoneVerification}`,
        {
          method: "PATCH",
          headers: {
            // Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVerificationSid(data.sid);
        toast.success("Password update successfully");
        router.push("/userlogin");
      } else {
        console.error("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  return (
    <>
      <div className="flex-container">
        <div className="flex-item-login login-form">
          <h2>Password update</h2>
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
              onSubmit={passwordUpdate}
            >
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control ${
                    passwordError
                      ? "is-invalid"
                      : password && !passwordError
                      ? "is-valid"
                      : ""
                  }`}
                  id="Password"
                  placeholder="Password*"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                {/* {passwordError ? (
                  <div className="invalid-feedback">{passwordError}</div>
                ) : password ? (
                  <div className="valid-feedback">Password looks good!</div>
                ) : null} */}
              </div>
              <div className="btn-grp">
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          )}
          {/* Bootstrap Modal */}
          {/* {showRoleModal && (
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
                    //   onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <button
                      className="btn btn-secondary mdl-btn m-2"
                    //   onClick={verifyOtp}
                    >
                      Submit OTP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Modal Backdrop */}
          {showRoleModal && <div className="modal-backdrop fade show"></div>}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default page;
