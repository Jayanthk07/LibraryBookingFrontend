import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';

interface MyBookingResponse {
  bookingId: number;
  zoneId: number;
  seatId: number;
  startTime: string;
  endTime: string;
  status: string;
  fare: number;
}

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<MyBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking? If you have already paid, your refund will be processed.')) {
      return;
    }
    
    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      await fetchBookings(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading bookings...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <BookOpen className="w-16 h-16 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Bookings Yet</h2>
        <p className="text-gray-500 max-w-md">
          You haven't made any seat bookings yet. Head over to the Dashboard to book your first study session!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => {
          const startDate = new Date(booking.startTime);
          const endDate = new Date(booking.endTime);
          
          return (
            <div key={booking.bookingId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Seat {booking.seatId}</h3>
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      Zone {booking.zoneId}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'HELD' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {startDate.toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex items-center text-sm font-semibold text-gray-800 mt-2">
                    ₹{booking.fare}
                  </div>
                </div>
                
                {(booking.status === 'CONFIRMED' || booking.status === 'HELD') && startDate > new Date() && (
                  <button
                    onClick={() => handleCancel(booking.bookingId)}
                    disabled={cancellingId === booking.bookingId}
                    className="w-full mt-4 py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {cancellingId === booking.bookingId ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
