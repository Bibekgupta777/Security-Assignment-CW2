// ============================================================================
// 2. Updated LoginPage.jsx - Simplified
// ============================================================================

import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import wallpaper from "/Logo/busBg.jpg";
import star from "/Logo/star.png";
import useLogin from "../../../hooks/useLogin";
import Navbar from "../../../components/Navbar";
import { toast } from "react-toastify";

const schema = yup
  .object({
    email: yup.string().required("Email is required").email("Enter a valid email address"),
    password: yup.string().required("Password is required"),
  })
  .required();

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { login, loading } = useLogin();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const submit = async (data) => {
    try {
      const res = await login(data);
      
      if (res.success && res.requiresOTP) {
        // OTP was sent, navigate to verification page
        toast.success("OTP sent to your email!");
        navigate("/verify-otp", { state: { email: data.email } });
      } else if (res.success && res.directLogin) {
        // Direct login successful (handled in useLogin hook)
        // No additional action needed
      } else {
        // Login failed
        toast.error(res.message || "Too many attempts, please try again later.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex w-full h-screen mx-auto max-w-[1300px] p-2">
        <div
          className="lg:w-7/12 bg-cover bg-center rounded-l-2xl"
          style={{ backgroundImage: `url(${wallpaper})` }}
        ></div>

        <div className="w-full lg:w-5/12 flex items-center justify-center">
          <form
            onSubmit={handleSubmit(submit)}
            className="flex flex-col justify-center items-center w-full"
          >
            <div className="mt-20 text-center">
              <img src={star} alt="Logo" className="cursor-pointer md:w-14 w-10" />
              <h1 className="text-3xl font-bold mt-6">Login to your Account</h1>
            </div>

            <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-16">
              <label className="mb-2 font-medium">Email</label>
              <div className="h-12 w-full border rounded-md border-gray-300 flex items-center pl-4 pr-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-6">
              <label className="mb-2 font-medium">Password</label>
              <div className="h-12 border rounded-md border-gray-300 flex items-center pl-4 pr-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full outline-none"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-sm text-gray-500 ml-2"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="md:w-7/12 w-11/12 flex justify-end pt-4 pr-1">
              <Link to="/forgot-password">
                <p className="text-green-600 text-sm cursor-pointer hover:text-black">
                  Forgot password?
                </p>
              </Link>
            </div>

            <button
              className="mt-10 md:w-7/12 w-11/12 rounded-md h-12 bg-green-600 text-white text-lg font-medium hover:bg-[#403a4f] transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Login"}
            </button>

            <div className="md:w-6/12 w-11/12 flex text-sm justify-center pt-4">
              <p className="text-gray-500">Not registered yet?</p>
              <Link to="/signup">
                <p className="text-green-600 ml-1 font-medium cursor-pointer hover:underline">
                  Create an account
                </p>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;