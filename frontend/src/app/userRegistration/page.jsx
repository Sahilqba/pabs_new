"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Cookies from "js-cookie";
import Link from "next/link";
function page() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [contactNumber, setContactNumber] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [verificationSid, setVerificationSid] = useState("");
  const [otp, setOtp] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [formattedNumber, setFormattedNumber] = useState("");
  const jwtToken = localStorage.getItem("jwtToken");
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const validatePassword = (value) => {
    const pattern = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{5,10}$/;
    if (!value) {
      return "Password is required.";
    }
    if (value.length < 5 || value.length > 10) {
      return "Password must be 5-10 characters long.";
    }
    if (!pattern.test(value)) {
      return "Password must include at least one letter and one number.";
    }
    return ""; // No error
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const error = validatePassword(value);
    setPasswordError(error);
  };
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password ? "Passwords do not match" : "");
  };
  const handleMouseDown = (field) => {
    if (field === "password") {
      setShowPassword(true);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(true);
    }
  };

  const handleMouseUp = (field) => {
    if (field === "password") {
      setShowPassword(false);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(false);
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

  const sendOtp = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setFormValidated(true);
      toast.error("Please enter the values.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      toast.error("Passwords do not match.");
      return;
    }
    setFormValidated(true);

    try {
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkEmailnContact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, contactNumber: `+${contactNumber}` }),
        }
      );
      console.log("checkResponse status:", checkResponse.status);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log("checkData:", checkData);
        console.log("checkData.message:", checkData.message);
        if (checkData.message === "Email and contact number already exist") {
          toast.error(checkData.message);
          return;
        } else if (checkData.message === "Email already exists") {
          toast.error(checkData.message);
          return;
        } else if (checkData.message === "Contact number already exists") {
          console.error("hihihihihihi", checkData.message);
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
        `${process.env.NEXT_PUBLIC_API_URL}/sendOtp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactNumber: `+${contactNumber}`,
            email,
            role,
          }),
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
        createUser();
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

  const createUser = async () => {
    const user = {
      name,
      email,
      password,
      role: "Patient",
      contactNumber: `+${contactNumber}`,
      confirmPassword,
      isDoctor,
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success("User created successfully. Please login to continue.");
        setTimeout(() => {
          router.push(`/userlogin`);
        }, 3000);
      } else {
        const errorResult = await response.json();
        toast.error(`Failed to create user: ${errorResult.message}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
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
  const handleLoginClick = (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    router.push("/userlogin").finally(() => setIsLoading(false)); // Hide loader after navigation
  };

  return (
    <>
      {/* <Header /> */}
      <div className="flex-container">
        <div className="flex-item reg-form">
          <h2>Sign Up</h2>
          <div>
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
                  {/* <label htmlFor="name" className="form-label">
                    Name
                  </label> */}
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Name*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid name.
                  </div>
                </div>

                <div className="mb-3">
                  {/* <label htmlFor="email" className="form-label">
                    Email
                  </label> */}
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
                <div className="mb-3 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${
                      passwordError
                        ? "is-invalid"
                        : password && !passwordError
                        ? "is-valid"
                        : ""
                    }`}
                    id="password"
                    placeholder="Password*"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordError ? (
                    <div className="invalid-feedback">{passwordError}</div>
                  ) : password ? (
                    <div className="valid-feedback">Password looks good!</div>
                  ) : null}
                  <span
                    className="shw-pswrd"
                    onMouseDown={() => handleMouseDown("password")}
                    onMouseUp={() => handleMouseUp("password")}
                    onMouseLeave={() => handleMouseUp("password")}
                  >
                    <i className="bi bi-eye"></i>
                  </span>
                </div>
                <div className="mb-3 position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-control ${
                      confirmPasswordError
                        ? "is-invalid"
                        : confirmPassword && !confirmPasswordError
                        ? "is-valid"
                        : ""
                    }`}
                    id="confirmPassword"
                    placeholder="Confirm Password*"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                  />
                  {confirmPasswordError ? (
                    <div className="invalid-feedback">
                      {confirmPasswordError}
                    </div>
                  ) : confirmPassword ? (
                    <div className="valid-feedback">Passwords match!</div>
                  ) : null}
                  <span
                    className="shw-pswrd"
                    onMouseDown={() => handleMouseDown("confirmPassword")}
                    onMouseUp={() => handleMouseUp("confirmPassword")}
                    onMouseLeave={() => handleMouseUp("confirmPassword")}
                  >
                    <i className="bi bi-eye"></i>
                  </span>
                </div>
                <div class="form-check doc-chk">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value={isDoctor}
                    id="flexCheckDefault"
                    onChange={(e) => setIsDoctor(e.target.checked)}
                  />
                  <label class="form-check-label" for="flexCheckDefault">
                    Are you a Doctor?
                  </label>
                </div>

                <div className="btn-grp">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    // onClick={handleSubmit}
                  >
                    Submit
                  </button>
                  <div className="register-link">
                    Already have an account?{" "}
                    {loading ? (
                      <span className="loader">Loading...</span>
                    ) : (
                      <Link
                        href="/userlogin"
                        className="sign-up-link"
                        onClick={handleLoginClick}
                      >
                        Log In
                      </Link>
                    )}
                  </div>
                </div>
              </form>
            )}
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
                    disabled={isResendDisabled}
                  >
                    Resend OTP
                  </button>
                  {isResendDisabled && (
                    <p className="text-muted mt-2">
                      Resend available in: <strong>{formatTimer(timer)}</strong>
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
      {/* <Footer /> */}
    </>
  );
}

export default page;
