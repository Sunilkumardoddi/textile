import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Download, Share2, MapPin, Clock, User, Package, CheckCircle, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Static Seed Data ───────────────────────────────────────────────────────────

const PO_OPTIONS = [
  { id: 'PO-AW27-4812', brand: 'Zara', season: 'AW2027', qty: 12400 },
  { id: 'PO-AW27-3991', brand: 'Zara', season: 'AW2027', qty: 8600  },
  { id: 'PO-SS27-2201', brand: 'Zara', season: 'SS2027', qty: 6200  },
];

const LOT_DATA = {
  'PO-AW27-4812': [
    { lotNo: 'LOT-JK001-CHC-01', styleNo: 'ZR-AW27-JK001', styleName: 'Wool Blend Overcoat', colour: 'Charcoal Melange', qty: 800 },
    { lotNo: 'LOT-JK001-NVY-03', styleNo: 'ZR-AW27-JK001', styleName: 'Wool Blend Overcoat', colour: 'Deep Navy',         qty: 960 },
    { lotNo: 'LOT-SW002-IVY-01', styleNo: 'ZR-AW27-SW002', styleName: 'Merino Turtleneck',    colour: 'Ivory White',       qty: 1200 },
    { lotNo: 'LOT-TR003-CHC-01', styleNo: 'ZR-AW27-TR003', styleName: 'Flannel Wide-Leg Trouser', colour: 'Charcoal Check', qty: 700 },
    { lotNo: 'LOT-DRS004-EMR-01',styleNo: 'ZR-AW27-DRS004',styleName: 'Velvet Midi Dress',    colour: 'Emerald Green',     qty: 400 },
  ],
  'PO-AW27-3991': [
    { lotNo: 'LOT-PK001-BLK-01', styleNo: 'ZR-AW27-PK001', styleName: 'Quilted Puffer Jacket', colour: 'Jet Black',       qty: 800 },
    { lotNo: 'LOT-PK001-RED-02', styleNo: 'ZR-AW27-PK001', styleName: 'Quilted Puffer Jacket', colour: 'Cherry Red',      qty: 720 },
    { lotNo: 'LOT-KN002-GRY-01', styleNo: 'ZR-AW27-KN002', styleName: 'Ribbed Knit Cardigan',  colour: 'Marl Grey',       qty: 650 },
    { lotNo: 'LOT-DN003-IND-01', styleNo: 'ZR-AW27-DN003', styleName: 'Slim Fit Denim Jeans',  colour: 'Indigo Wash',     qty: 900 },
  ],
  'PO-SS27-2201': [
    { lotNo: 'LOT-SS-CT001-CAM', styleNo: 'ZR-SS27-CT001', styleName: 'Linen Blend Blazer',    colour: 'Camel',           qty: 900 },
    { lotNo: 'LOT-SS-CT001-WHT', styleNo: 'ZR-SS27-CT001', styleName: 'Linen Blend Blazer',    colour: 'White',           qty: 800 },
    { lotNo: 'LOT-SS-BL002-SAG', styleNo: 'ZR-SS27-BL002', styleName: 'Linen Shirt',           colour: 'Sage Green',      qty: 700 },
    { lotNo: 'LOT-SS-TR003-SND', styleNo: 'ZR-SS27-TR003', styleName: 'Wide Leg Linen Trouser',colour: 'Sand Beige',      qty: 650 },
    { lotNo: 'LOT-SS-TR003-WHT', styleNo: 'ZR-SS27-TR003', styleName: 'Wide Leg Linen Trouser',colour: 'White',           qty: 600 },
  ],
};

const SCAN_EVENTS = {
  'LOT-JK001-CHC-01': [
    { ts: '22 Apr 2026  14:32', location: 'Bommasandra Warehouse, Bangalore', scanner: 'QC Inspector', stage: 'QC & Packing', gps: '12.8088° N, 77.6945° E', status: 'Verified' },
    { ts: '19 Apr 2026  09:14', location: 'TCH Garments Floor B, Bangalore',  scanner: 'Floor Supervisor', stage: 'Cut & Sew', gps: '12.8088° N, 77.6945° E', status: 'Verified' },
    { ts: '12 Apr 2026  11:55', location: 'Hyosung Finishing Line 3, Daegu',  scanner: 'Factory Floor',    stage: 'Dyeing & Finishing', gps: '35.8714° N, 128.6014° E', status: 'Verified' },
    { ts: '04 Apr 2026  08:22', location: 'Coats Fabric Dispatch, Tirupur',   scanner: 'Warehouse Mgr',    stage: 'Weaving / Knitting', gps: '11.1085° N, 77.3411° E', status: 'Dispatched' },
    { ts: '28 Mar 2026  16:40', location: 'Arvind Mills Output QC, Ahmedabad',scanner: 'QC Inspector',     stage: 'Spinning',           gps: '23.0225° N, 72.5714° E', status: 'Verified' },
    { ts: '15 Mar 2026  13:08', location: 'Xinjiang Cotton Despatch, Changji',scanner: 'Warehouse Mgr',    stage: 'Raw Material',        gps: '44.0220° N, 87.3088° E', status: 'Dispatched' },
  ],
  'LOT-JK001-NVY-03': [
    { ts: '21 Apr 2026  10:05', location: 'TCH Garments Floor A, Bangalore',  scanner: 'Floor Supervisor', stage: 'Cut & Sew', gps: '12.8088° N, 77.6945° E', status: 'In Progress' },
    { ts: '14 Apr 2026  14:30', location: 'Hyosung Dye Line 1, Daegu',        scanner: 'Factory Floor',    stage: 'Dyeing & Finishing', gps: '35.8714° N, 128.6014° E', status: 'Verified' },
    { ts: '06 Apr 2026  09:45', location: 'Coats Weaving Hall, Tirupur',      scanner: 'Warehouse Mgr',    stage: 'Weaving / Knitting', gps: '11.1085° N, 77.3411° E', status: 'Verified' },
    { ts: '29 Mar 2026  11:20', location: 'Arvind Yarn Store, Ahmedabad',     scanner: 'QC Inspector',     stage: 'Spinning',           gps: '23.0225° N, 72.5714° E', status: 'Verified' },
    { ts: '18 Mar 2026  08:00', location: 'Xinjiang Cotton Bale Store',       scanner: 'Warehouse Mgr',    stage: 'Raw Material',        gps: '44.0220° N, 87.3088° E', status: 'Verified' },
  ],
  'LOT-SW002-IVY-01': [
    { ts: '20 Apr 2026  15:10', location: 'TCH Garments Packing Bay, Bangalore', scanner: 'QC Inspector', stage: 'QC & Packing', gps: '12.8088° N, 77.6945° E', status: 'Verified' },
    { ts: '16 Apr 2026  12:30', location: 'TCH Garments Sewing Line 2',        scanner: 'Floor Supervisor', stage: 'Cut & Sew', gps: '12.8088° N, 77.6945° E', status: 'In Progress' },
    { ts: '08 Apr 2026  09:00', location: 'Hyosung Finishing, Daegu',          scanner: 'Factory Floor',    stage: 'Dyeing & Finishing', gps: '35.8714° N, 128.6014° E', status: 'Verified' },
    { ts: '01 Apr 2026  14:55', location: 'Coats Knitting Hall, Tirupur',      scanner: 'Warehouse Mgr',    stage: 'Weaving / Knitting', gps: '11.1085° N, 77.3411° E', status: 'Verified' },
    { ts: '24 Mar 2026  10:40', location: 'Arvind Spinning, Ahmedabad',        scanner: 'QC Inspector',     stage: 'Spinning',           gps: '23.0225° N, 72.5714° E', status: 'Verified' },
    { ts: '12 Mar 2026  07:30', location: 'Xinjiang Warehouse, Changji',       scanner: 'Warehouse Mgr',    stage: 'Raw Material',        gps: '44.0220° N, 87.3088° E', status: 'Dispatched' },
  ],
  'LOT-TR003-CHC-01': [
    { ts: '22 Apr 2026  09:00', location: 'TCH Garments QC Bay, Bangalore',   scanner: 'QC Inspector',     stage: 'QC & Packing', gps: '12.8088° N, 77.6945° E', status: 'Verified' },
    { ts: '18 Apr 2026  13:20', location: 'TCH Cut Room, Bangalore',           scanner: 'Floor Supervisor', stage: 'Cut & Sew', gps: '12.8088° N, 77.6945° E', status: 'Verified' },
    { ts: '10 Apr 2026  11:00', location: 'Hyosung Dye House, Daegu',         scanner: 'Factory Floor',    stage: 'Dyeing & Finishing', gps: '35.8714° N, 128.6014° E', status: 'Verified' },
    { ts: '02 Apr 2026  08:45', location: 'Coats Fabric Yard, Tirupur',       scanner: 'Warehouse Mgr',    stage: 'Weaving / Knitting', gps: '11.1085° N, 77.3411° E', status: 'Verified' },
    { ts: '26 Mar 2026  15:00', location: 'Arvind Mills, Ahmedabad',          scanner: 'QC Inspector',     stage: 'Spinning',           gps: '23.0225° N, 72.5714° E', status: 'Verified' },
  ],
  'LOT-DRS004-EMR-01': [
    { ts: '21 Apr 2026  11:30', location: 'TCH Cut Room, Bangalore',          scanner: 'Floor Supervisor', stage: 'Cut & Sew', gps: '12.8088° N, 77.6945° E', status: 'In Progress' },
    { ts: '13 Apr 2026  16:00', location: 'Hyosung Velvet Finish, Daegu',    scanner: 'Factory Floor',    stage: 'Dyeing & Finishing', gps: '35.8714° N, 128.6014° E', status: 'Verified' },
    { ts: '05 Apr 2026  10:15', location: 'Coats Fabric Dispatch, Tirupur',  scanner: 'Warehouse Mgr',    stage: 'Weaving / Knitting', gps: '11.1085° N, 77.3411° E', status: 'Dispatched' },
    { ts: '28 Mar 2026  09:30', location: 'Arvind Yarn Output, Ahmedabad',   scanner: 'QC Inspector',     stage: 'Spinning',           gps: '23.0225° N, 72.5714° E', status: 'Verified' },
  ],
};

// Default fallback scan events for lots not explicitly seeded
const DEFAULT_SCANS = (lotNo) => [
  { ts: '20 Apr 2026  14:00', location: 'Factory Floor, Production Unit', scanner: 'Floor Supervisor', stage: 'Cut & Sew', gps: '12.9716° N, 77.5946° E', status: 'In Progress' },
  { ts: '14 Apr 2026  10:30', location: 'Dyehouse Dispatch',             scanner: 'Warehouse Mgr',    stage: 'Dyeing & Finishing', gps: '35.8714° N, 128.6014° E', status: 'Verified' },
  { ts: '07 Apr 2026  09:00', location: 'Fabric Weaving Hall',           scanner: 'Factory Floor',    stage: 'Weaving / Knitting', gps: '11.1085° N, 77.3411° E', status: 'Verified' },
  { ts: '30 Mar 2026  11:45', location: 'Spinning Mill Output',          scanner: 'QC Inspector',     stage: 'Spinning',           gps: '23.0225° N, 72.5714° E', status: 'Verified' },
  { ts: '20 Mar 2026  08:00', location: 'Raw Material Warehouse',        scanner: 'Warehouse Mgr',    stage: 'Raw Material',        gps: '44.0220° N, 87.3088° E', status: 'Dispatched' },
];

const STATUS_STYLE = {
  Verified:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Dispatched:  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'In Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

// ── QR Placeholder ─────────────────────────────────────────────────────────────

function QRPlaceholder({ lotNo }) {
  const cells = Array.from({ length: 7 * 7 });
  const corners = [0,1,2,3,4,5,6, 7,13, 14,20, 21,27, 28,34, 35,41, 42,43,44,45,46,47,48];
  const filled  = new Set([...corners, 24, 8,9,10,15,16,17,22,23, 31,32,33,38,39,40]);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-xl inline-block">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((_, i) => (
            <div key={i} className={`w-5 h-5 rounded-sm ${filled.has(i) ? 'bg-slate-900' : 'bg-white'}`} />
          ))}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">QR Code</div>
        <div className="font-mono text-sm text-teal-300 font-semibold">{lotNo}</div>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function POQRScanVisibility() {
  const navigate = useNavigate();
  const [activePO,  setActivePO]  = useState('PO-AW27-4812');
  const [activeLot, setActiveLot] = useState('LOT-JK001-CHC-01');

  const lots  = LOT_DATA[activePO] || [];
  const scans = SCAN_EVENTS[activeLot] || DEFAULT_SCANS(activeLot);

  function handlePOChange(poId) {
    setActivePO(poId);
    const firstLot = (LOT_DATA[poId] || [])[0];
    setActiveLot(firstLot ? firstLot.lotNo : '');
  }

  const stagesCovered = [...new Set(scans.map(s => s.stage))].length;
  const lastScan      = scans[0]?.ts || '—';
  const selectedLot   = lots.find(l => l.lotNo === activeLot);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/brand/po-sc-management')}
          className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <QrCode className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-semibold text-white">Supply Chain QR Code Scan Visibility</h1>
      </div>

      {/* PO Tabs */}
      <div className="flex gap-2 mb-4">
        {PO_OPTIONS.map(po => (
          <button key={po.id} onClick={() => handlePOChange(po.id)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              activePO === po.id
                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}>
            {po.id} <span className="opacity-60">· {po.brand}</span>
          </button>
        ))}
      </div>

      {/* Lot Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {lots.map(lot => (
          <button key={lot.lotNo} onClick={() => setActiveLot(lot.lotNo)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              activeLot === lot.lotNo
                ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}>
            {lot.lotNo}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* QR Code Panel */}
        <Card className="bg-slate-800 border-slate-700 col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200">Lot QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <QRPlaceholder lotNo={activeLot} />
            {selectedLot && (
              <div className="mt-4 space-y-1 text-xs text-slate-400">
                <div><span className="text-slate-500">Style: </span>{selectedLot.styleNo}</div>
                <div><span className="text-slate-500">Name: </span>{selectedLot.styleName}</div>
                <div><span className="text-slate-500">Colour: </span>{selectedLot.colour}</div>
                <div><span className="text-slate-500">Qty: </span>{selectedLot.qty.toLocaleString()} pcs</div>
              </div>
            )}
            <div className="flex gap-2 mt-5">
              <Button size="sm" variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs">
                <Download className="w-3 h-3 mr-1" /> Download
              </Button>
              <Button size="sm" variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs">
                <Share2 className="w-3 h-3 mr-1" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary + Scan History */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Scans',              val: scans.length, icon: QrCode,       color: 'text-teal-300' },
              { label: 'Last Scanned',             val: lastScan,     icon: Clock,        color: 'text-white', small: true },
              { label: 'Supply Chain Stages Covered', val: `${stagesCovered} / 7`, icon: Layers, color: 'text-emerald-300' },
            ].map(k => (
              <Card key={k.label} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                    <span className="text-xs text-slate-400">{k.label}</span>
                  </div>
                  <div className={`font-bold ${k.small ? 'text-sm' : 'text-xl'} ${k.color}`}>{k.val}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scan History Table */}
          <Card className="bg-slate-800 border-slate-700 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200">Scan History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-500 uppercase">
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">Location</th>
                      <th className="px-4 py-2 text-left">Scanner</th>
                      <th className="px-4 py-2 text-left">Stage</th>
                      <th className="px-4 py-2 text-left">GPS</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((ev, i) => (
                      <tr key={i} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-2.5 text-slate-300 font-mono whitespace-nowrap">{ev.ts}</td>
                        <td className="px-4 py-2.5 text-slate-300 max-w-40">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            {ev.scanner}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-teal-300 whitespace-nowrap">{ev.stage}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono whitespace-nowrap">{ev.gps}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full border text-xs ${STATUS_STYLE[ev.status] || STATUS_STYLE['Verified']}`}>
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
