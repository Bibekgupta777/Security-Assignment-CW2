import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const schedule = location.state?.schedule;

  const [seatLayout, setSeatLayout] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSeats, setAvailableSeats] = useState(0);
  const seatPrice = schedule?.fare || 550;
  const [bookingStatus, setBookingStatus] = useState("");

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        if (!schedule?._id) {
          console.error("No valid schedule provided.");
          return;
        }

        const response = await axios.get(`/api/seats/schedule/${schedule._id}`);
        const { data } = response.data;

        const rows = "ABCDEFGHIJ".split("");
        const cols = [1, 2, 3, 4];
        const layout = rows.flatMap((row) => cols.map((col) => `${row}${col}`));

        setSeatLayout(layout);
        setBookedSeats(data.booked_seats);
        setAvailableSeats(data.available_seats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching seats:", error.message);
        setLoading(false);
      }
    };

    fetchSeats();
  }, [schedule]);

  const isSeatBooked = (seat) => bookedSeats.includes(seat);

  const toggleSeatSelection = (seat) => {
    if (isSeatBooked(seat)) return;

    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to proceed.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to make a booking.");
        return;
      }

      const userId = localStorage.getItem("id");
      const payload = {
        user_id: userId,
        schedule_id: schedule._id,
        seats: selectedSeats.map((seat) => ({ seat_number: seat, passenger_name: "Passenger" })),
      };

      const response = await axios.post("/api/booking/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBookingStatus("Booking successful!");
        navigate("/booking-confirmation", { state: { booking: response.data.data } });
      } else {
        setBookingStatus("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during booking:", error.message);
      setBookingStatus("Booking failed. Please try again.");
    }
  };

  const totalPrice = selectedSeats.length * seatPrice;

  if (loading) return <div className="p-6 text-center text-sm font-medium">Loading seats...</div>;

  return (
    <div className="flex flex-col md:flex-row justify-center items-start px-8 py-12 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-2/3">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 text-center">Select Your Seat</h2>
        <p className="text-gray-700 mb-4 text-center">Available Seats: <span className="font-semibold text-gray-900">{availableSeats}</span></p>

        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-300 border"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 justify-items-center">
          {seatLayout.map((seat) => (
            <button
              key={seat}
              onClick={() => toggleSeatSelection(seat)}
              disabled={isSeatBooked(seat)}
              className={`w-12 h-12 rounded flex justify-center items-center text-sm font-medium transition-all shadow-md 
                ${isSeatBooked(seat) ? "bg-red-500 text-white cursor-not-allowed" : 
                selectedSeats.includes(seat) ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-400"}`}
            >
              {seat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-1/3 mt-6 md:mt-0 md:ml-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Your Selection</h2>
        {selectedSeats.length > 0 ? (
          <ul className="space-y-3">
            {selectedSeats.map((seat) => (
              <li key={seat} className="flex justify-between text-sm">
                <span>Seat {seat}</span>
                <span>Rs. {seatPrice}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm text-center">No seats selected</p>
        )}
        <div className="border-t pt-3 mt-3">
          <p className="flex justify-between text-sm font-semibold">
            <span>Total Price:</span>
            <span>Rs. {totalPrice}</span>
          </p>
        </div>
        <button
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
          className={`w-full py-2 mt-4 rounded text-white font-medium text-sm transition-all 
            ${selectedSeats.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {selectedSeats.length === 0 ? "Select seats to continue" : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
