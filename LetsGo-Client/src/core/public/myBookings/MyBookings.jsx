import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`/api/booking/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  };

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
        fetchBookings(); // Refresh bookings list
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) return <div className="p-8 text-center">Loading bookings...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center text-gray-500">No bookings found</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {booking.schedule_id?.route_id?.source} →{" "}
                    {booking.schedule_id?.route_id?.destination}
                  </TableCell>
                  <TableCell>
                    {booking.seats.map((seat) => seat.seat_number).join(", ")}
                  </TableCell>
                  <TableCell>Rs. {booking.total_amount}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(booking.booking_status)}>
                      {booking.booking_status}
                    </span>
                  </TableCell>
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
                        <Eye className="h-4 w-4" />
                      </Button>
                      {booking.booking_status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsCancelModalOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Booking Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Route</h3>
                  <p>
                    {selectedBooking.schedule_id?.route_id?.source} →{" "}
                    {selectedBooking.schedule_id?.route_id?.destination}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Date</h3>
                  <p>
                    {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Seats</h3>
                  <p>
                    {selectedBooking.seats
                      .map((seat) => seat.seat_number)
                      .join(", ")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Total Amount</h3>
                  <p>Rs. {selectedBooking.total_amount}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Booking Status</h3>
                  <p className={getStatusColor(selectedBooking.booking_status)}>
                    {selectedBooking.booking_status}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Payment Status</h3>
                  <p>
                    {selectedBooking.payment_status}
                  </p>
                </div>
              </div>
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
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to cancel this booking?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              No, Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;