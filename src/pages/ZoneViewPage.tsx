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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">Check Availability</h2>
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
          <h3 className="text-xl font-bold mb-6">Select a Seat</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {seats.map(seat => {
              const isAvailable = availableSeats.includes(seat.id);
              return (
                <button
                  key={seat.id}
                  disabled={!isAvailable}
                  onClick={() => handleBookSeat(seat.id)}
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    isAvailable 
                      ? 'border-green-500 hover:bg-green-50 text-green-700 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="block text-2xl font-bold mb-1">{seat.seatNumber}</span>
                  <span className="text-xs uppercase font-semibold">{isAvailable ? 'Available' : 'Booked'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
