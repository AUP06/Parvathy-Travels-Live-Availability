/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  HelpCircle, 
  Terminal, 
  ShieldCheck, 
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onTestConnection: (url: string) => Promise<{ success: boolean; message: string }>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection
}: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState(config.appsScriptUrl);
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    onSaveConfig({
      appsScriptUrl: apiUrl.trim(),
      refreshInterval
    });
    onClose();
  };

  const handleTest = async () => {
    if (!apiUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid URL first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(apiUrl.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const appsScriptCode = `function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Fetch Buses
  var busSheet = ss.getSheetByName("Buses");
  var buses = [];
  if (busSheet) {
    var data = busSheet.getDataRange().getValues();
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var bus = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j].toString().trim();
        if (key.match(/id/i)) bus.id = row[j].toString();
        else if (key.match(/name/i)) bus.name = row[j].toString();
        else if (key.match(/reg|plate|number/i)) bus.registrationNumber = row[j].toString();
        else if (key.match(/type/i)) bus.type = row[j].toString(); 
        else if (key.match(/ac/i)) bus.isAc = (row[j].toString().toLowerCase() === 'true' || row[j].toString().toLowerCase() === 'yes' || !!row[j]);
        else if (key.match(/capacity/i)) bus.capacity = Number(row[j]);
        else if (key.match(/amenities/i)) bus.amenities = row[j].toString().split(',').map(function(s){ return s.trim(); });
      }
      if (bus.id) buses.push(bus);
    }
  }
  
  // 2. Fetch Bookings (STRICT PRIVACY POLICY: Filters out customer details)
  var bookingSheet = ss.getSheetByName("Bookings");
  var bookings = [];
  if (bookingSheet) {
    var data = bookingSheet.getDataRange().getValues();
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var booking = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j].toString().trim();
        if (key.match(/id/i) && !key.match(/bus/i)) booking.id = row[j].toString();
        else if (key.match(/bus.*id/i) || key.match(/vehicle/i) || (key.match(/bus/i) && !key.match(/name/i))) booking.busId = row[j].toString();
        else if (key.match(/start|from|pickup|booked.*from/i)) {
          var val = row[j];
          booking.startDate = val instanceof Date ? Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd") : val.toString();
        }
        else if (key.match(/end|to|return|booked.*to/i)) {
          var val = row[j];
          booking.endDate = val instanceof Date ? Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd") : val.toString();
        }
      }
      
      // Only include booking if valid busId and date range
      if (booking.busId && booking.startDate && booking.endDate) {
        bookings.push({
          id: booking.id || ("BKG-" + i),
          busId: booking.busId,
          startDate: booking.startDate,
          endDate: booking.endDate
        });
      }
    }
  }
  
  var result = { buses: buses, bookings: bookings };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col transition-colors duration-300"
            id="settings-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-lg font-display">Google Sheets Sync Setup</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                id="close-settings-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Privacy Guarantee Box */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider">Security & Privacy First Policy</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    This portal is strictly <strong>read-only</strong>. To guarantee privacy, customer identifiers (names, phone numbers, profits, advances, notes) are completely stripped out at the source before being fetched. Only bus registration and booking timelines are displayed.
                  </p>
                </div>
              </div>

              {/* Connection Settings */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-950 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-400" />
                  API Endpoint Configuration
                </h4>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Google Apps Script Web App URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-0 focus:border-blue-600 bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
                      id="api-url-input"
                    />
                    <button
                      type="button"
                      onClick={handleTest}
                      disabled={testing}
                      className="px-4 py-2 text-sm font-semibold text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                      id="test-connection-btn"
                    >
                      {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      Test
                    </button>
                  </div>
                </div>

                {/* Test Connection Results */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg flex items-start gap-2.5 text-xs border ${
                      testResult.success 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{testResult.success ? 'Success' : 'Connection Failed'}</p>
                      <p className="mt-0.5 text-slate-600 leading-relaxed">{testResult.message}</p>
                    </div>
                  </motion.div>
                )}

                {/* Auto Refresh Configuration */}
                <div className="pt-2">
                  <div className="space-y-2 max-w-md">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Auto-Refresh Rate
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-0 focus:border-blue-600 font-medium"
                    >
                      <option value={0}>Manual Sync Only</option>
                      <option value={30}>Every 30 seconds</option>
                      <option value={60}>Every 60 seconds</option>
                      <option value={120}>Every 2 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Instructions Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Setup Instructions
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm font-display">Step 1: Prep your Spreadsheet</h4>
                  <p>
                    Ensure your Google Sheet has two tabs named <strong>Buses</strong> and <strong>Bookings</strong>.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <p className="font-medium text-slate-800">📊 Buses Tab Columns:</p>
                    <p className="font-mono text-[10px] text-blue-600 font-bold">id, name, registrationNumber, type, isAc, capacity, amenities</p>
                    <p className="font-medium text-slate-800 mt-2">📅 Bookings Tab Columns:</p>
                    <p className="font-mono text-[10px] text-blue-600 font-bold">id, busId, startDate, endDate</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm font-display">Step 2: Add Apps Script</h4>
                  <p>
                    In your Google Sheet, click on <strong>Extensions &gt; Apps Script</strong>. Delete any code in the editor and paste the following script:
                  </p>
                  
                  {/* Code Block Container */}
                  <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-900">
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-800 text-slate-300 border-b border-slate-700">
                      <span className="font-mono text-[10px] flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-emerald-400" />
                        Code.gs
                      </span>
                      <button
                        onClick={copyCode}
                        className="p-1 text-[10px] rounded hover:bg-slate-700 flex items-center gap-1 hover:text-white transition-colors"
                        id="copy-script-btn"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[10px] font-mono text-slate-200 max-h-48 text-left leading-normal">
                      <code>{appsScriptCode}</code>
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm font-display">Step 3: Deploy as Web App</h4>
                  <p>
                    1. Click <strong>Deploy &gt; New deployment</strong> on the top right.<br />
                    2. Select type <strong>Web app</strong>.<br />
                    3. Set <i>Execute as:</i> <strong>Me</strong> (your email).<br />
                    4. Set <i>Who has access:</i> <strong>Anyone</strong> (this allows the portal to read-only timelines without needing customer logins).<br />
                    5. Click <strong>Deploy</strong>, authorize the permissions, and copy the **Web app URL**.<br />
                    6. Paste it into the input field above and click <strong>Save Settings</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-medium">
                Parvathy Travels • Read-Only Client
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  id="cancel-settings-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
                  id="save-settings-btn"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
