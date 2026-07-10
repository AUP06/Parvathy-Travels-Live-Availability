/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Bus {
  id: string;
  name: string;
  registrationNumber: string;
  type?: string; // Display seat type only if it comes from the Google Sheet
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
  busType: 'All' | string;
}

export interface AppConfig {
  appsScriptUrl: string;
  refreshInterval: number; // in seconds
}
