import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import { UserProvider } from "./context/UserContext";
import { authActions } from "./store/auth";
import AdminContactMessages from "./core/private/components/AdminContactMessages";

// Lazy-loaded components
const Home = lazy(() => import("./core/public/home/Home"));
const LoginPage = lazy(() => import("./core/public/auth/LoginPage"));
const RegisterPage = lazy(() => import("./core/public/auth/RegisterPage"));
const ForgotPassword = lazy(() => import("./core/public/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./core/public/auth/ResetPassword"));
const BookingConfirmation = lazy(() =>
  import("./core/public/booking/BookingConfirmation")
);
const ContactUs = lazy(() => import("./core/public/contactUs/ContactUs"));
const Destinations = lazy(() =>
  import("./core/public/destination/Destinations")
);
const SeatSelection = lazy(() =>
  import("./core/public/seatSelection/SeatSelection")
);
const UserProfile = lazy(() => import("./core/public/userProfile/UserProfile"));

const AdminDashboard = lazy(() => import("./core/private/dashboard"));
const BusManagement = lazy(() => import("./core/private/busManagement"));
const RouteManagement = lazy(() => import("./core/private/routeManagement"));
const BookingManagement = lazy(() =>
  import("./core/private/bookingManagement")
);
const Layout = lazy(() => import("./core/private/Layout"));
const PaymentManagement = lazy(() =>
  import("./core/private/paymentManagement")
);
const ScheduleManagement = lazy(() =>
  import("./core/private/scheduleManagement")
);
const UserManagement = lazy(() => import("./core/private/userManagement"));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Checking auth state:", isAuthenticated, role);
    if (
      localStorage.getItem("id") &&
      localStorage.getItem("token") &&
      localStorage.getItem("role")
    ) {
      const roleFromLocalStorage = localStorage.getItem("role");
      dispatch(authActions.login());
      dispatch(authActions.changeRole(roleFromLocalStorage));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <UserProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
          />

          {/* Private Routes - Only accessible if authenticated and role is 'admin' */}
          {isAuthenticated && role === "admin" ? (
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="bus-management" element={<BusManagement />} />
              <Route path="route-management" element={<RouteManagement />} />
              <Route
                path="schedule-management"
                element={<ScheduleManagement />}
              />
              <Route
                path="booking-management"
                element={<BookingManagement />}
              />
              <Route
                path="payment-management"
                element={<PaymentManagement />}
              />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="contact-messages" element={<AdminContactMessages />} />
            </Route>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </UserProvider>
    </Suspense>
  );
}

export default App;