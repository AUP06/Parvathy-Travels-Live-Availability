/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bus as BusIcon, 
  Calendar, 
  RefreshCw, 
  Settings, 
  Database, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bus, Booking, SearchQuery, AppConfig } from './types';
import { fetchLiveBookingData, sanitizeAndParseResponse } from './services/api';
import SearchForm from './components/SearchForm';
import BusList from './components/BusList';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Load configuration from localStorage
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedUrl = localStorage.getItem('pt_apps_script_url');
    // Default to the live production Google Sheets Apps Script URL provided by the user
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbxWB2qFkteAK5EOgjJXcBU8b2RVXQ8uZ97SGfKYh-2SFYq-qpb3zFiYW29Rw79kGKFd/exec';
    
    const savedInterval = localStorage.getItem('pt_refresh_interval');

    return {
      appsScriptUrl: (savedUrl !== null && savedUrl.trim() !== '') ? savedUrl : defaultUrl,
      refreshInterval: savedInterval ? Number(savedInterval) : 30 // Default 30 seconds
    };
  });

  const [buses, setBuses] = useState<Bus[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(config.refreshInterval);

  // Search Query State
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    startDate: '',
    endDate: '',
    busType: 'All'
  });

  // Handler to set specific dates from visual clicks
  const handleSelectDates = (start: string, end: string) => {
    setSearchQuery(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
  };

  // Fetch Logic
  const fetchData = useCallback(async (targetUrl = config.appsScriptUrl) => {
    if (!targetUrl) {
      setBuses([]);
      setBookings([]);
      setLastUpdated(new Date());
      setError('Please configure your Google Sheets Apps Script Web App URL.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchLiveBookingData(targetUrl);
      setBuses(data.buses);
      setBookings(data.bookings);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch live availability.');
    } finally {
      setLoading(false);
    }
  }, [config.appsScriptUrl]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh countdown timer
  useEffect(() => {
    if (config.refreshInterval <= 0 || !config.appsScriptUrl) {
      return;
    }

    setCountdown(config.refreshInterval);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData();
          return config.refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.refreshInterval, config.appsScriptUrl, fetchData]);

  // Save Config and trigger reload
  const handleSaveConfig = (newConfig: AppConfig) => {
    localStorage.setItem('pt_apps_script_url', newConfig.appsScriptUrl);
    localStorage.setItem('pt_refresh_interval', String(newConfig.refreshInterval));
    
    setConfig(newConfig);
    setCountdown(newConfig.refreshInterval);
    
    // Trigger immediate fetch with new configuration
    fetchData(newConfig.appsScriptUrl);
  };

  // Testing the connection inside the modal
  const handleTestConnection = async (url: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await fetchLiveBookingData(url);
      if (data.buses.length > 0) {
        return {
          success: true,
          message: `Successfully connected! Loaded ${data.buses.length} buses and ${data.bookings.length} booking records.`
        };
      }
      return {
        success: true,
        message: 'Connected successfully, but no bus data was found in the spreadsheet.'
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Failed to connect. Make sure your Web App is deployed as "Anyone" has access.'
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] text-slate-800 flex flex-col font-sans transition-colors duration-300" id="app-root">
      
      {/* 1. Header / Navigation Row */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-150 px-3 py-2 md:px-6 shadow-[0_1px_10px_-3px_rgba(0,0,0,0.02)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8.5 h-8.5 bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/10 ring-2 ring-white">
              <BusIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-xs md:text-sm tracking-tight font-display flex items-center gap-1">
                Parvathy Travels
                <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-blue-50 text-[8px] font-bold text-blue-700 border border-blue-100 uppercase tracking-wider">Public</span>
              </h1>
              <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.2">
                LIVE AVAILABILITY PORTAL
              </p>
            </div>
          </div>
 
          {/* Connection Status & Control Center */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Sync status indicators */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100/80 uppercase tracking-wider shadow-2xs shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Live
              </span>

              {lastUpdated && (
                <span className="text-slate-500 font-mono text-[9px] bg-slate-50/60 border border-slate-200/60 px-2 py-1 rounded-full shadow-2xs font-extrabold uppercase tracking-wide whitespace-nowrap shrink-0">
                  <span className="hidden sm:inline">Refreshed: </span>{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>

            {/* Quick Manual Refresh Button */}
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="px-2.5 py-1 text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50/50 border border-slate-200 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-1 text-[11px] font-bold shadow-xs hover:border-blue-200 cursor-pointer shrink-0"
              title="Refresh availability now"
              id="sync-now-header-btn"
            >
              <RefreshCw className={`w-3 h-3 text-slate-400 group-hover:text-blue-600 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>

          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-8">
        
        {/* Welcome / Active Date Bar */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-2xl p-8 md:p-10 shadow-lg shadow-blue-900/10 border border-indigo-950/20">
          {/* Subtle grid accent background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md text-blue-100 uppercase tracking-widest border border-white/10">
                ⭐ Premium Fleet Service
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">Check Bus Availability Instantly</h2>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-2xl font-light">
                Welcome to the official public schedule portal for <strong className="text-white font-semibold">Parvathy Travels</strong>. This tool shows real-time booking availability fetched directly from our staff system. Check your dates, plan your trip, and reach out to our team instantly to secure your seats.
              </p>
            </div>
            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-right min-w-[170px] flex md:flex-col items-center md:items-end justify-between shadow-inner">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Today's Date</span>
              <span className="font-bold text-white text-lg tracking-tight font-display mt-1">July 9, 2026</span>
            </div>
          </div>
        </div>

        {/* 3. Search Widget Section */}
        <SearchForm 
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClearDates={() => setSearchQuery({ startDate: '', endDate: '', busType: 'All' })}
        />

        {/* 4. Fleet Availability and Calendar */}
        {loading && buses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.02)] min-h-[300px]">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin stroke-1.5" />
            <h4 className="font-bold text-slate-800 text-lg font-display">Fetching live fleet availability...</h4>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Connecting safely to the Parvathy Travels staff database via Google Apps Script. This will refresh momentarily.
            </p>
          </div>
        ) : error && buses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-red-100 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-[0_12px_40px_rgba(239,68,68,0.02)] min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg font-display">Database Connection Error</h4>
            <p className="text-slate-500 text-xs max-w-md leading-relaxed">
              {error}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => fetchData()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            </div>
          </div>
        ) : buses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.02)] min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
              <Database className="w-6 h-6 stroke-1.5" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg font-display">No Buses Found in Google Sheet</h4>
            <p className="text-slate-450 text-xs max-w-md leading-relaxed">
              The spreadsheet was connected successfully, but no active buses were found on the <strong>Buses</strong> sheet tab. Make sure your sheet has a "Buses" sheet tab and some bus inventory listed.
            </p>
          </div>
        ) : (
          <>
            {/* 4. Main Availability Fleet view */}
            <BusList 
              buses={buses}
              bookings={bookings}
              searchQuery={searchQuery}
              onSelectDates={handleSelectDates}
            />

            {/* 5. Complete Monthly Calendar Schedule View */}
            <AvailabilityCalendar 
              buses={buses}
              bookings={bookings}
            />
          </>
        )}

      </main>

      {/* 6. Static Human Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 md:px-8 mt-12 text-slate-500 text-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="space-y-1.5 max-w-md">
              <p className="font-bold text-slate-900 font-display">Parvathy Travels Customer Portal</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                This is a secure, read-only public checker. Staff continues to manage scheduling safely in the administrative panel.
              </p>
            </div>
            <a 
              href="https://goo.gl/maps/PrXkFhunqqyj76518?g_st=aw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200/80 transition-all duration-200 shadow-2xs hover:shadow-xs hover:border-slate-300 cursor-pointer shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Office Location (Google Maps)</span>
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <span>Read-Only Access</span>
            <span className="text-slate-200">|</span>
            <span>No personal customer data is stored or transmitted.</span>
          </div>
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onTestConnection={handleTestConnection}
      />

    </div>
  );
}
