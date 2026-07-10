/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bus, Booking } from './types';

export const DEFAULT_BUSES: Bus[] = [
  {
    id: 'BUS-001',
    name: 'BharatBenz AC Sleeper (2+1)',
    registrationNumber: 'KL-07-CS-4567',
    type: 'Sleeper',
    isAc: true,
    capacity: 30,
    amenities: ['Air Conditioning', 'USB Charging Port', 'Reading Lights', 'Premium Blanket', 'Water Bottle', 'Pillow'],
  },
  {
    id: 'BUS-002',
    name: 'Volvo Multi-Axle B11R Seater',
    registrationNumber: 'KL-07-CU-9988',
    type: 'Seater',
    isAc: true,
    capacity: 44,
    amenities: ['Air Conditioning', 'Pushback Seats', 'USB Charging', 'Reading Lights', 'Emergency Exit', 'Luggage Space'],
  },
  {
    id: 'BUS-003',
    name: 'Scania Touring Semi-Sleeper',
    registrationNumber: 'KL-07-CW-1122',
    type: 'Semi-Sleeper',
    isAc: true,
    capacity: 36,
    amenities: ['Air Conditioning', 'Calf Support', 'USB Charging', 'Water Bottle', 'Reading Lights', 'Premium Sound System'],
  },
  {
    id: 'BUS-004',
    name: 'Leyland Non-AC Seater (3+2)',
    registrationNumber: 'KL-07-CK-5544',
    type: 'Seater',
    isAc: false,
    capacity: 49,
    amenities: ['Pushback Seats', 'Spacious Luggage Rack', 'High-Speed Cabin Fans', 'Emergency First Aid'],
  },
  {
    id: 'BUS-005',
    name: 'Eicher Comfort AC Seater',
    registrationNumber: 'KL-07-CX-8877',
    type: 'Seater',
    isAc: true,
    capacity: 32,
    amenities: ['Air Conditioning', 'USB Charging', 'Pushback Seats', 'Reading Lights', 'Compact & Fast'],
  }
];

// Today is 2026-07-09. Bookings are placed around this date to demonstrate functionality.
export const DEFAULT_BOOKINGS: Booking[] = [
  // Bus 1 (BharatBenz AC Sleeper): currently booked (July 8 to July 11)
  {
    id: 'BKG-101',
    busId: 'BUS-001',
    startDate: '2026-07-08',
    endDate: '2026-07-11',
    status: 'confirmed'
  },
  {
    id: 'BKG-102',
    busId: 'BUS-001',
    startDate: '2026-07-14',
    endDate: '2026-07-16',
    status: 'confirmed'
  },
  {
    id: 'BKG-103',
    busId: 'BUS-001',
    startDate: '2026-07-20',
    endDate: '2026-07-25',
    status: 'confirmed'
  },

  // Bus 2 (Volvo Multi-Axle): booked starting tomorrow (July 10 to July 12)
  {
    id: 'BKG-201',
    busId: 'BUS-002',
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    status: 'confirmed'
  },
  {
    id: 'BKG-202',
    busId: 'BUS-002',
    startDate: '2026-07-18',
    endDate: '2026-07-21',
    status: 'confirmed'
  },

  // Bus 3 (Scania Touring Semi-Sleeper): booked next week (July 15 to July 19)
  {
    id: 'BKG-301',
    busId: 'BUS-003',
    startDate: '2026-07-15',
    endDate: '2026-07-19',
    status: 'confirmed'
  },
  {
    id: 'BKG-302',
    busId: 'BUS-003',
    startDate: '2026-07-25',
    endDate: '2026-07-28',
    status: 'confirmed'
  },

  // Bus 4 (Leyland Non-AC Seater): booked past to today (July 5 to July 9)
  {
    id: 'BKG-401',
    busId: 'BUS-004',
    startDate: '2026-07-05',
    endDate: '2026-07-09',
    status: 'confirmed'
  },
  {
    id: 'BKG-402',
    busId: 'BUS-004',
    startDate: '2026-07-12',
    endDate: '2026-07-14',
    status: 'confirmed'
  },
  {
    id: 'BKG-403',
    busId: 'BUS-004',
    startDate: '2026-07-22',
    endDate: '2026-07-24',
    status: 'confirmed'
  },

  // Bus 5 (Eicher Comfort AC Seater): booked near end of month
  {
    id: 'BKG-501',
    busId: 'BUS-005',
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    status: 'confirmed'
  }
];
