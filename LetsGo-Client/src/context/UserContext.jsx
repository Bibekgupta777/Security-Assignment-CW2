import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../store/auth";

export const UserContext = createContext();

// Helper functions for cookie management
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;samesite=strict`;
};

// Create axios instance with default configuration
const createAxiosInstance = () => {
  const instance = axios.create({
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [axiosInstance, setAxiosInstance] = useState(null);

  const dispatch = useDispatch();

  // Helper function to get current user ID from cookies only
  const getCurrentUserId = () => {
    return getCookie("id");
  };

  // Helper function to get current token from cookies only
  const getCurrentToken = () => {
    return getCookie("token");
  };

  // Clear all authentication data
  const clearAuthData = () => {
    // Clear cookies
    deleteCookie("id");
    deleteCookie("token");
    deleteCookie("role");
    deleteCookie("user");
    
    // Clear Redux state
    dispatch(authActions.logout());
    
    // Clear local state
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  // Set authentication data
  const setAuthData = (userData) => {
    // Set cookies only
    setCookie("id", userData.id || userData._id);
    setCookie("token", userData.token);
    setCookie("role", userData.role);
    
    // Update Redux state
    dispatch(authActions.login());
    dispatch(authActions.changeRole(userData.role));
    
    // Update local state
    setUserInfo(userData);
    setIsAuthenticated(true);
  };

  // Check if user is authenticated
  const checkAuth = () => {
    const userId = getCurrentUserId();
    const token = getCurrentToken();
    const hasAuth = !!(userId && token);
    
    if (hasAuth !== isAuthenticated) {
      setIsAuthenticated(hasAuth);
      if (hasAuth) {
        dispatch(authActions.login());
      } else {
        dispatch(authActions.logout());
      }
    }
    
    return hasAuth;
  };

  // Setup axios interceptors and global configuration immediately
  useEffect(() => {
    const setupAxios = () => {
      // Clear any existing interceptors first
      axios.interceptors.request.handlers = [];
      axios.interceptors.response.handlers = [];
      
      // Set up the default axios instance
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common['Content-Type'] = 'application/json';
      
      // Add request interceptor to default axios
      const requestInterceptor = axios.interceptors.request.use(
        (config) => {
          const token = getCookie('token');
          const userId = getCookie('id');
          
          // Always log request details for debugging
          console.log('Axios request:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            hasUserId: !!userId,
            isAuthenticated,
            authInitialized,
            cookies: document.cookie
          });
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Added Authorization header:', `Bearer ${token.substring(0, 20)}...`);
          } else {
            console.error('No token found for request:', config.url);
            console.log('Available cookies:', document.cookie);
          }
          
          return config;
        },
        (error) => {
          console.error('Request interceptor error:', error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor to default axios
      const responseInterceptor = axios.interceptors.response.use(
        (response) => {
          console.log('Successful response:', response.config.url, response.status);
          return response;
        },
        (error) => {
          console.error('Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message,
            headers: error.response?.headers
          });
          
          if (error.response?.status === 401) {
            console.error('401 Unauthorized - clearing auth data and redirecting to login');
            clearAuthData();
            // Small delay to ensure state is cleared
            setTimeout(() => {
              window.location.href = "/login";
            }, 100);
          }
          return Promise.reject(error);
        }
      );

      // Cleanup function
      return () => {
        axios.interceptors.request.eject(requestInterceptor);
        axios.interceptors.response.eject(responseInterceptor);
      };
    };

    // Setup axios immediately, don't wait for auth initialization
    const cleanup = setupAxios();
    return cleanup;
  }, []); // Run only once on component mount

  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      const userId = getCurrentUserId();
      const token = getCurrentToken();
      
      console.log('Auth initialization check:', {
        hasUserId: !!userId,
        hasToken: !!token,
        userId,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null
      });
      
      if (userId && token) {
        try {
          // Immediately set as authenticated to prevent flashing
          setIsAuthenticated(true);
          dispatch(authActions.login());
          console.log('Set as authenticated immediately');
          
          // Create a temporary axios instance for this request to avoid circular dependency
          const tempAxios = axios.create({
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Fetching user data to verify token...');
          // Fetch user data to verify token
          const response = await tempAxios.get(`/api/user/get-user-by-id/${userId}`);
          
          const userData = response.data;
          console.log('User data fetched successfully:', userData);
          setUserInfo(userData);
          
          // Update Redux state with role
          if (userData.role) {
            dispatch(authActions.changeRole(userData.role));
            console.log('Role set:', userData.role);
          }
          
          // Ensure cookies are properly set
          setCookie("id", userId);
          setCookie("token", token);
          setCookie("role", userData.role);
          console.log('Cookies refreshed');
          
        } catch (error) {
          console.error("Error verifying authentication:", error);
          
          // If token is invalid, clear all auth data
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Invalid token, clearing auth data');
            clearAuthData();
          }
        }
      } else {
        // No authentication data found
        console.log('No authentication data found, clearing auth');
        clearAuthData();
      }
      
      setLoading(false);
      setAuthInitialized(true);
      console.log('Authentication initialization complete');
    };

    initializeAuth();
  }, [dispatch]);

  // Helper function to set user data (used by login)
  const setUserData = (userData) => {
    console.log('Setting user data:', userData);
    setAuthData(userData);
    
    // Force refresh cookies to ensure they're available immediately
    setCookie("id", userData.id || userData._id);
    setCookie("token", userData.token);
    setCookie("role", userData.role);
    
    console.log('User data set, cookies updated');
  };

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout
      await axios.post(
        "/api/user/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout API failed:", error);
    }

    // Clear all auth data
    clearAuthData();

    // Force page reload to ensure clean state
    window.location.href = "/login";
  };

  // Simple logout without API call
  const logoutSimple = () => {
    clearAuthData();
    window.location.href = "/login";
  };

  // Force a re-check of authentication status
  const refreshAuth = () => {
    checkAuth();
  };

  // Authenticated axios instance for manual use
  const authenticatedRequest = (config) => {
    const token = getCurrentToken();
    const userId = getCurrentUserId();
    
    if (!token || !userId) {
      throw new Error('No authentication token available');
    }

    if (!authInitialized) {
      throw new Error('Authentication not yet initialized');
    }

    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    return axios({
      ...config,
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  };

  // Wait for authentication before making requests
  const waitForAuth = () => {
    return new Promise((resolve, reject) => {
      if (authInitialized) {
        if (isAuthenticated) {
          resolve(true);
        } else {
          reject(new Error('User not authenticated'));
        }
        return;
      }

      // Wait for auth to initialize
      const checkAuth = () => {
        if (authInitialized) {
          if (isAuthenticated) {
            resolve(true);
          } else {
            reject(new Error('User not authenticated'));
          }
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      
      checkAuth();
    });
  };

  // Safe authenticated request that waits for auth
  const safeAuthenticatedRequest = async (config) => {
    try {
      await waitForAuth();
      return authenticatedRequest(config);
    } catch (error) {
      console.error('Authentication check failed:', error.message);
      throw error;
    }
  };

  const contextValue = {
    userInfo,
    setUserInfo,
    loading,
    isAuthenticated,
    authInitialized,
    logout,
    logoutSimple,
    setUserData,
    getCookie,
    setCookie,
    deleteCookie,
    getCurrentUserId,
    getCurrentToken,
    checkAuth,
    refreshAuth,
    clearAuthData,
    authenticatedRequest, // For manual authenticated requests
    safeAuthenticatedRequest, // Waits for auth before making request
    waitForAuth, // Helper to wait for auth initialization
    axiosInstance // Direct access to configured axios instance
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};