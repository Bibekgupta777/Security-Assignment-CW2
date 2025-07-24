import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email; // get email passed from login page

  if (!email) {
    // if no email in state, redirect to login
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // ✅ Save user data (original login logic moved here)
      // You can now dispatch Redux actions
      dispatch(authActions.login());
      dispatch(authActions.changeRole(data.role));

      // ✅ If you want to keep in memory only, do NOT use localStorage
      // sessionStorage.removeItem("pendingEmail");

      toast.success("OTP Verified successfully!");

      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else {
      toast.error(data.message || "Invalid OTP");
    }
  } catch (err) {
    toast.error("Something went wrong!");
  }

  setLoading(false);
};


  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-6 border rounded-md shadow-md"
      >
        <h2 className="mb-4 text-xl font-bold">Verify OTP</h2>
        <p className="mb-4">Enter the OTP sent to {email}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
