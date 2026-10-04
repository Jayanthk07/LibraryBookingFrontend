import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fallback amount if not passed in state
  const amount = location.state?.amount || 20.00;

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Create order on backend
      const response = await api.post('/payments/create-order', {
        bookingId: Number(bookingId)
      });
      const orderData = response.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // Paise
        currency: 'INR',
        name: 'LibSpace',
        description: 'Library Seat Booking',
        order_id: orderData.razorpayOrderId,
        handler: function (response: any) {
          console.log('Payment successful:', response);
          setSuccess(true);
          setTimeout(() => navigate('/my-bookings'), 3000);
        },
        prefill: {
          name: 'Library User',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: { color: '#2563EB' } // Tailwind Blue-600
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500">Your seat is confirmed. Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete your Booking</h2>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Booking ID</span>
          <span className="font-bold">#{bookingId}</span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-900 font-semibold">Total Amount</span>
          <span className="font-bold text-blue-700">₹{amount}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </div>
  );
};
