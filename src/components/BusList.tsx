/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus as BusIcon, 
  Users, 
  CheckCircle2, 
  XCircle, 
  CalendarRange, 
  ArrowRight, 
  Snowflake, 
  Sparkles,
  Info,
  Phone,
  MessageCircle,
  X
} from 'lucide-react';
import { Bus, Booking, SearchQuery } from '../types';
import { 
  getOverlappingBooking, 
  getNextAvailableDate, 
  formatHumanDate, 
  addDays,
  isOverlapping
} from '../services/api';

interface BusListProps {
  buses: Bus[];
  bookings: Booking[];
  searchQuery: SearchQuery;
  onSelectDates: (start: string, end: string) => void;
}

export default function BusList({
  buses,
  bookings,
  searchQuery,
  onSelectDates
}: BusListProps) {

  const todayStr = '2026-07-09'; // Consistent baseline today
  const [enquiryBus, setEnquiryBus] = React.useState<Bus | null>(null);

  // Generate 14-day timeline list starting from today
  const timelineDates: string[] = [];
  for (let i = 0; i < 14; i++) {
    timelineDates.push(addDays(todayStr, i));
  }

  // Filter buses based on selected type
  const filteredBuses = buses.filter(bus => {
    if (searchQuery.busType === 'All') return true;
    return bus.type === searchQuery.busType;
  });

  return (
    <div className="space-y-6" id="bus-list-section">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">
            Our Fleet & Availability
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {searchQuery.startDate && searchQuery.endDate ? (
              <span>Showing status for <strong className="text-blue-600">{formatHumanDate(searchQuery.startDate)}</strong> to <strong className="text-blue-600">{formatHumanDate(searchQuery.endDate)}</strong></span>
            ) : (
              <span>Select dates above to check custom availability. Showing standard status starting today.</span>
            )}
          </p>
        </div>
        
        <span className="text-[11px] font-medium bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-100">
          {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'} listed
        </span>
      </div>

      {filteredBuses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200" id="no-buses-found">
          <BusIcon className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
          <h4 className="mt-4 font-semibold text-slate-800 text-sm">No buses match filter</h4>
          <p className="text-slate-450 text-xs mt-1">Try switching to 'All' category or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6" id="buses-grid">
          {filteredBuses.map((bus, busIndex) => {
            // Determine active query range
            const startCheck = searchQuery.startDate || todayStr;
            const endCheck = searchQuery.endDate || startCheck;
            
            const activeBookingOverlap = getOverlappingBooking(bus.id, startCheck, endCheck, bookings);
            const isCurrentlyBooked = !!activeBookingOverlap;
            
            // Calculate next available date starting from today or start of search
            const nextFreeDate = getNextAvailableDate(bus.id, bookings, startCheck);

            return (
              <motion.div
                key={bus.id}
                initial={{ opacity: 0, y: 35, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.015,
                  rotateX: 1.5,
                  rotateY: -0.5,
                  boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.12), 0 0 25px 4px rgba(37, 99, 235, 0.08)",
                  borderColor: "rgba(147, 197, 253, 0.8)"
                }}
                transition={{ duration: 0.45, delay: busIndex * 0.05, ease: "easeOut" }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 p-6 flex flex-col md:flex-row gap-6 items-stretch relative overflow-hidden"
                id={`bus-card-${bus.id.toLowerCase()}`}
              >
                {/* Modern Status Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                  isCurrentlyBooked ? 'bg-amber-400' : 'bg-blue-600'
                }`} />

                {/* Section 1: Bus Info & Branding */}
                <div className="flex-1 space-y-4 min-w-[280px] pl-2">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-blue-50/50 text-blue-700 border border-blue-100/50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          Luxury Fleet Coach
                        </span>
                        {bus.isAc && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-indigo-50/50 text-indigo-700 border border-indigo-100/50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            Climate Controlled A/C
                          </span>
                        )}
                      </div>

                      {/* Clean Minimalist Badges exactly as per request */}
                      {isCurrentlyBooked ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-150 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                          Booked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                          Available
                        </span>
                      )}
                    </div>

                    <h4 className="text-slate-900 font-bold text-xl mt-3.5 tracking-tight font-display flex items-center gap-2">
                      <BusIcon className="w-5 h-5 text-blue-600" />
                      {bus.name}
                    </h4>
                    
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200 mt-2 inline-block shadow-2xs">
                      {bus.registrationNumber}
                    </span>
                  </div>

                  {/* Capacity & Core Specs */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      {bus.capacity} Seats Available
                    </span>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bus.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-lg"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 2: Visual 14-Day Timeline */}
                <div className="flex-1 flex flex-col justify-between py-1 border-t md:border-t-0 md:border-x border-slate-100 md:px-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <CalendarRange className="w-4 h-4 text-slate-400" />
                        14-Day Availability Timeline
                      </span>
                      <span className="text-slate-500 font-mono">July 2026</span>
                    </div>

                    {/* Timeline row of capsules */}
                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-1">
                      {timelineDates.map((dateStr) => {
                        const dateObj = new Date(dateStr);
                        const dayNum = dateObj.getDate();
                        const isSelectedRange = searchQuery.startDate && searchQuery.endDate && 
                          dateStr >= searchQuery.startDate && dateStr <= searchQuery.endDate;

                        // Check if this particular date is booked
                        const dayBooking = bookings.find(b => b.busId === bus.id && dateStr >= b.startDate && dateStr <= b.endDate);
                        const isBookedOnDay = !!dayBooking;

                        let bgClass = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600';
                        if (isBookedOnDay) {
                          bgClass = 'bg-amber-50 hover:bg-amber-100/80 border-amber-100 text-amber-800';
                        } else {
                          bgClass = 'bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-100/70 text-emerald-850';
                        }

                        if (isSelectedRange && !isBookedOnDay) {
                          bgClass = 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-md shadow-blue-500/10';
                        }

                        return (
                          <div
                            key={dateStr}
                            title={`${formatHumanDate(dateStr)} - ${isBookedOnDay ? 'Booked' : 'Available'}`}
                            onClick={() => {
                              // Let customer quickly click to set dates
                              if (!isBookedOnDay) {
                                onSelectDates(dateStr, dateStr);
                              }
                            }}
                            className={`h-9 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all duration-200 active:scale-95 text-[10px] font-bold ${bgClass}`}
                          >
                            <span>{dayNum}</span>
                            <span className="text-[8px] opacity-70 font-medium">
                              {dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-200 inline-block"></span>
                          Available
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200 inline-block"></span>
                          Booked
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                        <Info className="w-3.5 h-3.5 text-slate-300" />
                        Click day to select
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Availability Summary & Booking Callout */}
                <div className="flex-1 min-w-[240px] flex flex-col justify-center bg-slate-50/30 hover:bg-slate-50/60 rounded-2xl border border-slate-150 p-4 transition-all duration-200">
                  {isCurrentlyBooked ? (
                    // BOOKED STATE
                    <div className="space-y-3" id={`booked-status-${bus.id}`}>
                      <div className="flex items-start gap-2.5">
                        <XCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Unavailable</p>
                          {searchQuery.startDate && searchQuery.endDate ? (
                            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-medium">
                              Reserved from{' '}
                              <strong className="text-slate-800 font-extrabold">
                                {formatHumanDate(activeBookingOverlap.startDate)}
                              </strong>{' '}
                              to{' '}
                              <strong className="text-slate-800 font-extrabold">
                                {formatHumanDate(activeBookingOverlap.endDate)}
                              </strong>.
                            </p>
                          ) : (
                            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-medium">
                              Currently reserved until{' '}
                              <strong className="text-slate-800 font-extrabold">
                                {formatHumanDate(activeBookingOverlap.endDate)}
                              </strong>.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Next Available Date */}
                      <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Next Available Date
                        </span>
                        <p className="text-xs text-blue-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          {formatHumanDate(nextFreeDate)}
                        </p>
                      </div>

                      {/* General Enquiry for Alternative dates/buses */}
                      <button
                        type="button"
                        onClick={() => setEnquiryBus(bus)}
                        className="w-full mt-1.5 py-2.5 px-4 text-xs font-bold text-slate-800 bg-transparent border border-slate-350 hover:border-slate-800 hover:text-slate-900 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        Enquire anyway
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
                  ) : (
                    // AVAILABLE STATE
                    <div className="space-y-3" id={`available-status-${bus.id}`}>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Ready for Booking</p>
                          {searchQuery.startDate && searchQuery.endDate ? (
                            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-medium">
                              This bus is completely free from{' '}
                              <strong className="text-slate-800 font-bold">
                                {formatHumanDate(searchQuery.startDate)}
                              </strong>{' '}
                              to{' '}
                              <strong className="text-slate-800 font-bold">
                                {formatHumanDate(searchQuery.endDate)}
                              </strong>.
                            </p>
                          ) : (
                            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-medium">
                              This bus is open for bookings starting today. Check custom dates to confirm.
                            </p>
                          )}
                        </div>
                      </div>
  
                      {/* Booking CTA (Read-Only Portal Reminder) */}
                      <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100/60 space-y-2.5 text-xs">
                        <p className="font-bold text-slate-800">Want to secure this coach?</p>
                        <p className="text-[10px] text-slate-400 leading-normal font-medium">
                          Reach our official desk line directly for immediate offline reservations.
                        </p>
                        <button 
                          type="button"
                          onClick={() => setEnquiryBus(bus)}
                          className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/10 active:scale-[0.98]"
                        >
                          Enquire / Book Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Contact Enquiry Popup Modal */}
      <AnimatePresence>
        {enquiryBus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" id="contact-popup-overlay">
            {/* Backdrop click close */}
            <div className="absolute inset-0" onClick={() => setEnquiryBus(null)}></div>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col z-10"
              id="contact-popup-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">Contact Booking Desk</h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mt-0.5">Parvathy Travels • Official</p>
                </div>
                <button
                  onClick={() => setEnquiryBus(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  id="close-contact-popup-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                
                {/* Selected Bus Info Badge */}
                <div className="p-4 bg-blue-50/50 border border-blue-100/70 rounded-xl text-xs space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Selected Vehicle</span>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-sm">{enquiryBus.name}</span>
                    <span className="font-mono bg-white px-2.5 py-0.5 rounded border border-blue-150 font-bold text-blue-700 text-[10px]">{enquiryBus.registrationNumber}</span>
                  </div>
                  {searchQuery.startDate && searchQuery.endDate && (
                    <div className="pt-2 border-t border-blue-100/50 text-[11px] text-slate-600 flex items-center gap-1.5 mt-1.5">
                      <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Requested:</span>
                      <span className="font-bold text-slate-800">{formatHumanDate(searchQuery.startDate)}</span>
                      <ArrowRight className="w-3 text-slate-400" />
                      <span className="font-bold text-slate-800">{formatHumanDate(searchQuery.endDate)}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-500 text-xs leading-relaxed text-center font-medium">
                  Choose an official desk operator below to initiate your enquiry. You can place a direct voice call or send a formatted WhatsApp block immediately.
                </p>

                {/* Contact Options List */}
                <div className="space-y-4">
                  {[
                    { display: '+91 99616 71212', raw: '+919961671212', clean: '919961671212' },
                    { display: '+91 75919 46712', raw: '+917591946712', clean: '917591946712' }
                  ].map((num, idx) => {
                    const textMessage = `Hello Parvathy Travels, I am inquiring about the availability of *${enquiryBus.name}* (${enquiryBus.registrationNumber})${searchQuery.startDate && searchQuery.endDate ? ` from ${formatHumanDate(searchQuery.startDate)} to ${formatHumanDate(searchQuery.endDate)}` : ''}. Please let me know the booking options. Thank you!`;
                    const waLink = `https://api.whatsapp.com/send?phone=${num.clean}&text=${encodeURIComponent(textMessage)}`;
                    const callLink = `tel:${num.raw}`;

                    return (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-350 transition-all duration-200 space-y-3.5 shadow-2xs hover:shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desk Operator {idx + 1}</span>
                          <span className="font-bold text-slate-900 text-sm font-mono tracking-tight">{num.display}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Call Button */}
                          <a
                            href={callLink}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm shadow-blue-500/10"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Voice Call
                          </a>

                          {/* WhatsApp Button */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-sm shadow-emerald-500/10"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">
                Parvathy Travels • Safe Journey Guaranteed
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
