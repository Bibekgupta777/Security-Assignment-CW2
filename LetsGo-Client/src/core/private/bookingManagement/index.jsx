import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Eye } from "lucide-react";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const token = localStorage.getItem("token");

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/booking/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    try {
      const response = await axios.put(
        `/api/booking/${selectedBooking._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        fetchBookings();
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      (!filterStatus || booking.booking_status === filterStatus) &&
      (!filterUser || 
        (booking.user_id?.name?.toLowerCase() || "").includes(filterUser.toLowerCase()) ||
        (booking.user_id?.email?.toLowerCase() || "").includes(filterUser.toLowerCase()))
  );

  const getUserDisplayName = (user) => {
    if (!user) return "N/A";
    return user.name || user.email || "N/A";
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Management</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="select select-bordered w-full max-w-52"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Filter by Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          className="border rounded-md px-2 py-1"
          placeholder="Filter by User Name/Email"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
      </div>

      {/* Bookings Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{getUserDisplayName(booking.user_id)}</TableCell>
                <TableCell>
                  {booking.schedule_id?.route_id?.source || 'N/A'} →{" "}
                  {booking.schedule_id?.route_id?.destination || 'N/A'}
                </TableCell>
                <TableCell>
                  {booking.seats?.map((seat) => seat.seat_number).join(", ") || 'N/A'}
                </TableCell>
                <TableCell>Rs. {booking.total_amount}</TableCell>
                <TableCell>{booking.booking_status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {booking.booking_status !== "cancelled" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Booking Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-2">
              <p>
                <strong>User:</strong> {getUserDisplayName(selectedBooking.user_id)}
              </p>
              <p>
                <strong>Email:</strong> {selectedBooking.user_id?.email || 'N/A'}
              </p>
              <p>
                <strong>Route:</strong>{" "}
                {selectedBooking.schedule_id?.route_id?.source || 'N/A'} →{" "}
                {selectedBooking.schedule_id?.route_id?.destination || 'N/A'}
              </p>
              <p>
                <strong>Seats:</strong>{" "}
                {selectedBooking.seats
                  ?.map((seat) => `${seat.seat_number} (${seat.passenger_name})`)
                  .join(", ") || 'N/A'}
              </p>
              <p>
                <strong>Total Amount:</strong> Rs.{selectedBooking.total_amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedBooking.booking_status}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to cancel this booking?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;