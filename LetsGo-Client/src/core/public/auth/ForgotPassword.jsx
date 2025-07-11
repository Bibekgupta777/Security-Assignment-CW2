import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as yup from "yup";
import wallpaper from "/Logo/busBg.png";
import star from "/Logo/star.png";
import { useState } from "react";
import axios from "axios";

const schema = yup
  .object({
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email address"),
  })
  .required();

const ForgotPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const submit = async (data) => {
    try {
      setLoading(true);
      setStatus({ type: '', message: '' });

      const response = await axios.post('/api/user/forgot-password', data);
      
      setStatus({
        type: 'success',
        message: 'Password reset link has been sent to your email'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send reset link'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"flex w-full h-screen mx-auto max-w-[1300px] p-2"}>
      <div
        className="lg:w-7/12 bg-cover bg-center rounded-l-2xl"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      <div className="w-full lg:w-5/12">
        <form
          onSubmit={handleSubmit(submit)}
          className="flex justify-center items-center flex-col md:mt-14 mt-20"
        >
          <div className="">
            <img
              src={star}
              alt="Logo"
              className="cursor-pointer md:w-12 w-8"
            />
            <h1 className="text-2xl md:text-3xl font-medium mb-1 flex mt-4">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm mt-2 text-center">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-14">
            <h1>Email</h1>
            <div className="h-12 w-full border-solid border rounded-md border-gray-300 flex items-center pl-4 pr-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none appearance-none"
                {...register("email")}
                disabled={loading}
              />
            </div>
          </div>

          {errors.email && (
            <h6 className="md:w-7/12 w-11/12 text-red-500 text-xs mt-1">
              {errors.email.message}
            </h6>
          )}

          {status.message && (
            <div className={`md:w-7/12 w-11/12 mt-4 p-3 rounded-md ${
              status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {status.message}
            </div>
          )}

          <button
            className={`mt-8 md:w-7/12 w-11/12 rounded-md h-12 bg-green-600 text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                <span className="ml-2">Sending...</span>
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="md:w-6/12 w-11/12 flex text-sm justify-center pt-6">
            <Link to="/login">
              <span className="text-green-600 hover:text-green-700">
                ← Back to Login
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;