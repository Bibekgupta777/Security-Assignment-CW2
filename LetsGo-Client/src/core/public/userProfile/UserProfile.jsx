import Navbar from "@/components/Navbar";
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
const LOCAL_STORAGE_IMAGE_KEY = "profile-image-url";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("past");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, bookingsResponse] = await Promise.all([
          axios.get(`/api/user/get-user-by-id/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/booking/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const apiUser = userResponse.data;
        const savedUserJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        const savedUser = savedUserJson ? JSON.parse(savedUserJson) : null;
        const mergedUser = savedUser ? { ...apiUser, ...savedUser } : apiUser;

        setUser(mergedUser);
        setBookings(bookingsResponse.data.data);

        const savedImage = localStorage.getItem(LOCAL_STORAGE_IMAGE_KEY);
        if (savedImage) setProfileImage(savedImage);

        setLoading(false);
      } catch (error) {
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, token]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(LOCAL_STORAGE_IMAGE_KEY, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelBooking = async () => {
    try {
      const response = await axios.put(
        `/api/booking/${selectedBooking._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.createdAt);
    const today = new Date();
    if (activeTab === "upcoming") {
      return bookingDate >= today && booking.booking_status !== "cancelled";
    }
    return bookingDate < today || booking.booking_status === "cancelled";
  });

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
      const updatedUser = {
        ...user,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
      };
      setUser(updatedUser);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-green-500">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full text-gray-400" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute bottom-0 left-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-600">{user?.phone || "No phone"}</p>
            <p className="text-sm text-gray-600">{user?.address || "No address"}</p>
          </div>
          <Button onClick={openEditModal} className="ml-auto">Edit Profile</Button>
        </div>
        {/* Additional UI: bookings, modals, etc. */}
      </div>
    </div>
  );
};

export default UserProfile;
