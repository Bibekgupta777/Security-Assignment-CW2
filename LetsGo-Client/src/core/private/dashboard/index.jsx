import axios from "axios";
import "chart.js/auto";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch summary data
  const fetchDashboardData = async () => {
    try {
      const [usersRes, bookingsRes, paymentsRes, analyticsRes] =
        await Promise.all([
          axios.get("/api/admin/users/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/bookings/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/payments/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/analytics/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setTotalUsers(usersRes.data.totalUsers);
      setTotalBookings(bookingsRes.data.totalBookings);
      setTotalRevenue(paymentsRes.data.totalRevenue);
      setTotalPayments(paymentsRes.data.totalPayments);

      setBookingTrends(analyticsRes.data.bookingTrends);
      setUserRegistrations(analyticsRes.data.userRegistrations);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Bookings</h2>
          <p className="text-2xl font-bold">{totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold">Rs. {totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Payments</h2>
          <p className="text-2xl font-bold">{totalPayments}</p>
        </div>
      </div>

      {/* Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Booking Trends</h2>
          <Line
            data={{
              labels: bookingTrends.map((data) => data.date),
              datasets: [
                {
                  label: "Bookings",
                  data: bookingTrends.map((data) => data.count),
                  borderColor: "rgba(54, 162, 235, 0.8)",
                  fill: false,
                },
              ],
            }}
          />
        </div>

        {/* User Registrations */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">User Registrations</h2>
          <Line
            data={{
              labels: userRegistrations.map((data) => data.date),
              datasets: [
                {
                  label: "Registrations",
                  data: userRegistrations.map((data) => data.count),
                  borderColor: "rgba(255, 99, 132, 0.8)",
                  fill: false,
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/user-management"
            className="bg-blue-500 text-white py-3 px-4 rounded text-center shadow hover:bg-blue-600"
          >
            Manage Users
          </a>
          <a
            href="/admin/booking-management"
            className="bg-green-500 text-white py-3 px-4 rounded text-center shadow hover:bg-green-600"
          >
            Manage Bookings
          </a>
          <a
            href="/admin/payment-management"
            className="bg-yellow-500 text-white py-3 px-4 rounded text-center shadow hover:bg-yellow-600"
          >
            Manage Payments
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;