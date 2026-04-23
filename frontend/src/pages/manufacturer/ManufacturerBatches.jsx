import React, { useState } from 'react';
import {
  Layers, ChevronDown, ChevronUp, Package, User, AlertTriangle,
  Search, Filter, ClipboardCheck, BarChart3, X, CheckCircle,
  XCircle, Clock, TrendingUp, TrendingDown, Award, Wrench,
  CalendarDays, Users, Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Batch Seed Data ───────────────────────────────────────────────────────────

const BATCHES = [
  { id: 'BATCH-001', style: 'ZR-AW27-JK001', buyer: 'Zara', po: 'PO-AW27-4812', qty: 800,  start: '01 Jan 2027', target: '28 Feb 2027', status: 'Completed',  progress: 100, fabric: 'Wool Blend 400gsm',            trim: 'YKK Zipper, Snap Buttons',     line: 'Line-1', supervisor: 'Rajesh Kumar', defect: '1.2%' },
  { id: 'BATCH-002', style: 'ZR-AW27-SW002', buyer: 'Zara', po: 'PO-AW27-4812', qty: 1200, start: '05 Jan 2027', target: '10 Mar 2027', status: 'Completed',  progress: 100, fabric: 'Cotton Fleece 320gsm',          trim: 'Ribbed Cuff, Drawcord',        line: 'Line-2', supervisor: 'Priya Menon',   defect: '0.9%' },
  { id: 'BATCH-003', style: 'ZR-AW27-TR003', buyer: 'Zara', po: 'PO-AW27-4812', qty: 700,  start: '10 Feb 2027', target: '30 Mar 2027', status: 'Shipped',    progress: 100, fabric: 'Polyester Twill 280gsm',        trim: 'Metal Buttons, Belt Loop',     line: 'Line-3', supervisor: 'Suresh Nair',   defect: '1.5%' },
  { id: 'BATCH-004', style: 'HM-AW27-PK001', buyer: 'H&M', po: 'PO-AW27-3991', qty: 800,  start: '15 Feb 2027', target: '15 Apr 2027', status: 'QC',         progress: 88,  fabric: 'Nylon Ripstop 200gsm',          trim: 'Velcro Closure, Cord Stopper', line: 'Line-1', supervisor: 'Rajesh Kumar', defect: '2.1%' },
  { id: 'BATCH-005', style: 'HM-AW27-CN002', buyer: 'H&M', po: 'PO-AW27-3991', qty: 900,  start: '20 Feb 2027', target: '20 Apr 2027', status: 'In Production',progress: 72, fabric: 'Organic Cotton Jersey 180gsm', trim: 'Flat Knit Rib, Care Label',    line: 'Line-2', supervisor: 'Priya Menon',   defect: '1.8%' },
  { id: 'BATCH-006', style: 'HM-AW27-TR003', buyer: 'H&M', po: 'PO-AW27-3991', qty: 700,  start: '01 Mar 2027', target: '25 Apr 2027', status: 'In Production',progress: 55, fabric: 'Recycled Poly Twill 260gsm',  trim: 'Brass Rivets, Patch Pocket',   line: 'Line-3', supervisor: 'Suresh Nair',   defect: '2.4%' },
  { id: 'BATCH-007', style: 'MS-AW27-CT001', buyer: 'M&S', po: 'PO-AW27-5100', qty: 600,  start: '10 Mar 2027', target: '30 Apr 2027', status: 'In Production',progress: 40, fabric: 'Merino Wool 300gsm',           trim: 'Shell Buttons, Woven Label',   line: 'Line-4', supervisor: 'Anitha Rao',    defect: '1.6%' },
  { id: 'BATCH-008', style: 'MS-AW27-SW002', buyer: 'M&S', po: 'PO-AW27-5100', qty: 1200, start: '15 Mar 2027', target: '05 May 2027', status: 'In Production',progress: 28, fabric: 'Cotton Modal Blend 240gsm',    trim: 'Rib Collar, Printed Label',    line: 'Line-5', supervisor: 'Kiran Bhat',    defect: '1.1%' },
  { id: 'BATCH-009', style: 'ZR-AW27-DRS004',buyer: 'Zara', po: 'PO-AW27-4812', qty: 400,  start: '20 Mar 2027', target: '10 May 2027', status: 'In Production',progress: 15, fabric: 'Viscose Satin 120gsm',         trim: 'Invisible Zipper, Lining',     line: 'Line-1', supervisor: 'Rajesh Kumar', defect: '3.0%' },
  { id: 'BATCH-010', style: 'MS-AW27-TR003', buyer: 'M&S', po: 'PO-AW27-5100', qty: 900,  start: '25 Mar 2027', target: '15 May 2027', status: 'Pending Start',progress: 0,  fabric: 'Cotton Chino 220gsm',          trim: 'Horn Buttons, Belt Loops',     line: 'Line-2', supervisor: 'Priya Menon',   defect: '—'   },
];

// ── QC Report Seed ────────────────────────────────────────────────────────────

const QC_REPORTS = {
  'BATCH-001': {
    inspector: 'Kavitha Sharma', date: '26 Feb 2027', aqlLevel: 'Level II', sampleSize: 80,
    result: 'Pass', defectRate: 1.2,
    checkpoints: [
      { name: 'Measurements vs Spec',    result: 'Pass' },
      { name: 'Stitching Quality',        result: 'Pass' },
      { name: 'Fabric Defects',           result: 'Pass' },
      { name: 'Color Matching',           result: 'Pass' },
      { name: 'Trim & Accessories',       result: 'Pass' },
      { name: 'Label & Care Instruction', result: 'Pass' },
      { name: 'Packaging & Barcode',      result: 'Pass' },
    ],
    defects: [
      { type: 'Stitching Skip',     count: 4, severity: 'Minor' },
      { type: 'Measurement Tolerance', count: 3, severity: 'Minor' },
      { type: 'Fabric Pilling',     count: 2, severity: 'Minor' },
      { type: 'Button Placement',   count: 1, severity: 'Minor' },
    ],
    comments: 'Minor stitching skips on collar seam; rectified inline. All measurements within ±0.5 cm tolerance. No critical defects.',
  },
  'BATCH-002': {
    inspector: 'Ramesh Pillai', date: '09 Mar 2027', aqlLevel: 'Level II', sampleSize: 80,
    result: 'Pass', defectRate: 0.9,
    checkpoints: [
      { name: 'Measurements vs Spec',    result: 'Pass' },
      { name: 'Stitching Quality',        result: 'Pass' },
      { name: 'Fabric Defects',           result: 'Pass' },
      { name: 'Color Matching',           result: 'Pass' },
      { name: 'Trim & Accessories',       result: 'Pass' },
      { name: 'Label & Care Instruction', result: 'Pass' },
      { name: 'Packaging & Barcode',      result: 'Pass' },
    ],
    defects: [
      { type: 'Cuff Alignment',  count: 3, severity: 'Minor' },
      { type: 'Print Placement', count: 2, severity: 'Minor' },
    ],
    comments: 'Excellent batch overall. Lowest defect rate this season. Cuff alignment deviations within acceptable range.',
  },
  'BATCH-003': {
    inspector: 'Kavitha Sharma', date: '29 Mar 2027', aqlLevel: 'Level II', sampleSize: 70,
    result: 'Pass', defectRate: 1.5,
    checkpoints: [
      { name: 'Measurements vs Spec',    result: 'Pass' },
      { name: 'Stitching Quality',        result: 'Pass' },
      { name: 'Fabric Defects',           result: 'Pass' },
      { name: 'Color Matching',           result: 'Conditional' },
      { name: 'Trim & Accessories',       result: 'Pass' },
      { name: 'Label & Care Instruction', result: 'Pass' },
      { name: 'Packaging & Barcode',      result: 'Pass' },
    ],
    defects: [
      { type: 'Color Shade Variation', count: 4, severity: 'Minor' },
      { type: 'Stitching',             count: 4, severity: 'Minor' },
      { type: 'Metal Button Rust',     count: 2, severity: 'Major' },
    ],
    comments: 'Two metal buttons showed surface rust — supplier batch replaced. Color shade approved by buyer after swatch confirmation.',
  },
  'BATCH-004': {
    inspector: 'Ramesh Pillai', date: '14 Apr 2027', aqlLevel: 'Level II', sampleSize: 80,
    result: 'Conditional Pass', defectRate: 2.1,
    checkpoints: [
      { name: 'Measurements vs Spec',    result: 'Pass' },
      { name: 'Stitching Quality',        result: 'Fail' },
      { name: 'Fabric Defects',           result: 'Pass' },
      { name: 'Color Matching',           result: 'Pass' },
      { name: 'Trim & Accessories',       result: 'Pass' },
      { name: 'Label & Care Instruction', result: 'Pass' },
      { name: 'Packaging & Barcode',      result: 'Pending' },
    ],
    defects: [
      { type: 'Stitching Gaps',        count: 8,  severity: 'Major'  },
      { type: 'Velcro Misalignment',   count: 5,  severity: 'Minor'  },
      { type: 'Cord Stopper Missing',  count: 3,  severity: 'Major'  },
      { type: 'Seam Puckering',        count: 1,  severity: 'Minor'  },
    ],
    comments: 'Stitching quality requires re-work on 68 pieces. Cord stoppers re-fitted. Re-inspection scheduled for 16 Apr 2027.',
  },
  'BATCH-005': {
    inspector: 'Kavitha Sharma', date: 'In Progress', aqlLevel: 'Level II', sampleSize: 45,
    result: 'In Progress', defectRate: 1.8,
    checkpoints: [
      { name: 'Measurements vs Spec',    result: 'Pass'    },
      { name: 'Stitching Quality',        result: 'Pass'    },
      { name: 'Fabric Defects',           result: 'Pass'    },
      { name: 'Color Matching',           result: 'Pending' },
      { name: 'Trim & Accessories',       result: 'Pending' },
      { name: 'Label & Care Instruction', result: 'Pending' },
      { name: 'Packaging & Barcode',      result: 'Pending' },
    ],
    defects: [
      { type: 'Rib Knit Hole',  count: 6, severity: 'Minor' },
      { type: 'Label Placement',count: 5, severity: 'Minor' },
    ],
    comments: 'Inline QC ongoing. First 45 pieces inspected — results satisfactory. Final inspection pending completion of remaining units.',
  },
};

// ── Production Report Seed ────────────────────────────────────────────────────

const PROD_REPORTS = {
  'BATCH-001': {
    workers: 22, avgAttendance: '96%', smv: 28.5, efficiency: 94,
    machineUtil: '92%', rework: '2.1%', firstPassYield: '97.9%',
    totalDays: 58, workingDays: 42, produced: 800, target: 800,
    milestones: [
      { stage: 'Cutting',      planned: '01 Jan', actual: '01 Jan', delta: 0   },
      { stage: 'Stitching',    planned: '05 Jan', actual: '05 Jan', delta: 0   },
      { stage: 'Finishing',    planned: '18 Feb', actual: '20 Feb', delta: 2   },
      { stage: 'Inline QC',    planned: '22 Feb', actual: '22 Feb', delta: 0   },
      { stage: 'Final QC',     planned: '24 Feb', actual: '25 Feb', delta: 1   },
      { stage: 'Packing',      planned: '26 Feb', actual: '28 Feb', delta: 2   },
    ],
    daily: [
      { day: 'W1', output: 108, target: 110 },
      { day: 'W2', output: 116, target: 110 },
      { day: 'W3', output: 112, target: 110 },
      { day: 'W4', output: 118, target: 110 },
      { day: 'W5', output: 105, target: 110 },
      { day: 'W6', output: 120, target: 110 },
      { day: 'W7', output: 121, target: 110 },
    ],
  },
  'BATCH-002': {
    workers: 26, avgAttendance: '98%', smv: 22.0, efficiency: 97,
    machineUtil: '94%', rework: '1.4%', firstPassYield: '98.6%',
    totalDays: 64, workingDays: 46, produced: 1200, target: 1200,
    milestones: [
      { stage: 'Cutting',   planned: '05 Jan', actual: '05 Jan', delta: 0 },
      { stage: 'Stitching', planned: '10 Jan', actual: '10 Jan', delta: 0 },
      { stage: 'Finishing', planned: '25 Feb', actual: '25 Feb', delta: 0 },
      { stage: 'Inline QC', planned: '06 Mar', actual: '06 Mar', delta: 0 },
      { stage: 'Final QC',  planned: '08 Mar', actual: '08 Mar', delta: 0 },
      { stage: 'Packing',   planned: '10 Mar', actual: '10 Mar', delta: 0 },
    ],
    daily: [
      { day: 'W1', output: 162, target: 160 },
      { day: 'W2', output: 168, target: 160 },
      { day: 'W3', output: 170, target: 160 },
      { day: 'W4', output: 166, target: 160 },
      { day: 'W5', output: 164, target: 160 },
      { day: 'W6', output: 170, target: 160 },
      { day: 'W7', output: 160, target: 160 },
      { day: 'W8', output: 140, target: 160 },
    ],
  },
  'BATCH-003': {
    workers: 18, avgAttendance: '94%', smv: 24.5, efficiency: 88,
    machineUtil: '86%', rework: '2.8%', firstPassYield: '97.2%',
    totalDays: 48, workingDays: 35, produced: 700, target: 700,
    milestones: [
      { stage: 'Cutting',   planned: '10 Feb', actual: '10 Feb', delta: 0 },
      { stage: 'Stitching', planned: '15 Feb', actual: '16 Feb', delta: 1 },
      { stage: 'Finishing', planned: '20 Mar', actual: '22 Mar', delta: 2 },
      { stage: 'Inline QC', planned: '25 Mar', actual: '26 Mar', delta: 1 },
      { stage: 'Final QC',  planned: '28 Mar', actual: '29 Mar', delta: 1 },
      { stage: 'Packing',   planned: '30 Mar', actual: '30 Mar', delta: 0 },
    ],
    daily: [
      { day: 'W1', output: 96, target: 100 },
      { day: 'W2', output: 100, target: 100 },
      { day: 'W3', output: 92, target: 100 },
      { day: 'W4', output: 104, target: 100 },
      { day: 'W5', output: 108, target: 100 },
      { day: 'W6', output: 104, target: 100 },
      { day: 'W7', output: 96, target: 100 },
    ],
  },
  'BATCH-004': {
    workers: 20, avgAttendance: '93%', smv: 26.0, efficiency: 82,
    machineUtil: '84%', rework: '3.2%', firstPassYield: '96.8%',
    totalDays: 58, workingDays: 40, produced: 704, target: 800,
    milestones: [
      { stage: 'Cutting',   planned: '15 Feb', actual: '15 Feb', delta: 0  },
      { stage: 'Stitching', planned: '20 Feb', actual: '22 Feb', delta: 2  },
      { stage: 'Finishing', planned: '08 Apr', actual: '—',      delta: null },
      { stage: 'Inline QC', planned: '10 Apr', actual: '—',      delta: null },
      { stage: 'Final QC',  planned: '14 Apr', actual: '—',      delta: null },
      { stage: 'Packing',   planned: '15 Apr', actual: '—',      delta: null },
    ],
    daily: [
      { day: 'W1', output: 80, target: 100 },
      { day: 'W2', output: 88, target: 100 },
      { day: 'W3', output: 92, target: 100 },
      { day: 'W4', output: 96, target: 100 },
      { day: 'W5', output: 104, target: 100 },
      { day: 'W6', output: 98, target: 100 },
      { day: 'W7', output: 90, target: 100 },
      { day: 'W8', output: 56, target: 100 },
    ],
  },
  'BATCH-005': {
    workers: 24, avgAttendance: '95%', smv: 20.0, efficiency: 78,
    machineUtil: '80%', rework: '2.6%', firstPassYield: '97.4%',
    totalDays: null, workingDays: 28, produced: 648, target: 900,
    milestones: [
      { stage: 'Cutting',   planned: '20 Feb', actual: '20 Feb', delta: 0    },
      { stage: 'Stitching', planned: '25 Feb', actual: '27 Feb', delta: 2    },
      { stage: 'Finishing', planned: '10 Apr', actual: '—',      delta: null  },
      { stage: 'Inline QC', planned: '14 Apr', actual: '—',      delta: null  },
      { stage: 'Final QC',  planned: '17 Apr', actual: '—',      delta: null  },
      { stage: 'Packing',   planned: '20 Apr', actual: '—',      delta: null  },
    ],
    daily: [
      { day: 'W1', output: 92,  target: 110 },
      { day: 'W2', output: 98,  target: 110 },
      { day: 'W3', output: 104, target: 110 },
      { day: 'W4', output: 108, target: 110 },
    ],
  },
};

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_FLOW    = { 'Pending Start': 'In Production', 'In Production': 'QC', 'QC': 'Completed', 'Completed': 'Shipped' };
const STATUS_ACTIONS = { 'Pending Start': 'Start Production', 'In Production': 'Send to QC', 'QC': 'Mark Completed', 'Completed': 'Mark Shipped' };

const STATUS_COLORS = {
  Completed:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Shipped:        'bg-blue-500/20 text-blue-300 border-blue-500/40',
  QC:             'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'In Production':'bg-teal-500/20 text-teal-300 border-teal-500/40',
  'Pending Start':'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const QC_RESULT_COLORS = {
  Pass:              'text-emerald-400',
  Fail:              'text-red-400',
  'Conditional Pass':'text-amber-400',
  'In Progress':     'text-blue-400',
  Conditional:       'text-amber-400',
  Pending:           'text-slate-500',
};

const BUYERS = ['All', ...Array.from(new Set(BATCHES.map(b => b.buyer)))];
const STATUS_TABS = ['All', 'In Production', 'QC', 'Completed', 'Shipped', 'Pending Start'];

const progressColor = (status) => {
  if (status === 'Completed' || status === 'Shipped') return 'bg-emerald-500';
  if (status === 'QC')           return 'bg-amber-500';
  if (status === 'In Production')return 'bg-blue-500';
  return 'bg-slate-600';
};

// ── QC Report Modal ───────────────────────────────────────────────────────────

function QCReportModal({ batch, onClose }) {
  const qc = QC_REPORTS[batch.id];

  const resultColor = qc ? QC_RESULT_COLORS[qc.result] || 'text-slate-300' : '';
  const totalDefects = qc ? qc.defects.reduce((s, d) => s + d.count, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">QC Report — {batch.id}</h2>
              <p className="text-xs text-slate-400">{batch.style} · {batch.buyer} · {batch.po}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!qc ? (
          <div className="px-6 py-16 text-center">
            <ClipboardCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">QC inspection has not been conducted yet for this batch.</p>
            <p className="text-slate-600 text-xs mt-1">Available once batch reaches QC stage.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[80vh]">
            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-700 border-b border-slate-700 bg-slate-800/40">
              {[
                { label: 'Result',       val: qc.result,             cls: resultColor                },
                { label: 'Defect Rate',  val: `${qc.defectRate}%`,   cls: qc.defectRate > 2 ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Sample Size',  val: qc.sampleSize,         cls: 'text-white'               },
                { label: 'AQL Level',    val: qc.aqlLevel,           cls: 'text-slate-200'           },
              ].map(item => (
                <div key={item.label} className="px-4 py-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.cls}`}>{item.val}</p>
                </div>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {/* Inspector info */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Inspector:</span> {qc.inspector}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Date:</span> {qc.date}
                </div>
              </div>

              {/* Checkpoints */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Inspection Checkpoints</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qc.checkpoints.map(cp => (
                    <div key={cp.name} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      cp.result === 'Pass'     ? 'bg-emerald-500/10 border-emerald-500/30' :
                      cp.result === 'Fail'     ? 'bg-red-500/10 border-red-500/30'         :
                      cp.result === 'Conditional' ? 'bg-amber-500/10 border-amber-500/30'  :
                      'bg-slate-800 border-slate-700'
                    }`}>
                      <span className="text-sm text-slate-200">{cp.name}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium ${QC_RESULT_COLORS[cp.result] || 'text-slate-500'}`}>
                        {cp.result === 'Pass' && <CheckCircle className="w-3.5 h-3.5" />}
                        {cp.result === 'Fail' && <XCircle className="w-3.5 h-3.5" />}
                        {cp.result === 'Conditional' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {cp.result === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {cp.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defect breakdown */}
              {qc.defects.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                    Defect Breakdown <span className="text-slate-600 normal-case">({totalDefects} total)</span>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {['Defect Type', 'Count', 'Severity', 'Share'].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {qc.defects.map(d => (
                          <tr key={d.type} className="border-b border-slate-800">
                            <td className="px-3 py-2 text-slate-200">{d.type}</td>
                            <td className="px-3 py-2 text-white font-semibold">{d.count}</td>
                            <td className="px-3 py-2">
                              <Badge className={`text-xs ${
                                d.severity === 'Major'    ? 'bg-red-500/20 text-red-300 border-red-500/40'    :
                                d.severity === 'Critical' ? 'bg-red-600/30 text-red-200 border-red-600/40'    :
                                'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>{d.severity}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-700 max-w-[80px]">
                                  <div className="h-1.5 rounded-full bg-amber-500"
                                    style={{ width: `${(d.count / totalDefects) * 100}%` }} />
                                </div>
                                <span className="text-xs text-slate-500">{Math.round((d.count / totalDefects) * 100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Inspector Comments</p>
                <p className="text-sm text-slate-300 leading-relaxed">{qc.comments}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Production Report Modal ───────────────────────────────────────────────────

function ProdReportModal({ batch, onClose }) {
  const pr = PROD_REPORTS[batch.id];

  const completionPct = pr ? Math.round((pr.produced / batch.qty) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Production Report — {batch.id}</h2>
              <p className="text-xs text-slate-400">{batch.style} · {batch.buyer} · {batch.po}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!pr ? (
          <div className="px-6 py-16 text-center">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No production data available for this batch yet.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[80vh]">
            {/* KPI strip */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-0 divide-x divide-slate-700 border-b border-slate-700 bg-slate-800/40">
              {[
                { label: 'Efficiency',    val: `${pr.efficiency}%`,    cls: pr.efficiency >= 90 ? 'text-emerald-400' : pr.efficiency >= 75 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Produced',      val: `${pr.produced.toLocaleString()}`,  cls: 'text-white'       },
                { label: 'Target',        val: `${batch.qty.toLocaleString()}`,    cls: 'text-slate-300'   },
                { label: 'Machine Util.', val: pr.machineUtil,    cls: 'text-blue-300'    },
                { label: 'First Pass',    val: pr.firstPassYield, cls: 'text-emerald-300' },
                { label: 'Rework Rate',   val: pr.rework,         cls: parseFloat(pr.rework) > 3 ? 'text-red-400' : 'text-amber-300' },
              ].map(item => (
                <div key={item.label} className="px-3 py-3 text-center">
                  <p className="text-xs text-slate-500 mb-1 leading-tight">{item.label}</p>
                  <p className={`text-base font-bold ${item.cls}`}>{item.val}</p>
                </div>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {/* Line & workforce */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { icon: Layers,       label: 'Production Line', val: batch.line         },
                  { icon: User,         label: 'Supervisor',      val: batch.supervisor   },
                  { icon: Users,        label: 'Workers',         val: pr.workers         },
                  { icon: TrendingUp,   label: 'Avg Attendance',  val: pr.avgAttendance   },
                ].map(item => (
                  <div key={item.label} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">{item.label}</span>
                    </div>
                    <p className="text-white font-medium">{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Completion bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Overall Completion</span>
                  <span className={`font-bold ${completionPct === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {pr.produced.toLocaleString()} / {batch.qty.toLocaleString()} pcs ({completionPct}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-700">
                  <div className={`h-3 rounded-full transition-all duration-700 ${completionPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              {/* Weekly output chart */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Weekly Output vs Target</p>
                <div className="space-y-2">
                  {pr.daily.map(w => {
                    const pct = Math.round((w.output / w.target) * 100);
                    return (
                      <div key={w.day} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-6">{w.day}</span>
                        <div className="flex-1 h-5 rounded bg-slate-700 relative overflow-hidden">
                          {/* Target line */}
                          <div className="absolute top-0 bottom-0 w-px bg-slate-500/60 z-10" style={{ left: '100%' }} />
                          <div className={`h-5 rounded transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500/60' : pct >= 85 ? 'bg-blue-500/60' : 'bg-red-500/60'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className={`text-xs w-10 text-right font-medium ${pct >= 100 ? 'text-emerald-400' : pct >= 85 ? 'text-blue-400' : 'text-red-400'}`}>
                          {w.output}
                        </span>
                        <span className="text-xs text-slate-600 w-14">/ {w.target} tgt</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Production Milestones</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {['Stage', 'Planned', 'Actual', 'Status'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pr.milestones.map(m => {
                        const delayed = m.delta !== null && m.delta > 0;
                        const pending = m.actual === '—';
                        return (
                          <tr key={m.stage} className="border-b border-slate-800">
                            <td className="px-3 py-2 text-slate-200 font-medium">{m.stage}</td>
                            <td className="px-3 py-2 text-slate-400">{m.planned}</td>
                            <td className="px-3 py-2">
                              {pending
                                ? <span className="text-slate-600">—</span>
                                : <span className={delayed ? 'text-amber-300' : 'text-emerald-400'}>{m.actual}</span>}
                            </td>
                            <td className="px-3 py-2">
                              {pending
                                ? <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3 h-3"/>Pending</span>
                                : delayed
                                ? <span className="flex items-center gap-1 text-xs text-amber-400"><TrendingDown className="w-3 h-3"/>{m.delta}d late</span>
                                : <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3"/>On Time</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SMV */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm">
                <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-slate-400">SMV (Standard Minute Value):</span>
                <span className="text-white font-semibold">{pr.smv} min</span>
                <span className="text-slate-600 text-xs ml-auto">·</span>
                <span className="text-slate-400 text-xs">{pr.workingDays} working days logged</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ManufacturerBatches() {
  const [activeFilter,   setActiveFilter]   = useState('All');
  const [buyerFilter,    setBuyerFilter]     = useState('All');
  const [searchQuery,    setSearchQuery]     = useState('');
  const [expandedBatch,  setExpandedBatch]   = useState(null);
  const [statusOverrides,setStatusOverrides] = useState({});
  const [qcModalBatch,   setQcModalBatch]    = useState(null);
  const [prodModalBatch, setProdModalBatch]  = useState(null);

  const getStatus      = (id, seed) => statusOverrides[id] ?? seed;
  const advanceStatus  = (id, cur)  => {
    const next = STATUS_FLOW[cur];
    if (next) setStatusOverrides(prev => ({ ...prev, [id]: next }));
  };

  const withStatus = BATCHES.map(b => ({ ...b, status: getStatus(b.id, b.status) }));

  const filtered = withStatus.filter(b => {
    const matchStatus = activeFilter === 'All' || b.status === activeFilter;
    const matchBuyer  = buyerFilter  === 'All' || b.buyer  === buyerFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || b.id.toLowerCase().includes(q) || b.style.toLowerCase().includes(q) || b.po.toLowerCase().includes(q);
    return matchStatus && matchBuyer && matchSearch;
  });

  const activeBatches  = withStatus.filter(b => b.status === 'In Production' || b.status === 'QC').length;
  const onTime         = withStatus.filter(b => b.status === 'Completed' || b.status === 'Shipped').length;
  const completedMonth = withStatus.filter(b => b.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Layers className="w-7 h-7 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Production Batches</h1>
            <p className="text-slate-400 text-sm">TCH Garments Pvt Ltd — Bangalore, India</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Batches',         value: activeBatches,  color: 'text-teal-400'    },
            { label: 'Completed / Shipped',    value: onTime,         color: 'text-emerald-400' },
            { label: 'QC Pass Rate',           value: '94.2%',        color: 'text-amber-400'   },
            { label: 'Completed This Month',   value: completedMonth, color: 'text-blue-400'    },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters row */}
        <div className="space-y-3">
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map(tab => (
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

          {/* Search + Buyer filter */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search batch, style, PO…"
                className="pl-9 h-8 text-sm bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400 whitespace-nowrap">Buyer:</span>
              <Select value={buyerFilter} onValueChange={setBuyerFilter}>
                <SelectTrigger className="w-36 h-8 text-sm bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {BUYERS.map(b => (
                    <SelectItem key={b} value={b} className="text-sm text-white">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-slate-500 ml-auto">{filtered.length} batch{filtered.length !== 1 ? 'es' : ''}</span>
          </div>
        </div>

        {/* Batches table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Batch No', 'Style', 'Buyer', 'PO Ref', 'Qty', 'Start', 'Target', 'Status', 'Progress', 'Reports'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-slate-500">No batches match the current filters.</td>
                    </tr>
                  )}
                  {filtered.map(batch => (
                    <React.Fragment key={batch.id}>
                      <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        {/* Clickable cells → expand */}
                        <td className="px-4 py-3 font-mono text-teal-400 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.id}
                        </td>
                        <td className="px-4 py-3 text-white cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.style}
                        </td>
                        <td className="px-4 py-3 text-slate-300 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.buyer}
                        </td>
                        <td className="px-4 py-3 text-slate-400 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.po}
                        </td>
                        <td className="px-4 py-3 text-slate-300 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.qty.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-400 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.start}
                        </td>
                        <td className="px-4 py-3 text-slate-400 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          {batch.target}
                        </td>
                        <td className="px-4 py-3 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          <Badge className={`text-xs ${STATUS_COLORS[batch.status]}`}>{batch.status}</Badge>
                        </td>
                        <td className="px-4 py-3 cursor-pointer"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all duration-500 ${progressColor(batch.status)}`}
                                style={{ width: `${batch.progress}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{batch.progress}%</span>
                            {expandedBatch === batch.id
                              ? <ChevronUp   className="w-4 h-4 text-slate-500" />
                              : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </div>
                        </td>
                        {/* Report buttons — always visible */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setQcModalBatch(batch)}
                              title="QC Report"
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                                QC_REPORTS[batch.id]
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                                  : 'bg-slate-700 border-slate-600 text-slate-500 hover:text-slate-300'
                              }`}>
                              <ClipboardCheck className="w-3 h-3" /> QC
                            </button>
                            <button
                              onClick={() => setProdModalBatch(batch)}
                              title="Production Report"
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                                PROD_REPORTS[batch.id]
                                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                                  : 'bg-slate-700 border-slate-600 text-slate-500 hover:text-slate-300'
                              }`}>
                              <BarChart3 className="w-3 h-3" /> Prod
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedBatch === batch.id && (
                        <tr className="border-b border-slate-700/50">
                          <td colSpan={10} className="px-4 py-4 bg-slate-900/60">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1">
                                  <Package className="w-3 h-3" /> Fabric Used
                                </p>
                                <p className="text-slate-200">{batch.fabric}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">Trim Used</p>
                                <p className="text-slate-200">{batch.trim}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1">
                                  <User className="w-3 h-3" /> Line / Supervisor
                                </p>
                                <p className="text-slate-200">{batch.line} — {batch.supervisor}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Defect Rate
                                </p>
                                <p className={`font-semibold ${
                                  batch.defect === '—' ? 'text-slate-500' :
                                  parseFloat(batch.defect) > 2 ? 'text-red-400' : 'text-emerald-400'
                                }`}>{batch.defect}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {STATUS_ACTIONS[batch.status] && (
                                <button
                                  onClick={e => { e.stopPropagation(); advanceStatus(batch.id, batch.status); }}
                                  className="px-4 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/50 text-teal-300 text-xs font-medium hover:bg-teal-600/30 transition-colors">
                                  {STATUS_ACTIONS[batch.status]}
                                </button>
                              )}
                              <button onClick={() => setQcModalBatch(batch)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition-colors">
                                <ClipboardCheck className="w-3.5 h-3.5" /> View QC Report
                              </button>
                              <button onClick={() => setProdModalBatch(batch)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-medium hover:bg-blue-500/25 transition-colors">
                                <BarChart3 className="w-3.5 h-3.5" /> View Production Report
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QC Report Modal */}
      {qcModalBatch && (
        <QCReportModal batch={qcModalBatch} onClose={() => setQcModalBatch(null)} />
      )}

      {/* Production Report Modal */}
      {prodModalBatch && (
        <ProdReportModal batch={prodModalBatch} onClose={() => setProdModalBatch(null)} />
      )}
    </div>
  );
}
