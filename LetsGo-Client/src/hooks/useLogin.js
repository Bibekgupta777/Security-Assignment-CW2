import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../store/auth";

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = async (data) => {
    try {
      const response = await axios.post("/api/user/sign-in", data);

      // Save user data in Redux and localStorage
      dispatch(authActions.login());
      dispatch(authActions.changeRole(response.data.user.role));
      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("token", response.data.user.token);
      localStorage.setItem("role", response.data.user.role);

      toast.success("Login successful!");

      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data.message || "Login failed!");
    }
  };

  return { login };
};

export default useLogin;
