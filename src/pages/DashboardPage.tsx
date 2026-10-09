import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users } from 'lucide-react';
import api from '../api/axiosConfig';

interface Zone {
  id: number;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  imageUrl: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    api.get('/zones').then(res => setZones(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LibSpace</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Select a zone below to check seat availability and book your study space.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/zone/${zone.id}`)}>
            <img src={zone.imageUrl} alt={zone.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ₹{zone.pricePerHour}/hr
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6">{zone.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{zone.capacity} Seats</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  <span>24/7</span>
                </div>
              </div>

              <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">
                Check Availability
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
