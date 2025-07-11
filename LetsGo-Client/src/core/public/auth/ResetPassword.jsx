import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import * as yup from "yup";
import wallpaper from "/Logo/busBg.png";
import star from "/Logo/star.png";
import { useState, useEffect } from "react";
import axios from "axios";

const schema = yup
  .object({
    newPassword: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .matches(/[A-Z]/, "At least one uppercase letter")
      .matches(/[a-z]/, "At least one lowercase letter")
      .matches(/[0-9]/, "At least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "At least one special character"),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("newPassword")], "Passwords must match"),
  })
  .required();

// Password requirements array
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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const newPassword = watch("newPassword") || "";

  // Update strength bar on password change
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const submit = async (data) => {
    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      await axios.post("/api/user/reset-password", {
        token,
        newPassword: data.newPassword,
      });

      setStatus({
        type: "success",
        message: "Password reset successful",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to reset password",
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
          noValidate
        >
          <div className="">
            <img src={star} alt="Logo" className="cursor-pointer md:w-12 w-8" />
            <h1 className="text-2xl md:text-3xl font-medium mb-1 flex mt-4">
              Set New Password
            </h1>
          </div>

          <div className="md:w-7/12 w-11/12 flex flex-col justify-center mt-14">
            <h1>New Password</h1>
            <div className="h-12 w-full border-solid border rounded-md border-gray-300 flex items-center pl-4 pr-2 relative">
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full outline-none appearance-none"
                {...register("newPassword")}
                disabled={loading}
              />
            </div>
            {errors.newPassword && (
              <h6 className="text-red-500 text-xs mt-1">{errors.newPassword.message}</h6>
            )}

            {/* Password requirements list */}
            <ul className="mt-3 mb-2 text-xs space-y-1">
              {passwordRequirements.map((req) => {
                const passed = req.test(newPassword);
                return (
                  <li
                    key={req.label}
                    className={`flex items-center transition-colors duration-300 ${
                      passed ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 mr-1 flex-shrink-0 ${
                        passed ? "opacity-100" : "opacity-30"
                      } transition-opacity duration-300`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {req.label}
                  </li>
                );
              })}
            </ul>

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

          {status.message && (
            <div
              className={`md:w-7/12 w-11/12 mt-4 p-3 rounded-md ${
                status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            className={`mt-8 md:w-7/12 w-11/12 rounded-md h-12 bg-green-600 text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading || passwordStrength < 4}
            title={
              loading
                ? "Resetting password..."
                : passwordStrength < 4
                ? "Password is too weak to submit"
                : "Submit your new password"
            }
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                <span className="ml-2">Resetting...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
