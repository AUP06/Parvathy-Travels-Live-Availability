/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BusType = 'Sleeper' | 'Seater' | 'Semi-Sleeper';

export interface Bus {
  id: string;
  name: string;
  registrationNumber: string;
  type: BusType;
  isAc: boolean;
  capacity: number;
  amenities: string[];
  imageUrl?: string;
}

export interface Booking {
  id: string;
  busId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status?: string;
}

export interface ParsedBookingData {
  buses: Bus[];
  bookings: Booking[];
}

export interface SearchQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  busType: 'All' | BusType;
}

export interface AppConfig {
  appsScriptUrl: string;
  refreshInterval: number; // in seconds
  useMockFallback: boolean;
}
