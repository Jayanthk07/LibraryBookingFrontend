export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

export interface Zone {
  id: number;
  zoneName: string;
  totalSeats: number;
  hourlyRate: number;
}

export interface Seat {
  id: number;
  zoneId: number;
  isFunctional: boolean;
}

export interface Booking {
  id: number;
  userId: number;
  zoneId: number;
  seatId: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
  bookingSource: 'DIRECT' | 'WAITLIST';
  fareSnapshot: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
