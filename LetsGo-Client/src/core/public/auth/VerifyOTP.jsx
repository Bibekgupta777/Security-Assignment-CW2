import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Add this import
import { toast } from "react-toastify";
import star from "/Logo/star.png"; // Adjust path as needed
import Navbar from "../../../components/Navbar"; // Adjust path as needed
import { authActions } from "../../../store/authSlice"; // Adjust path to your Redux slice

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRefs = useRef([]);
  
  const email = location.state?.email;

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      toast.error("Please login first");
      navigate("/login");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format countdown timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedOtp = pastedData.replace(/\D/g, "").slice(0, 6).split("");
    
    const newOtp = [...otp];
    pastedOtp.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus on the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === "");
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex].focus();
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setLoading(true);
    
    try {
      // 🔥 Updated API endpoint to match your backend
      const response = await fetch("/api/users/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.user.token) {
        // 🔥 Save user data and update Redux state
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Update Redux state
        dispatch(authActions.login());
        dispatch(authActions.changeRole(data.user.role));
        
        toast.success("Login successful!");
        
        // Navigate based on role
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/"); // or "/dashboard"
        }
      } else {
        toast.error(data.message || "Invalid OTP");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    
    try {
      const response = await fetch("/api/users/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("New OTP sent to your email!");
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]); // Clear current OTP
        inputRefs.current[0].focus();
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <Navbar />
      <div className="flex w-full h-screen mx-auto max-w-[1300px] p-2 items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-8">
              <img src={star} alt="Logo" className="cursor-pointer w-14 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit code to <br />
                <span className="font-medium text-green-600">{email}</span>
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-center space-x-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>
              
              <div className="text-center text-sm text-gray-600 mb-4">
                {timeLeft > 0 ? (
                  <p>Code expires in: <span className="font-medium text-red-500">{formatTime(timeLeft)}</span></p>
                ) : (
                  <p className="text-red-500">OTP has expired</p>
                )}
              </div>
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                disabled={!canResend || resendLoading}
                className="text-green-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-500 text-sm hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;