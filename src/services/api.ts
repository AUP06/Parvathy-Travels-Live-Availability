/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bus, Booking, ParsedBookingData } from '../types';
import { DEFAULT_BUSES, DEFAULT_BOOKINGS } from '../data';

/**
 * Parses and cleans API responses to ensure absolute privacy.
 * Under no circumstances will customer names, phone numbers, or notes be retained.
 */
export function sanitizeAndParseResponse(data: any): ParsedBookingData {
  if (!data || typeof data !== 'object') {
    return { buses: DEFAULT_BUSES, bookings: DEFAULT_BOOKINGS };
  }

  let buses: Bus[] = [];
  let bookings: Booking[] = [];

  // Parse Buses
  if (Array.isArray(data.buses)) {
    buses = data.buses.map((b: any, index: number) => {
      // Robust mapping with fallbacks
      const id = String(b.id || b.busId || b.registrationNumber || `BUS-${index + 1}`).trim();
      const name = String(b.name || b.busName || b.model || `Bus ${id}`).trim();
      const registrationNumber = String(b.registrationNumber || b.regNo || b.plateNumber || b.id || '').trim();
      
      // Determine Type
      let type: 'Sleeper' | 'Seater' | 'Semi-Sleeper' = 'Seater';
      const typeStr = String(b.type || '').toLowerCase();
      if (typeStr.includes('sleeper') && !typeStr.includes('semi')) {
        type = 'Sleeper';
      } else if (typeStr.includes('semi')) {
        type = 'Semi-Sleeper';
      }

      // Check AC status
      let isAc = false;
      if ('isAc' in b) isAc = Boolean(b.isAc);
      else if ('ac' in b) {
        const acStr = String(b.ac).toLowerCase();
        isAc = acStr === 'true' || acStr === 'yes' || acStr === 'y' || acStr === 'ac';
      } else {
        isAc = name.toLowerCase().includes('ac') || name.toLowerCase().includes('a/c');
      }

      // Capacity
      const capacity = Number(b.capacity || b.seats || (type === 'Sleeper' ? 30 : 40));

      // Amenities
      let amenities: string[] = [];
      if (Array.isArray(b.amenities)) {
        amenities = b.amenities.map(String);
      } else if (typeof b.amenities === 'string') {
        amenities = b.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        // Generate sensible defaults if none provided
        amenities = isAc ? ['Air Conditioning', 'Reading Lights'] : ['Reading Lights'];
        if (type === 'Sleeper') amenities.push('Pillow', 'Premium Blanket');
        amenities.push('USB Charging');
      }

      return {
        id,
        name,
        registrationNumber,
        type,
        isAc,
        capacity,
        amenities
      };
    });
  }

  // Parse Bookings
  if (Array.isArray(data.bookings)) {
    bookings = data.bookings
      .map((b: any, index: number) => {
        const id = String(b.id || b.bookingId || `BKG-${index + 1}`).trim();
        const busId = String(b.busId || b.bus || b.registrationNumber || '').trim();
        
        // Normalize Dates (YYYY-MM-DD)
        const startDate = normalizeDate(b.startDate || b.fromDate || b.pickupDate || b.bookedFrom);
        const endDate = normalizeDate(b.endDate || b.toDate || b.returnDate || b.bookedTo);

        if (!busId || !startDate || !endDate) return null;

        // STRICT PRIVACY POLICY: 
        // We only retain id, busId, startDate, and endDate.
        // Absolutely NO customer names, contact info, notes, pricing, or payments are saved or propagated.
        return {
          id,
          busId,
          startDate,
          endDate,
          status: 'confirmed'
        };
      })
      .filter((b): b is Booking => b !== null);
  }

  // Fallback to default schema if sheets returned empty
  if (buses.length === 0) {
    buses = DEFAULT_BUSES;
  }

  // If we have custom bookings but no buses matching, ensure we keep the default buses
  if (buses.length > 0 && bookings.length > 0) {
    // Check if the bookings refer to default bus IDs or custom bus IDs
    const busIds = new Set(buses.map(b => b.id));
    const bookingBusIds = new Set(bookings.map(b => b.busId));
    
    // If bookings map to names, try to match or map
    bookings.forEach(bkg => {
      if (!busIds.has(bkg.busId)) {
        // Try finding a bus that matches registration number or name
        const found = buses.find(b => b.registrationNumber === bkg.busId || b.name === bkg.busId);
        if (found) {
          bkg.busId = found.id;
        } else {
          // Create a dynamic public bus profile so booking is displayable without breaking
          const newBusId = bkg.busId;
          buses.push({
            id: newBusId,
            name: `Bus (${newBusId})`,
            registrationNumber: newBusId,
            type: 'Seater',
            isAc: true,
            capacity: 36,
            amenities: ['Air Conditioning', 'USB Charging']
          });
          busIds.add(newBusId);
        }
      }
    });
  }

  return { buses, bookings };
}

/**
 * Normalizes input date format into YYYY-MM-DD
 */
export function normalizeDate(dateInput: any): string {
  if (!dateInput) return '';
  
  try {
    // Handle Google Sheets date format (serialized string or timestamp)
    let d: Date;
    
    if (typeof dateInput === 'string') {
      // Check if it's already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }
      
      // Try parsing typical formats like DD/MM/YYYY or MM/DD/YYYY
      if (dateInput.includes('/')) {
        const parts = dateInput.split('/');
        if (parts.length === 3) {
          // If first part is 4 digits, assume YYYY/MM/DD
          if (parts[0].length === 4) {
            d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          } else {
            // Assume DD/MM/YYYY (common in India)
            d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            // Check if valid, if not fallback to MM/DD/YYYY
            if (isNaN(d.getTime())) {
              d = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
            }
          }
        } else {
          d = new Date(dateInput);
        }
      } else {
        d = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      d = dateInput;
    } else {
      d = new Date(dateInput);
    }

    if (isNaN(d.getTime())) return '';

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return '';
  }
}

/**
 * Add days to a date string and return as YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Helper to check if two YYYY-MM-DD date ranges overlap
 */
export function isOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Check if a bus is available during the selected date range.
 * Returns overlapping booking if NOT available, otherwise null.
 */
export function getOverlappingBooking(
  busId: string,
  startDate: string,
  endDate: string,
  bookings: Booking[]
): Booking | null {
  if (!startDate || !endDate) return null;
  
  const busBookings = bookings.filter(b => b.busId === busId);
  for (const bkg of busBookings) {
    if (isOverlapping(startDate, endDate, bkg.startDate, bkg.endDate)) {
      return bkg;
    }
  }
  return null;
}

/**
 * Get the next date the bus will be available, starting from a baseline date.
 * Traversing consecutive bookings if any.
 */
export function getNextAvailableDate(busId: string, bookings: Booking[], baseDate: string): string {
  const busBookings = bookings
    .filter(b => b.busId === busId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  let currentDate = baseDate;
  let changed = true;
  
  // Keep moving forward as long as we find bookings covering our currentDate
  while (changed) {
    changed = false;
    for (const bkg of busBookings) {
      // If the currentDate falls within this booking, the next available date is the day after the booking ends
      if (currentDate >= bkg.startDate && currentDate <= bkg.endDate) {
        currentDate = addDays(bkg.endDate, 1);
        changed = true;
        break; // Start check again with the new date
      }
    }
  }
  
  return currentDate;
}

/**
 * Formats a YYYY-MM-DD date to a human readable format e.g. "July 15, 2026"
 */
export function formatHumanDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Fetch bus bookings from Google Apps Script Web App API
 */
export async function fetchLiveBookingData(apiUrl: string): Promise<ParsedBookingData> {
  if (!apiUrl) {
    throw new Error('No API URL configured');
  }

  // Clean the URL (remove trailing spaces, etc.)
  const url = apiUrl.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return sanitizeAndParseResponse(json);
  } catch (error: any) {
    console.error('Failed to fetch from Google Apps Script:', error);
    throw new Error(error.message || 'Network error while contacting Google Apps Script');
  }
}
