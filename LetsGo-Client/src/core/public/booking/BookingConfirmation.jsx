import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Make sure to move this outside of any component
const stripePromise = loadStripe(
  "pk_test_"
);

// Payment Form Component
const PaymentForm = ({ booking, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const intentResponse = await axios.post(
        "/api/payment/create-payment-intent",
        {
          booking_id: booking._id,
          amount: booking.total_amount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { clientSecret } = intentResponse.data;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setPaymentError(result.error.message);
      } else {
        // Payment successful, confirm with backend
        const confirmResponse = await axios.post(
          "/api/payment/confirm-payment",
          {
            payment_intent_id: result.paymentIntent.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (confirmResponse.data.success) {
          onPaymentSuccess("Payment successful! Your booking is confirmed.");
        }
      }
    } catch (error) {
      setPaymentError(
        error.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full bg-green-500 text-white py-2 rounded-lg ${
          !stripe || isProcessing
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-green-600"
        }`}
      >
        {isProcessing ? "Processing..." : `Pay Rs. ${booking.total_amount}`}
      </button>

      {paymentError && (
        <div className="text-red-500 text-sm mt-2">{paymentError}</div>
      )}
    </form>
  );
};

// Wrapper component for Stripe Elements
const StripePaymentWrapper = ({ booking, onPaymentSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm booking={booking} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
};

// Main Booking Confirmation Component
const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!booking) {
      navigate("/");
    }
  }, [booking, navigate]);

  const handlePaymentSuccess = (message) => {
    setPaymentStatus(message);
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  if (!booking) {
    return <p>No booking details available.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Booking Confirmation</h1>

        {/* Booking Details Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
          <div className="space-y-2">
            <p>
              <strong>Booking ID:</strong> {booking._id}
            </p>
            <p>
              <strong>Seats:</strong>{" "}
              {booking.seats.map((seat) => seat.seat_number).join(", ")}
            </p>
            <p>
              <strong>Total Amount:</strong> Rs. {booking.total_amount}
            </p>
            <p>
              <strong>Status:</strong> {booking.booking_status}
            </p>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <p className="mb-4 text-gray-600">
            Please enter your card details below to complete the payment.
          </p>

          <StripePaymentWrapper
            booking={booking}
            onPaymentSuccess={handlePaymentSuccess}
          />

          {paymentStatus && (
            <div
              className={`mt-4 p-3 rounded ${
                paymentStatus.includes("successful")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {paymentStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
