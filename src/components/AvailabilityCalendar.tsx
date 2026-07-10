/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bus as BusIcon, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Bus, Booking } from '../types';
import { formatHumanDate, getNextAvailableDate } from '../services/api';

interface AvailabilityCalendarProps {
  buses: Bus[];
  bookings: Booking[];
}

export default function AvailabilityCalendar({
  buses,
  bookings
}: AvailabilityCalendarProps) {
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || '');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6); // July (0-indexed: 6 is July)

  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Helper to format day as YYYY-MM-DD
  const formatDateStr = (dayNum: number): string => {
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Check booking status for a specific day
  const getDayStatus = (dayNum: number) => {
    const dateStr = formatDateStr(dayNum);
    const busBookings = bookings.filter(b => b.busId === selectedBusId);
    
    // Check if this date falls within any booking range
    const activeBkg = busBookings.find(b => dateStr >= b.startDate && dateStr <= b.endDate);
    return activeBkg ? { isBooked: true, booking: activeBkg } : { isBooked: false, booking: null };
  };

  // Grid dates generation
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const todayStr = '2026-07-09';
  const nextAvailable = selectedBus ? getNextAvailableDate(selectedBus.id, bookings, todayStr) : '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 md:p-8 space-y-6 transition-colors duration-300" 
      id="availability-calendar-container"
    >
      {/* Selector & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 font-display">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Monthly Booking Schedule
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Select a specific bus to see its entire monthly calendar.
          </p>
        </div>

        {/* Bus Selector */}
        <div className="relative shrink-0">
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl focus:outline-hidden focus:ring-0 focus:border-blue-600 cursor-pointer shadow-2xs transition-all"
            id="calendar-bus-selector"
          >
            {buses.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.registrationNumber})
              </option>
            ))}
          </select>
          <BusIcon className="absolute left-3.5 top-3 w-4 h-4 text-blue-600" />
        </div>
      </div>

      {selectedBus ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Calendar Grid */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-lg font-display tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-2xs"
                  id="calendar-prev-month-btn"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-2xs"
                  id="calendar-next-month-btn"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid Header (Days of week) */}
            <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-[10px] text-slate-400 mb-1 uppercase tracking-widest font-mono">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Blank leading squares */}
              {blanksArray.map((_, i) => (
                <div key={`blank-${i}`} className="aspect-square bg-slate-50/40 rounded-xl border border-dashed border-slate-150"></div>
              ))}

              {/* Month dates */}
              {daysArray.map((day) => {
                const dateStr = formatDateStr(day);
                const isToday = dateStr === todayStr;
                const { isBooked } = getDayStatus(day);

                let dateBgClass = 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50/80';
                let indicatorClass = 'bg-emerald-500';
                
                if (isBooked) {
                  dateBgClass = 'bg-amber-50/60 text-amber-800 border-amber-100 hover:bg-amber-100/60';
                  indicatorClass = 'bg-amber-500';
                } else {
                  dateBgClass = 'bg-emerald-50/30 text-emerald-800 border-emerald-100/70 hover:bg-emerald-50/70';
                }

                return (
                  <div
                    key={`day-${day}`}
                    className={`aspect-square border rounded-xl p-2.5 flex flex-col justify-between transition-all text-xs font-bold relative group cursor-pointer ${dateBgClass} ${
                      isToday ? 'ring-2 ring-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'shadow-2xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={isToday ? 'text-blue-600 font-extrabold' : ''}>{day}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${indicatorClass}`} />
                    </div>

                    <span className="text-[8px] opacity-75 font-extrabold tracking-wider uppercase truncate">
                      {isBooked ? 'Booked' : 'Available'}
                    </span>

                    {/* Simple Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg pointer-events-none">
                      {formatHumanDate(dateStr)} • {isBooked ? 'Reserved' : 'Available for Booking'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-5 text-[11px] pt-3 font-bold text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-200 inline-block" />
                Available Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-200 inline-block" />
                Booked Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md ring-2 ring-blue-600 border-blue-600 inline-block" />
                Today (July 9, 2026)
              </span>
            </div>
          </div>

          {/* Right Column: Mini Details Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-150 space-y-5">
              <h4 className="font-extrabold text-slate-800 text-[11px] font-display uppercase tracking-wider">
                Status Summary
              </h4>

              {/* Specs */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-500">Bus Name:</span>
                  <span className="font-bold text-slate-800">{selectedBus.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-500">Reg Number:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBus.registrationNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-500">Fleet Class:</span>
                  <span className="font-bold text-slate-800">Premium Luxury Coach</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-500">AC Specification:</span>
                  <span className="font-bold text-slate-800">{selectedBus.isAc ? 'Climate Controlled AC' : 'Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="font-bold text-slate-800">{selectedBus.capacity} Seats</span>
                </div>
              </div>

              {/* Next Availability */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">
                  Next Available Date
                </span>
                <span className="font-extrabold text-blue-700 text-sm block">
                  {formatHumanDate(nextAvailable)}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal font-medium pt-1">
                  Dynamic live feed parsed directly from official schedule sheets.
                </p>
              </div>

              {/* Privacy Warning */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-relaxed flex gap-2 shadow-2xs">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="font-medium">
                  <strong>Privacy Safeguard:</strong> This public portal features fully anonymized schedule displays. Personal customer names or booking IDs are never exposed.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">Loading bus schedule...</p>
      )}
    </motion.div>
  );
}

