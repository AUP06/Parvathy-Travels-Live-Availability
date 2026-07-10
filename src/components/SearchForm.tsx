/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar as CalendarIcon, Filter, ArrowRight, X } from 'lucide-react';
import { SearchQuery } from '../types';

interface SearchFormProps {
  query: SearchQuery;
  onChangeQuery: (newQuery: SearchQuery) => void;
  onClearDates: () => void;
}

export default function SearchForm({
  query,
  onChangeQuery,
  onClearDates
}: SearchFormProps) {
  
  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    const updated = { ...query, [field]: val };
    
    // Ensure logical order: if start date is set after end date, clear or adjust end date
    if (field === 'startDate' && updated.endDate && val > updated.endDate) {
      updated.endDate = val;
    }
    
    onChangeQuery(updated);
  };

  const setPresetDates = (daysFromTodayStart: number, duration: number) => {
    const today = new Date('2026-07-09'); // Consistent today date
    
    const start = new Date(today);
    start.setDate(today.getDate() + daysFromTodayStart);
    
    const end = new Date(start);
    end.setDate(start.getDate() + duration);

    const format = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    onChangeQuery({
      ...query,
      startDate: format(start),
      endDate: format(end)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-6 md:p-8 relative overflow-hidden transition-colors duration-300" id="search-form-container">
      {/* Subtle branding accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-600 to-indigo-800" />
      
      <div className="space-y-6">
        <div>
          <h3 className="text-slate-900 font-bold text-base md:text-lg font-display flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
            Select Travel Timeline
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Choose your desired departure and return dates below to scan the active fleet schedule instantly.
          </p>
        </div>

        {/* Row 1: Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          {/* Pickup Date Selection */}
          <div className="space-y-2 md:col-span-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
              Departure Date
            </label>
            <div className="relative">
              <input
                type="date"
                min="2026-07-01" // Cap dates appropriately for July 2026
                value={query.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-4 py-3.5 text-sm font-semibold text-slate-700 bg-slate-50/60 hover:bg-slate-100/50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100/50 rounded-xl transition-all duration-200"
                id="pickup-date-input"
              />
            </div>
          </div>

          {/* Center Connection Arrow */}
          <div className="hidden md:flex justify-center items-center pb-5 md:col-span-1">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Return Date Selection */}
          <div className="space-y-2 md:col-span-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              Return Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                min={query.startDate || "2026-07-01"}
                value={query.endDate}
                disabled={!query.startDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-4 py-3.5 text-sm font-semibold text-slate-700 bg-slate-50/60 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-100/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                id="return-date-input"
              />
            </div>
          </div>

          {/* Clear Dates Button */}
          <div className="md:col-span-3 flex justify-end md:justify-start">
            {(query.startDate || query.endDate) && (
              <button
                type="button"
                onClick={onClearDates}
                className="w-full md:w-auto px-5 py-3.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98]"
                id="clear-dates-btn"
              >
                <X className="w-4 h-4" />
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Preset suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Quick Search:</span>
          <button
            type="button"
            onClick={() => setPresetDates(0, 1)} // Today + 1 day
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50/50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-all duration-200 shadow-2xs active:scale-95"
            id="preset-today-btn"
          >
            Today & Tomorrow
          </button>
          <button
            type="button"
            onClick={() => setPresetDates(1, 2)} // Tomorrow + 2 days
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50/50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-all duration-200 shadow-2xs active:scale-95"
            id="preset-weekend-btn"
          >
            This Weekend
          </button>
          <button
            type="button"
            onClick={() => setPresetDates(8, 2)} // Next weekend
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50/50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-all duration-200 shadow-2xs active:scale-95"
            id="preset-next-weekend-btn"
          >
            Next Weekend
          </button>
        </div>

      </div>
    </div>
  );
}
