// ============================================================================
// ✅ Updated useLogin Hook (hooks/useLogin.js) with Remaining Time for 429
// ============================================================================

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../store/auth";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/user/sign-in", data);

      console.log("Login response:", response.data);

      // ✅ OTP flow
      if (response.data.otpRequired || response.data.requiresOTP || response.data.otpSent) {
        return {
          success: true,
          message: response.data.message || "OTP sent to your email",
          requiresOTP: true
        };
      }

      // ✅ Direct login flow
      if (response.data.user && response.data.user.token) {
        dispatch(authActions.login());
        dispatch(authActions.changeRole(response.data.user.role));

        localStorage.setItem("id", response.data.user.id);
        localStorage.setItem("token", response.data.user.token);


        toast.success("✅ Login successful!");

        navigate(response.data.user.role === "admin" ? "/admin/dashboard" : "/");

        return {
          success: true,
          message: "Login successful",
          directLogin: true
        };
      }

      return {
        success: false,
        message: "Unexpected response format"
      };

    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed, try again later";

      // ✅ Handle Too Many Requests (429)
      if (error.response?.status === 429) {
        // --- Method 1: If backend sends retryAfter in seconds
        if (error.response.data.retryAfter) {
          const seconds = error.response.data.retryAfter;
          const minutes = Math.floor(seconds / 60);
          const sec = seconds % 60;
          errorMessage = `Too many attempts! Try again after ${minutes}m ${sec}s.`;
        }
        // --- Method 2: Parse message text (fallback)
        else if (error.response.data.message) {
          errorMessage = error.response.data.message; // e.g., "Too many login attempts, please try again after 15 minutes."
        }
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };

    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle successful OTP verification
  const handleOTPSuccess = (userData) => {
    try {
      dispatch(authActions.login());
      dispatch(authActions.changeRole(userData.role));

      localStorage.setItem("id", userData.id || userData._id);
      localStorage.setItem("token", userData.token);
      localStorage.setItem("role", userData.role);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("✅ Login successful!");

      navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
    } catch (error) {
      console.error("Error handling OTP success:", error);
      toast.error("Error completing login");
    }
  };

  return { login, loading, handleOTPSuccess };
};

export default useLogin;
