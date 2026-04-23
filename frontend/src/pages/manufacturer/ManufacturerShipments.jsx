import React, { useState } from 'react';
import {
  Truck, Ship, Plane, ChevronDown, ChevronUp, CheckCircle, XCircle,
  Package, MapPin, Clock, Navigation, Anchor, Building2, X,
  AlertCircle, Radio, CalendarClock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ── Static Shipment Data ──────────────────────────────────────────────────────

const SHIPMENTS = [
  {
    id: 'SHP-001', buyer: 'Zara', po: 'PO-AW27-4812', mode: 'Sea', container: 'MSCU1234567',
    origin: 'Chennai', dest: 'Barcelona', etd: '01 Mar 2027', eta: '20 Mar 2027', status: 'Delivered',
    cartons: 180, cbm: '42.5 CBM', weight: '8,640 kg',
    packing: [
      { style: 'ZR-AW27-JK001', qty: 800,  cartons: 80 },
      { style: 'ZR-AW27-SW002', qty: 600,  cartons: 60 },
      { style: 'ZR-AW27-TR003', qty: 400,  cartons: 40 },
    ],
    docs: { 'Packing List': true, 'Commercial Invoice': true, 'BL / AWB': true, 'Cert of Origin': true },
  },
  {
    id: 'SHP-002', buyer: 'H&M', po: 'PO-AW27-3991', mode: 'Sea', container: 'MAEU8765432',
    origin: 'Chennai', dest: 'Hamburg', etd: '15 Apr 2027', eta: '05 May 2027', status: 'In Transit',
    cartons: 140, cbm: '34.2 CBM', weight: '6,720 kg',
    packing: [
      { style: 'HM-AW27-PK001', qty: 800, cartons: 80 },
      { style: 'HM-AW27-CN002', qty: 600, cartons: 60 },
    ],
    docs: { 'Packing List': true, 'Commercial Invoice': true, 'BL / AWB': true, 'Cert of Origin': false },
  },
  {
    id: 'SHP-003', buyer: 'M&S', po: 'PO-AW27-5100', mode: 'Sea', container: 'COSU2345678',
    origin: 'Chennai', dest: 'Felixstowe', etd: '10 May 2027', eta: '01 Jun 2027', status: 'Booking Confirmed',
    cartons: 220, cbm: '55.0 CBM', weight: '10,560 kg',
    packing: [
      { style: 'MS-AW27-CT001', qty: 600, cartons: 60 },
      { style: 'MS-AW27-SW002', qty: 800, cartons: 90 },
      { style: 'MS-AW27-TR003', qty: 500, cartons: 70 },
    ],
    docs: { 'Packing List': true, 'Commercial Invoice': true, 'BL / AWB': false, 'Cert of Origin': false },
  },
  {
    id: 'SHP-004', buyer: 'Zara', po: 'PO-SS27-2201', mode: 'Air', container: 'LH4521',
    origin: 'Chennai', dest: 'Madrid', etd: '10 Feb 2027', eta: '11 Feb 2027', status: 'Delivered',
    cartons: 45, cbm: '6.8 CBM', weight: '1,080 kg',
    packing: [
      { style: 'ZR-SS27-TS001', qty: 800, cartons: 20 },
      { style: 'ZR-SS27-DR003', qty: 720, cartons: 25 },
    ],
    docs: { 'Packing List': true, 'Commercial Invoice': true, 'BL / AWB': true, 'Cert of Origin': true },
  },
  {
    id: 'SHP-005', buyer: 'H&M', po: 'PO-SS27-1890', mode: 'Sea', container: 'EGLV3456789',
    origin: 'Chennai', dest: 'Gothenburg', etd: '20 Feb 2027', eta: '12 Mar 2027', status: 'Delivered',
    cartons: 95, cbm: '22.8 CBM', weight: '4,560 kg',
    packing: [
      { style: 'HM-SS27-BK001', qty: 3000, cartons: 50 },
      { style: 'HM-SS27-PL002', qty: 2400, cartons: 45 },
    ],
    docs: { 'Packing List': true, 'Commercial Invoice': true, 'BL / AWB': true, 'Cert of Origin': true },
  },
  {
    id: 'SHP-006', buyer: 'M&S', po: 'PO-AW27-5100 (partial)', mode: 'Sea', container: 'Pending',
    origin: 'Chennai', dest: 'Felixstowe', etd: '01 Jun 2027', eta: '22 Jun 2027', status: 'Pending',
    cartons: 180, cbm: '45.0 CBM', weight: '8,640 kg',
    packing: [
      { style: 'MS-AW27-BL004', qty: 800,  cartons: 80 },
      { style: 'MS-AW27-JN005', qty: 900,  cartons: 100 },
    ],
    docs: { 'Packing List': false, 'Commercial Invoice': false, 'BL / AWB': false, 'Cert of Origin': false },
  },
];

// ── Tracking Seed Data ────────────────────────────────────────────────────────
// event.state: 'done' | 'current' | 'upcoming'

const TRACKING_DATA = {
  'SHP-001': {
    carrier: 'MSC Mediterranean Shipping',
    vessel: 'MSC GÜLSÜN',
    voyage: 'AX721W',
    currentLocation: 'Port of Barcelona, Spain',
    progress: 100,
    co2kg: 1240,
    route: ['Chennai Port', 'Colombo (Transit)', 'Suez Canal', 'Barcelona Port', 'Zara WH'],
    routeProgress: 5,
    events: [
      { date: '28 Feb 2027', time: '09:00', location: 'TCH Factory, Bangalore', event: 'Cargo Picked Up by Freight Agent', state: 'done' },
      { date: '01 Mar 2027', time: '14:30', location: 'Chennai ICD, India', event: 'Container Stuffed & Sealed', state: 'done' },
      { date: '01 Mar 2027', time: '20:00', location: 'Chennai Port, India', event: 'Vessel Loaded — ETD Confirmed', state: 'done' },
      { date: '02 Mar 2027', time: '06:00', location: 'Chennai Port, India', event: 'Vessel Departed (MSC GÜLSÜN, Voy AX721W)', state: 'done' },
      { date: '04 Mar 2027', time: '11:00', location: 'Colombo, Sri Lanka', event: 'Transshipment — Vessel Changed', state: 'done' },
      { date: '10 Mar 2027', time: '08:00', location: 'Arabian Sea', event: 'In Transit — On Schedule', state: 'done' },
      { date: '15 Mar 2027', time: '14:00', location: 'Suez Canal, Egypt', event: 'Canal Transit Completed', state: 'done' },
      { date: '19 Mar 2027', time: '07:00', location: 'Port of Barcelona, Spain', event: 'Arrived at Port of Discharge', state: 'done' },
      { date: '19 Mar 2027', time: '18:00', location: 'Port of Barcelona, Spain', event: 'Customs Cleared', state: 'done' },
      { date: '20 Mar 2027', time: '10:30', location: 'Zara Distribution Centre, Barcelona', event: 'Delivered to Consignee — POD Obtained', state: 'done' },
    ],
  },

  'SHP-002': {
    carrier: 'Maersk Line',
    vessel: 'MAERSK EDINBURGH',
    voyage: 'EX427E',
    currentLocation: 'North Sea — ETA Hamburg 05 May 2027',
    progress: 72,
    co2kg: 980,
    route: ['Chennai Port', 'Colombo (Transit)', 'Suez Canal', 'Rotterdam (Transit)', 'Hamburg Port'],
    routeProgress: 4,
    events: [
      { date: '13 Apr 2027', time: '10:00', location: 'TCH Factory, Bangalore',  event: 'Cargo Picked Up by Freight Agent', state: 'done'     },
      { date: '14 Apr 2027', time: '16:00', location: 'Chennai ICD, India',       event: 'Container Stuffed & Sealed',         state: 'done'     },
      { date: '15 Apr 2027', time: '06:00', location: 'Chennai Port, India',      event: 'Vessel Loaded — ETD Confirmed',      state: 'done'     },
      { date: '15 Apr 2027', time: '22:00', location: 'Chennai Port, India',      event: 'Vessel Departed (MAERSK EDINBURGH)', state: 'done'     },
      { date: '18 Apr 2027', time: '09:00', location: 'Colombo, Sri Lanka',       event: 'Transshipment Completed',            state: 'done'     },
      { date: '25 Apr 2027', time: '14:00', location: 'Red Sea',                  event: 'In Transit — On Schedule',           state: 'done'     },
      { date: '29 Apr 2027', time: '08:00', location: 'Suez Canal, Egypt',        event: 'Canal Transit Completed',            state: 'done'     },
      { date: '02 May 2027', time: '06:00', location: 'North Sea',                event: 'In Transit — Approaching Hamburg',   state: 'current'  },
      { date: '04 May 2027', time: '—',     location: 'Rotterdam, Netherlands',   event: 'Brief Transshipment Stop (ETA)',     state: 'upcoming' },
      { date: '05 May 2027', time: '—',     location: 'Port of Hamburg, Germany', event: 'Arrival at Port of Discharge (ETA)',state: 'upcoming' },
      { date: '05 May 2027', time: '—',     location: 'Hamburg Customs',          event: 'Customs Clearance (ETA)',            state: 'upcoming' },
      { date: '06 May 2027', time: '—',     location: 'H&M DC, Hamburg',          event: 'Final Delivery (ETA)',               state: 'upcoming' },
    ],
  },

  'SHP-003': {
    carrier: 'COSCO Shipping',
    vessel: 'TBD — Booking Confirmed',
    voyage: 'BC-MAY27',
    currentLocation: 'TCH Factory, Bangalore (Awaiting Dispatch)',
    progress: 12,
    co2kg: 1420,
    route: ['Chennai Port', 'Singapore (Transit)', 'Suez Canal', 'Felixstowe Port', 'M&S DC'],
    routeProgress: 1,
    events: [
      { date: '08 May 2027', time: '—',     location: 'TCH Factory, Bangalore',   event: 'Production Complete — Packing Underway', state: 'current'  },
      { date: '09 May 2027', time: '—',     location: 'Chennai ICD, India',        event: 'Container Stuffing (Planned)',           state: 'upcoming' },
      { date: '10 May 2027', time: '—',     location: 'Chennai Port, India',       event: 'Vessel Loading (ETD)',                   state: 'upcoming' },
      { date: '12 May 2027', time: '—',     location: 'Singapore',                 event: 'Transshipment (ETA)',                    state: 'upcoming' },
      { date: '19 May 2027', time: '—',     location: 'Indian Ocean',              event: 'In Transit (ETA)',                       state: 'upcoming' },
      { date: '24 May 2027', time: '—',     location: 'Suez Canal, Egypt',         event: 'Canal Transit (ETA)',                    state: 'upcoming' },
      { date: '01 Jun 2027', time: '—',     location: 'Felixstowe Port, UK',       event: 'Arrival at Destination (ETA)',           state: 'upcoming' },
      { date: '03 Jun 2027', time: '—',     location: 'M&S DC, Bradford',          event: 'Final Delivery (ETA)',                   state: 'upcoming' },
    ],
  },

  'SHP-004': {
    carrier: 'Lufthansa Cargo',
    vessel: 'LH4521 (Boeing 777F)',
    voyage: 'LH4521',
    currentLocation: 'Delivered — Zara DC, Madrid',
    progress: 100,
    co2kg: 4850,
    route: ['Chennai Airport', 'Frankfurt (Transit)', 'Madrid Airport', 'Zara DC'],
    routeProgress: 4,
    events: [
      { date: '10 Feb 2027', time: '04:00', location: 'TCH Factory, Bangalore',   event: 'AWB Issued — Cargo Handed to Carrier', state: 'done' },
      { date: '10 Feb 2027', time: '08:00', location: 'Chennai Airport, India',   event: 'Cargo Accepted at Airport',            state: 'done' },
      { date: '10 Feb 2027', time: '14:20', location: 'Chennai Airport, India',   event: 'Flight LH4521 Departed',               state: 'done' },
      { date: '10 Feb 2027', time: '21:30', location: 'Frankfurt Airport, Germany','event': 'Transit — Connecting Flight',       state: 'done' },
      { date: '11 Feb 2027', time: '02:10', location: 'Frankfurt Airport, Germany','event': 'Onward Flight Departed',            state: 'done' },
      { date: '11 Feb 2027', time: '05:40', location: 'Madrid Barajas Airport',   event: 'Arrived at Destination Airport',       state: 'done' },
      { date: '11 Feb 2027', time: '10:00', location: 'Madrid Customs',           event: 'Customs Cleared',                      state: 'done' },
      { date: '11 Feb 2027', time: '14:00', location: 'Zara DC, Madrid',          event: 'Delivered to Consignee — POD Obtained',state: 'done' },
    ],
  },

  'SHP-005': {
    carrier: 'Evergreen Marine',
    vessel: 'EVER GOODS',
    voyage: 'GT301W',
    currentLocation: 'Gothenburg Port — Delivered',
    progress: 100,
    co2kg: 820,
    route: ['Chennai Port', 'Colombo (Transit)', 'Suez Canal', 'Gothenburg Port', 'H&M DC'],
    routeProgress: 5,
    events: [
      { date: '18 Feb 2027', time: '09:00', location: 'TCH Factory, Bangalore',  event: 'Cargo Picked Up',                     state: 'done' },
      { date: '19 Feb 2027', time: '14:00', location: 'Chennai Port, India',     event: 'Container Loaded — Vessel EVER GOODS',state: 'done' },
      { date: '20 Feb 2027', time: '06:00', location: 'Chennai Port, India',     event: 'Vessel Departed',                     state: 'done' },
      { date: '22 Feb 2027', time: '10:00', location: 'Colombo, Sri Lanka',      event: 'Transshipment',                       state: 'done' },
      { date: '27 Feb 2027', time: '08:00', location: 'Arabian Sea',             event: 'In Transit — On Schedule',            state: 'done' },
      { date: '04 Mar 2027', time: '12:00', location: 'Suez Canal, Egypt',       event: 'Canal Transit',                       state: 'done' },
      { date: '09 Mar 2027', time: '16:00', location: 'North Sea',               event: 'In Transit — Approaching Gothenburg', state: 'done' },
      { date: '11 Mar 2027', time: '08:00', location: 'Gothenburg Port, Sweden', event: 'Arrived at Port',                     state: 'done' },
      { date: '12 Mar 2027', time: '11:00', location: 'Gothenburg Customs',      event: 'Customs Cleared',                     state: 'done' },
      { date: '12 Mar 2027', time: '16:30', location: 'H&M Distribution, Borås', event: 'Delivered — POD Signed',              state: 'done' },
    ],
  },

  'SHP-006': {
    carrier: 'TBD — Awaiting Booking',
    vessel: '—',
    voyage: '—',
    currentLocation: 'Production in Progress — TCH Factory',
    progress: 5,
    co2kg: null,
    route: ['Chennai Port', 'Singapore (Transit)', 'Suez Canal', 'Felixstowe Port', 'M&S DC'],
    routeProgress: 0,
    events: [
      { date: '28 May 2027', time: '—', location: 'TCH Factory, Bangalore', event: 'Production Complete (Planned)', state: 'upcoming' },
      { date: '30 May 2027', time: '—', location: 'Chennai ICD, India',     event: 'Container Stuffing (Planned)',  state: 'upcoming' },
      { date: '01 Jun 2027', time: '—', location: 'Chennai Port, India',    event: 'Vessel Departure (ETD)',        state: 'upcoming' },
      { date: '04 Jun 2027', time: '—', location: 'Singapore',              event: 'Transshipment (ETA)',           state: 'upcoming' },
      { date: '15 Jun 2027', time: '—', location: 'Suez Canal, Egypt',      event: 'Canal Transit (ETA)',           state: 'upcoming' },
      { date: '22 Jun 2027', time: '—', location: 'Felixstowe Port, UK',    event: 'Arrival (ETA)',                 state: 'upcoming' },
      { date: '24 Jun 2027', time: '—', location: 'M&S DC, Bradford',       event: 'Final Delivery (ETA)',          state: 'upcoming' },
    ],
  },
};

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Delivered:          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'In Transit':       'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Booking Confirmed':'bg-teal-500/20 text-teal-300 border-teal-500/40',
  Pending:            'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

const FILTER_TABS = ['All', 'Booking Confirmed', 'In Transit', 'Delivered', 'Pending'];

// ── Tracking Modal ────────────────────────────────────────────────────────────

function TrackingModal({ shp, onClose }) {
  const td = TRACKING_DATA[shp.id];
  if (!td) return null;

  const doneCount    = td.events.filter(e => e.state === 'done').length;
  const currentEvent = td.events.find(e => e.state === 'current');

  const progressColor =
    shp.status === 'Delivered'          ? 'bg-emerald-500' :
    shp.status === 'In Transit'         ? 'bg-blue-500'    :
    shp.status === 'Booking Confirmed'  ? 'bg-teal-500'    : 'bg-amber-500';

  const modeIcon = shp.mode === 'Air'
    ? <Plane className="w-4 h-4 text-purple-400" />
    : <Ship className="w-4 h-4 text-blue-400" />;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {modeIcon}
            <div>
              <h2 className="text-lg font-semibold text-white">
                Shipment Tracking — {shp.id}
              </h2>
              <p className="text-xs text-slate-400">{shp.buyer} · {shp.po} · {shp.origin} → {shp.dest}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carrier strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-slate-700 bg-slate-800/40 divide-x divide-slate-700">
          {[
            { icon: Building2,    label: 'Carrier',    val: td.carrier                     },
            { icon: Navigation,   label: shp.mode === 'Air' ? 'Flight / Aircraft' : 'Vessel / Voyage', val: `${td.vessel}${td.voyage !== '—' ? ` · ${td.voyage}` : ''}` },
            { icon: Package,      label: 'Container / AWB', val: shp.container             },
            { icon: CalendarClock,label: 'ETA',        val: shp.eta                        },
          ].map(item => (
            <div key={item.label} className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <item.icon className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium truncate">{item.val}</p>
            </div>
          ))}
        </div>

        {/* Progress bar + route */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1"><Anchor className="w-3 h-3"/>{td.route[0]}</span>
            <span className="flex items-center gap-1">{td.route[td.route.length - 1]}<MapPin className="w-3 h-3"/></span>
          </div>
          {/* Progress track */}
          <div className="relative h-2 rounded-full bg-slate-700 mb-2">
            <div className={`h-2 rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${td.progress}%` }} />
            {/* Waypoint dots */}
            {td.route.map((_, i) => {
              const pct = (i / (td.route.length - 1)) * 100;
              const reached = (td.routeProgress / (td.route.length - 1)) * 100 >= pct;
              return (
                <span key={i}
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                    reached
                      ? `${progressColor.replace('bg-', 'bg-').replace('-500', '-400')} border-slate-900`
                      : 'bg-slate-600 border-slate-900'
                  }`}
                  style={{ left: `calc(${pct}% - 6px)` }} />
              );
            })}
          </div>
          {/* Route labels */}
          <div className="flex justify-between">
            {td.route.map((stop, i) => {
              const pct = (i / (td.route.length - 1)) * 100;
              return (
                <span key={i} className="text-xs text-slate-500 text-center"
                  style={{ width: `${100 / td.route.length}%`, textAlign: i === 0 ? 'left' : i === td.route.length - 1 ? 'right' : 'center' }}>
                  {stop}
                </span>
              );
            })}
          </div>

          {/* Current location */}
          <div className={`mt-3 flex items-center gap-2 text-sm ${
            shp.status === 'In Transit' ? 'text-blue-300' :
            shp.status === 'Delivered'  ? 'text-emerald-300' : 'text-amber-300'
          }`}>
            {shp.status === 'In Transit' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
            )}
            <Radio className="w-3.5 h-3.5" />
            <span className="font-medium">{td.currentLocation}</span>
          </div>

          {/* CO2 */}
          {td.co2kg && (
            <p className="text-xs text-slate-500 mt-1.5">
              Estimated carbon footprint: <span className="text-slate-300">{td.co2kg.toLocaleString()} kg CO₂e</span>
            </p>
          )}
        </div>

        {/* Event timeline */}
        <div className="px-6 py-5 overflow-y-auto max-h-[55vh]">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Tracking History & Milestones</p>
          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-700" />

            <div className="space-y-0">
              {td.events.map((ev, i) => {
                const isDone    = ev.state === 'done';
                const isCurrent = ev.state === 'current';

                return (
                  <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 bg-slate-900 rounded-full" />
                      ) : isCurrent ? (
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                          <span className="relative flex h-5 w-5 rounded-full bg-blue-500 items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-white" />
                          </span>
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 rounded-full border-2 border-slate-600 bg-slate-800 items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        </span>
                      )}
                    </div>

                    {/* Event content */}
                    <div className={`flex-1 pb-1 ${isCurrent ? 'bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 -mt-0.5' : ''}`}>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${
                          isDone ? 'text-white' : isCurrent ? 'text-blue-200' : 'text-slate-500'
                        }`}>
                          {ev.event}
                        </span>
                        {isCurrent && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                          <MapPin className="w-3 h-3" />{ev.location}
                        </span>
                        <span className={`flex items-center gap-1 ${isDone ? 'text-slate-500' : 'text-slate-700'}`}>
                          <Clock className="w-3 h-3" />{ev.date}{ev.time !== '—' ? ` · ${ev.time}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer summary */}
        <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/40 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>{doneCount} of {td.events.length} milestones completed</span>
          <span>·</span>
          <span>ETD {shp.etd}</span>
          <span>·</span>
          <span>ETA {shp.eta}</span>
          <span>·</span>
          <span className={td.progress === 100 ? 'text-emerald-400' : 'text-slate-400'}>
            {td.progress}% journey complete
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ManufacturerShipments() {
  const [activeFilter,      setActiveFilter]      = useState('All');
  const [expandedShipment,  setExpandedShipment]  = useState(null);
  const [statusOverrides,   setStatusOverrides]   = useState({});
  const [trackingId,        setTrackingId]        = useState(null);

  const getStatus    = (id, seed) => statusOverrides[id] ?? seed;
  const bookShipment = (id)        => setStatusOverrides(prev => ({ ...prev, [id]: 'Booking Confirmed' }));

  const withStatus = SHIPMENTS.map(s => ({ ...s, status: getStatus(s.id, s.status) }));
  const filtered   = activeFilter === 'All' ? withStatus : withStatus.filter(s => s.status === activeFilter);

  const total     = SHIPMENTS.length;
  const inTransit = withStatus.filter(s => s.status === 'In Transit').length;
  const delivered = withStatus.filter(s => s.status === 'Delivered').length;
  const pending   = withStatus.filter(s => s.status === 'Pending' || s.status === 'Booking Confirmed').length;

  const activeTrackingShp = trackingId ? withStatus.find(s => s.id === trackingId) : null;

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Shipments</h1>
            <p className="text-slate-400 text-sm">TCH Garments Pvt Ltd — Bangalore, India</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Shipments',      value: total,     color: 'text-teal-400'    },
            { label: 'In Transit',           value: inTransit, color: 'text-blue-400'    },
            { label: 'Delivered',            value: delivered, color: 'text-emerald-400' },
            { label: 'Pending / Confirmed',  value: pending,   color: 'text-amber-400'   },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeFilter === tab
                  ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Shipment Cards */}
        <div className="space-y-4">
          {filtered.map(shp => (
            <Card key={shp.id} className="bg-slate-800 border-slate-700 overflow-hidden">
              {/* Card header (clickable to expand) */}
              <div
                className="p-5 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpandedShipment(expandedShipment === shp.id ? null : shp.id)}
              >
                <div className="flex flex-wrap items-start gap-4">
                  {/* Mode icon */}
                  <div className="w-11 h-11 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {shp.mode === 'Sea'
                      ? <Ship  className="w-5 h-5 text-blue-400"   />
                      : <Plane className="w-5 h-5 text-purple-400" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-semibold text-teal-400">{shp.id}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[shp.status]}`}>{shp.status}</Badge>
                      <span className="text-slate-500 text-xs">{shp.mode}</span>
                    </div>
                    <p className="text-white font-medium">
                      {shp.buyer} &mdash; <span className="text-slate-400 text-sm">{shp.po}</span>
                    </p>
                    <p className="text-slate-400 text-sm">
                      {shp.origin} <span className="text-slate-600">→</span> {shp.dest}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-5 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Container / AWB</p>
                      <p className={`font-mono text-xs ${shp.container === 'Pending' ? 'text-amber-400' : 'text-slate-200'}`}>
                        {shp.container}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">ETD</p>
                      <p className="text-slate-300 text-xs">{shp.etd}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">ETA</p>
                      <p className="text-slate-300 text-xs">{shp.eta}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Cartons</p>
                      <p className="text-white font-semibold">{shp.cartons}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">CBM / Weight</p>
                      <p className="text-slate-300 text-xs">{shp.cbm} / {shp.weight}</p>
                    </div>
                  </div>

                  {/* Track button */}
                  <button
                    onClick={e => { e.stopPropagation(); setTrackingId(shp.id); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium flex-shrink-0 transition-colors ${
                      shp.status === 'In Transit'
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                        : shp.status === 'Delivered'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}>
                    {shp.status === 'In Transit' ? (
                      <>
                        <span className="relative flex h-2 w-2 mr-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        Live Track
                      </>
                    ) : (
                      <><Navigation className="w-3.5 h-3.5" /> Track</>
                    )}
                  </button>

                  {expandedShipment === shp.id
                    ? <ChevronUp   className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </div>

                {/* Mini progress bar on card */}
                {TRACKING_DATA[shp.id] && (
                  <div className="mt-3 h-1 rounded-full bg-slate-700">
                    <div className={`h-1 rounded-full transition-all duration-700 ${
                      shp.status === 'Delivered'         ? 'bg-emerald-500' :
                      shp.status === 'In Transit'        ? 'bg-blue-500'    :
                      shp.status === 'Booking Confirmed' ? 'bg-teal-500'    : 'bg-amber-500'
                    }`} style={{ width: `${TRACKING_DATA[shp.id].progress}%` }} />
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {expandedShipment === shp.id && (
                <div className="border-t border-slate-700 bg-slate-900/50 p-5 space-y-4">
                  {shp.status === 'Pending' && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <p className="text-amber-300 text-sm">
                        Booking not yet confirmed. Schedule with freight forwarder to proceed.
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); bookShipment(shp.id); }}
                        className="ml-4 flex-shrink-0 px-4 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/50 text-teal-300 text-sm font-medium hover:bg-teal-600/30 transition-colors">
                        Book Shipment
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Packing List */}
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Packing List Summary
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left text-slate-500 py-1 font-medium">Style</th>
                            <th className="text-left text-slate-500 py-1 font-medium">Qty</th>
                            <th className="text-left text-slate-500 py-1 font-medium">Cartons</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shp.packing.map(row => (
                            <tr key={row.style} className="border-b border-slate-800">
                              <td className="py-1.5 font-mono text-teal-400 text-xs">{row.style}</td>
                              <td className="py-1.5 text-white">{row.qty.toLocaleString()}</td>
                              <td className="py-1.5 text-slate-300">{row.cartons}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Documents */}
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">Documents Attached</p>
                      <div className="space-y-2">
                        {Object.entries(shp.docs).map(([doc, attached]) => (
                          <div key={doc} className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">{doc}</span>
                            {attached
                              ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Attached</span>
                              : <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Missing</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick track preview */}
                  {TRACKING_DATA[shp.id] && (
                    <div className="mt-2 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-slate-400 text-xs uppercase tracking-wide">Latest Tracking Event</p>
                        <button onClick={e => { e.stopPropagation(); setTrackingId(shp.id); }}
                          className="text-xs text-teal-400 hover:text-teal-300 underline-offset-2 hover:underline">
                          View full timeline →
                        </button>
                      </div>
                      {(() => {
                        const td = TRACKING_DATA[shp.id];
                        const last = [...td.events].reverse().find(e => e.state === 'done' || e.state === 'current');
                        if (!last) return null;
                        return (
                          <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                            last.state === 'current'
                              ? 'bg-blue-500/10 border-blue-500/30'
                              : 'bg-slate-800 border-slate-700'
                          }`}>
                            {last.state === 'current'
                              ? <span className="relative flex h-3 w-3 mt-0.5 flex-shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                                </span>
                              : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                            <div>
                              <p className="text-sm text-white font-medium">{last.event}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {last.location} · {last.date}{last.time !== '—' ? ` · ${last.time}` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingId && activeTrackingShp && (
        <TrackingModal
          shp={activeTrackingShp}
          onClose={() => setTrackingId(null)}
        />
      )}
    </div>
  );
}
