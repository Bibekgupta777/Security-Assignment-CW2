import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

// Initialize Stripe
const stripePromise = loadStripe("pk_test");

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
      setPaymentError(error.response?.data?.message || "Payment failed. Please try again.");
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
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full bg-green-500 text-white py-2 rounded-lg ${
          (!stripe || isProcessing) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
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

export default PaymentForm;