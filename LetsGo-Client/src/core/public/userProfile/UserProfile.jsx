import Navbar from "@/components/Navbar"; // Navbar import added
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import {
  Calendar,
  Clock,
  CreditCard,
  Eye,
  Mail,
  MapPin,
  Tag,
  User,
  XCircle,
  Phone,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_USER_KEY = "profile-edited-user";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("past");

  // Edit Profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, bookingsResponse] = await Promise.all([
          axios.get(`/api/user/get-user-by-id/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/booking/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Original user from API
        const apiUser = userResponse.data;

        // Try to get locally saved edits
        const savedUserJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        const savedUser = savedUserJson ? JSON.parse(savedUserJson) : null;

        // Merge saved edits on top of API user data
        const mergedUser = savedUser
          ? { ...apiUser, ...savedUser }
          : apiUser;

        setUser(mergedUser);
        setBookings(bookingsResponse.data.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleCancelBooking = async () => {
    try {
      const response = await axios.put(
        `/api/booking/${selectedBooking._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setIsCancelModalOpen(false);
        const bookingsResponse = await axios.get(`/api/booking/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookingsResponse.data.data);
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm";
      case "pending":
        return "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm";
      case "cancelled":
        return "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm";
      default:
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm";
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.createdAt);
    const today = new Date();
    if (activeTab === "upcoming") {
      return bookingDate >= today && booking.booking_status !== "cancelled";
    }
    return bookingDate < today || booking.booking_status === "cancelled";
  });

  // Open Edit modal & prefill with current user (from merged state)
  const openEditModal = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save edits: update user state AND save to localStorage
  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError("Name and Email are required.");
      setEditLoading(false);
      return;
    }

    try {
      // Here you would normally update backend. Since you want local only:
      // We update local state and localStorage directly.

      const updatedUser = {
        ...user,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
      };

      setUser(updatedUser);

      // Save only editable fields to localStorage so next time we merge properly
      const toSave = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(toSave));

      setEditSuccess("Profile updated and saved locally!");
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (error) {
      setEditError("An error occurred while saving.");
      console.error(error);
    }

    setEditLoading(false);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500 text-center">
            <p className="text-xl">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 p-8 rounded-full">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <div className="mt-2 flex flex-col lg:flex-row gap-4 text-gray-600">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{user?.phone || "Not Provided"}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user?.address || "Not Provided"}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditModal}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("past")}
                  className={`pb-4 px-2 ${
                    activeTab === "past"
                      ? "border-b-2 border-green-500 text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  My Bookings
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                <p className="mt-1 text-gray-500">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming bookings."
                    : "You don't have any past bookings."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span className="text-lg font-medium">
                              {booking.schedule_id?.route_id?.source} →{" "}
                              {booking.schedule_id?.route_id?.destination}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <span>
                                Seats:{" "}
                                {booking.seats
                                  .map((seat) => seat.seat_number)
                                  .join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span>Rs. {booking.total_amount}</span>
                            </div>
                            <div>
                              <span className={getStatusBadgeClass(booking.booking_status)}>
                                {booking.booking_status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 lg:flex-col justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {booking.booking_status !== "cancelled" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsCancelModalOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-medium">
                      {selectedBooking.schedule_id?.route_id?.source} →{" "}
                      {selectedBooking.schedule_id?.route_id?.destination}
                    </span>
                  </div>
                  <span
                    className={getStatusBadgeClass(selectedBooking.booking_status)}
                  >
                    {selectedBooking.booking_status}
                  </span>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Booking Date</label>
                      <p className="font-medium">
                        {new Date(selectedBooking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Total Amount</label>
                      <p className="font-medium">Rs. {selectedBooking.total_amount}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Seats</label>
                      <p className="font-medium">
                        {selectedBooking.seats
                          .map((seat) => seat.seat_number)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Payment Status</label>
                      <p className="font-medium">{selectedBooking.payment_status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Booking Modal */}
        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Cancel Booking</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
                No, Keep it
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking}>
                Yes, Cancel Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editError && (
                <p className="text-red-600 text-center font-medium">{editError}</p>
              )}
              {editSuccess && (
                <p className="text-green-600 text-center font-medium">{editSuccess}</p>
              )}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="name"
                >
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="email"
                >
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="address"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditError(null);
                  setEditSuccess(null);
                }}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default UserProfile;
