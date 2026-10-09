import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';

interface Seat {
  id: number;
  seatNumber: string;
  zoneId: number;
  isActive: boolean;
}

export const ZoneViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [availableSeats, setAvailableSeats] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/zones/${id}/seats`).then(res => setSeats(res.data)).catch(console.error);
  }, [id]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);
      
      // ISO strings for backend
      const startISO = startDateTime.toISOString();
      const endISO = endDateTime.toISOString();

      const response = await api.get('/bookings/availability', {
        params: {
          zoneId: id,
          startTime: startISO,
          endTime: endISO
        }
      });

      setAvailableSeats(response.data.availableSeatIds);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSeat = async (seatId: number) => {
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      const response = await api.post('/bookings/hold', {
        zoneId: Number(id),
        seatId: seatId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });

      // Redirect to payment flow with the bookingId
      navigate(`/checkout/${response.data.bookingId}`, { state: { amount: response.data.fare } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to hold seat');
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      const response = await api.post('/waitlist/join', {
        zoneId: Number(id),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });

      // Redirect to payment flow with the waitlistId
      navigate(`/checkout/${response.data.waitlistId}`, { state: { amount: response.data.fare, isWaitlist: true } });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join waitlist');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Check Availability</h2>
          {availableSeats !== null && availableSeats.length === 0 && (
            <button 
              onClick={handleJoinWaitlist}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              Join Waitlist
            </button>
          )}
        </div>
        <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {error}</p>}
      </div>

      {availableSeats !== null && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Select a Seat</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {seats.map(seat => {
              const isAvailable = availableSeats.includes(seat.id);
              return (
                <button
                  key={seat.id}
                  onClick={() => isAvailable ? handleBookSeat(seat.id) : handleJoinWaitlist()}
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    isAvailable 
                      ? 'border-green-500 hover:bg-green-50 text-green-700 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                  }`}
                  title={isAvailable ? "Book Seat" : "Join Waitlist"}
                >
                  <span className="block text-2xl font-bold mb-1">{seat.seatNumber}</span>
                  <span className="text-xs uppercase font-semibold">{isAvailable ? 'Available' : 'Waitlist'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
