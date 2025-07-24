import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const OtpPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Get email from login navigation

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter OTP");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/users/verify-otp", { email, otp });
      if (data.success) {
        toast.success("Login successful!");
        navigate("/"); // Navigate to home page
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white shadow-lg p-6 rounded-md max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
        <p className="text-gray-600 text-sm mb-4 text-center">
          We sent a verification code to <strong>{email}</strong>
        </p>
        <input
          type="text"
          className="w-full border rounded-md p-2 text-center mb-4"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={handleVerifyOtp}
          className="w-full bg-green-600 text-white rounded-md py-2 hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpPage;
