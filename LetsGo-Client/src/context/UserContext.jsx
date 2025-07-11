import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../store/auth"; // Assuming you're using Redux for authentication

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch(); // We need dispatch to call logout action

  // Access token and user ID from localStorage
  const authenticateToken = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `/api/user/get-user-by-id/${userId}` // Adjust endpoint
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

  // Logout function to be used across components
  const logout = () => {
    dispatch(authActions.logout()); // Clear auth state in Redux
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserInfo(null); // Clear the user info from context
    window.location.reload(); // Optionally reload to reset the app state
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
