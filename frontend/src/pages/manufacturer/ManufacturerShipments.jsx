import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Ship, Plane, ChevronDown, ChevronUp, CheckCircle, XCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SHIPMENTS = [
  {
    id: 'SHP-001', buyer: 'Zara', po: 'PO-AW27-4812', mode: 'Sea', container: 'MSCU1234567',
    origin: 'Chennai', dest: 'Barcelona', etd: '01 Mar 2027', eta: '20 Mar 2027', status: 'Delivered',
    cartons: 180, cbm: '42.5 CBM', weight: '8,640 kg',
    packing: [
      { style: 'ZR-AW27-JK001', qty: 800, cartons: 80 },
      { style: 'ZR-AW27-SW002', qty: 600, cartons: 60 },
      { style: 'ZR-AW27-TR003', qty: 400, cartons: 40 },
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
      { style: 'MS-AW27-BL004', qty: 800, cartons: 80 },
      { style: 'MS-AW27-JN005', qty: 900, cartons: 100 },
    ],
    docs: { 'Packing List': false, 'Commercial Invoice': false, 'BL / AWB': false, 'Cert of Origin': false },
  },
];

const STATUS_COLORS = {
  Delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'In Transit': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Booking Confirmed': 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

const FILTER_TABS = ['All', 'Booking Confirmed', 'In Transit', 'Delivered', 'Pending'];

export default function ManufacturerShipments() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedShipment, setExpandedShipment] = useState(null);

  const filtered = activeFilter === 'All' ? SHIPMENTS : SHIPMENTS.filter(s => s.status === activeFilter);

  const total = SHIPMENTS.length;
  const inTransit = SHIPMENTS.filter(s => s.status === 'In Transit').length;
  const delivered = SHIPMENTS.filter(s => s.status === 'Delivered').length;
  const pending = SHIPMENTS.filter(s => s.status === 'Pending' || s.status === 'Booking Confirmed').length;

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
            { label: 'Total Shipments', value: total, color: 'text-teal-400' },
            { label: 'In Transit', value: inTransit, color: 'text-blue-400' },
            { label: 'Delivered', value: delivered, color: 'text-emerald-400' },
            { label: 'Pending / Confirmed', value: pending, color: 'text-amber-400' },
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
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeFilter === tab
                  ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Shipment Cards */}
        <div className="space-y-4">
          {filtered.map(shp => (
            <Card key={shp.id} className="bg-slate-800 border-slate-700 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpandedShipment(expandedShipment === shp.id ? null : shp.id)}
              >
                <div className="flex flex-wrap items-start gap-4">
                  {/* Mode Icon */}
                  <div className="w-11 h-11 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {shp.mode === 'Sea' ? <Ship className="w-5 h-5 text-blue-400" /> : <Plane className="w-5 h-5 text-purple-400" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-semibold text-teal-400">{shp.id}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[shp.status]}`}>{shp.status}</Badge>
                      <span className="text-slate-500 text-xs">{shp.mode}</span>
                    </div>
                    <p className="text-white font-medium">{shp.buyer} &mdash; <span className="text-slate-400 text-sm">{shp.po}</span></p>
                    <p className="text-slate-400 text-sm">{shp.origin} <span className="text-slate-600">→</span> {shp.dest}</p>
                  </div>

                  <div className="flex flex-wrap gap-5 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Container / AWB</p>
                      <p className={`font-mono text-xs ${shp.container === 'Pending' ? 'text-amber-400' : 'text-slate-200'}`}>{shp.container}</p>
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

                  {expandedShipment === shp.id ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </div>
              </div>

              {expandedShipment === shp.id && (
                <div className="border-t border-slate-700 bg-slate-900/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Packing List */}
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-1"><Package className="w-3 h-3" /> Packing List Summary</p>
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
                            : <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Missing</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
