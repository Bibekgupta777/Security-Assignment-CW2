import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useState, useEffect } from "react";
import useRegister from "../../../hooks/useRegister";
import wallpaper from "/Logo/busBg.jpg";
import loadingGif from "/Logo/buttonLoading.gif";
import star from "/Logo/star.png";
import Navbar from "../../../components/Navbar";

// Yup schema for backend validation consistency
const schema = yup
  .object({
    name: yup
      .string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters"),
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .matches(/[A-Z]/, "At least one uppercase letter")
      .matches(/[a-z]/, "At least one lowercase letter")
      .matches(/[0-9]/, "At least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "At least one special character"),
  })
  .required();

// Password requirements to show
const passwordRequirements = [
  { label: "8-20 characters", test: (pw) => pw.length >= 8 && pw.length <= 20 },
  { label: "Uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "Number (0-9)", test: (pw) => /[0-9]/.test(pw) },
  {
    label: "Special character (!@#$%^&*(),.?\":{}|<>)",
    test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
];

// Calculate strength score (0-5)
function calculatePasswordStrength(password) {
  return passwordRequirements.reduce(
    (score, req) => (req.test(password) ? score + 1 : score),
    0
  );
}

// Strength labels and colors
const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColors = [
  "bg-red-600",
  "bg-red-400",
  "bg-yellow-400",
  "bg-yellow-600",
  "bg-green-500",
  "bg-green-700",
];

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { registerUser, loading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Watch password input live
  const passwordValue = watch("password") || "";

  // Update strength bar on password change
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(passwordValue));
  }, [passwordValue]);

  const submit = async (data) => {
    await registerUser(data);
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
            className="flex justify-center items-center flex-col w-full"
            noValidate
          >
            <div className="text-center mt-32">
              <img src={star} alt="Logo" className="cursor-pointer md:w-14 w-10" />
              <h1 className="text-3xl font-medium mt-6">Create Your Account</h1>
            </div>

            <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-20">
              <h1>Full Name</h1>
              <div className="h-12 w-full border-solid border rounded-md border-gray-300 flex items-center pl-4 pr-2">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full outline-none appearance-none"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <h6 className="text-red-500 text-xs mt-1">{errors.name?.message}</h6>
              )}
            </div>

            <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-6">
              <h1>Email</h1>
              <div className="h-12 w-full border-solid border rounded-md border-gray-300 flex items-center pl-4 pr-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full outline-none appearance-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <h6 className="text-red-500 text-xs mt-1">{errors.email?.message}</h6>
              )}
            </div>

            <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-6">
              <h1>Password</h1>
              <div className="h-12 w-full border-solid border rounded-md border-gray-300 flex items-center pl-4 pr-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full outline-none"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-sm text-gray-500 ml-2 z-10"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <h6 className="text-red-500 text-xs mt-1">{errors.password?.message}</h6>
              )}

              {/* Improved Password requirements list */}
              <div className="mt-3 mb-2 text-sm p-3 rounded-md bg-gray-50 border border-gray-200 max-w-md">
                <h4 className="font-semibold mb-2 text-gray-700">Password Requirements:</h4>
                <ul className="space-y-2">
                  {passwordRequirements.map((req) => {
                    const passed = req.test(passwordValue);
                    return (
                      <li
                        key={req.label}
                        className={`flex items-center ${
                          passed ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 mr-3 flex-shrink-0 ${
                            passed ? "opacity-100" : "opacity-40"
                          } transition-opacity duration-300`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{req.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Password strength bar */}
              <div className="w-full bg-gray-300 rounded h-2 overflow-hidden">
                <div
                  className={`h-2 rounded transition-all duration-500 ease-in-out ${
                    strengthColors[passwordStrength]
                  }`}
                  style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                ></div>
              </div>
              <p
                className={`mt-1 text-sm font-semibold ${
                  passwordStrength >= 4 ? "text-green-700" : "text-red-600"
                } transition-colors duration-500`}
              >
                Strength: {strengthLabels[passwordStrength]}
              </p>
            </div>

            <button
              type="submit"
              className="mt-10 md:w-7/12 w-11/12 rounded-md h-12 flex items-center justify-center bg-green-600 text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold"
              disabled={passwordStrength < 4}
              title={
                passwordStrength < 4
                  ? "Password is too weak to submit"
                  : "Submit your registration"
              }
            >
              {loading ? (
                <img src={loadingGif} alt="Loading..." className="w-10 h-10" />
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="md:w-6/12 w-11/12 flex text-sm justify-center pt-4">
              <h3 className="text-gray-500">Already have an account?</h3>
              <Link to="/login">
                <h3 className="text-green-600 ml-1 font-medium cursor-pointer hover:underline">
                  Sign in
                </h3>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
