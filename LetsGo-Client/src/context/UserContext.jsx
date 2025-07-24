import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../store/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const authenticateToken = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `/api/user/get-user-by-id/${userId}`
          );
          setUserInfo(response.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, authenticateToken]);

  // Updated logout function
  const logout = async () => {
    try {
      // Call backend logout to destroy session and clear cookies
      await axios.post(
        "/api/user/logout",
        {},
        {
          withCredentials: true, // Important: send cookies
        }
      );

      // Clear Redux auth state and localStorage
      dispatch(authActions.logout());
      localStorage.removeItem("id");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setUserInfo(null);

      // Redirect or reload app as needed
      window.location.href = "/login"; // redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed, please try again.");
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
