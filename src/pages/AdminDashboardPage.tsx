import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Calendar, Clock, MapPin, CheckCircle, IndianRupee } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

interface AdminBookingResponse {
  bookingId: number;
  userId: number;
  zoneId: number;
  seatId: number;
  startTime: string;
  endTime: string;
  status: string;
  fare: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const response = await api.get('/admin/bookings');
        setBookings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch bookings. You may not have Admin privileges.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'ADMIN') {
      fetchAllBookings();
    } else {
      setLoading(false);
      setError('Access Denied. You must be an administrator to view this page.');
    }
  }, [user]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading admin data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.fare || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-4 rounded-full mr-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-100 p-4 rounded-full mr-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Confirmed Seats</p>
            <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-indigo-100 p-4 rounded-full mr-4">
            <IndianRupee className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">All System Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">User ID</th>
                <th className="p-4 font-semibold">Zone / Seat</th>
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Fare</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const startDate = new Date(booking.startTime);
                const endDate = new Date(booking.endTime);
                return (
                  <tr key={booking.bookingId} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-sm font-medium text-gray-900">#{booking.bookingId}</td>
                    <td className="p-4 text-sm text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      User {booking.userId}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      Z{booking.zoneId} / S{booking.seatId}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{startDate.toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-800">
                      ₹{booking.fare}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'HELD' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No bookings found in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
