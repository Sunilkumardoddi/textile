import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const INITIAL_ALERTS = [
  { id: 'ALT-001', severity: 'Critical', category: 'Compliance', manufacturer: 'Beximco Garments Ltd', message: 'GOTS Certificate expired — immediate renewal required', time: '2 hours ago', resolved: false },
  { id: 'ALT-002', severity: 'Critical', category: 'Compliance', manufacturer: 'TCH Garments Pvt Ltd',  message: 'Higg FEM Level 2 certification expired as of 31 Dec 2025', time: '1 day ago', resolved: false },
  { id: 'ALT-003', severity: 'Warning',  category: 'Compliance', manufacturer: 'Beximco Garments Ltd', message: 'Export License expiring in 9 days — action required', time: '3 hours ago', resolved: false },
  { id: 'ALT-004', severity: 'Warning',  category: 'Compliance', manufacturer: 'TCH Garments Pvt Ltd',  message: 'OEKO-TEX Standard 100 expiring within 60 days', time: '5 hours ago', resolved: false },
  { id: 'ALT-005', severity: 'Warning',  category: 'Production', manufacturer: 'Arvind Ltd',            message: 'Batch BAT-005 (PO-AW27-5001) still in Pending Start after 14 days', time: '6 hours ago', resolved: false },
  { id: 'ALT-006', severity: 'Info',     category: 'User',       manufacturer: '—',                     message: '2 new user registrations pending admin approval', time: '1 day ago', resolved: false },
  { id: 'ALT-007', severity: 'Info',     category: 'Audit',      manufacturer: 'Beximco Garments Ltd', message: 'Audit AUD-003 (SMETA 4-Pillar) is now In Progress', time: '2 days ago', resolved: false },
  { id: 'ALT-008', severity: 'Critical', category: 'Shipment',   manufacturer: 'TCH Garments Pvt Ltd',  message: 'Shipment SHP-003 delayed — carrier update required', time: '4 hours ago', resolved: false },
];

const SEV_CFG = {
  Critical: { cls: 'bg-red-500/20 text-red-300 border-red-500/40',    icon: XCircle,       dot: 'bg-red-500' },
  Warning:  { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: AlertTriangle, dot: 'bg-amber-500' },
  Info:     { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40',  icon: Info,          dot: 'bg-blue-500' },
};

const CATEGORIES = ['All', 'Compliance', 'Production', 'Shipment', 'Audit', 'User'];
const SEVERITIES  = ['All', 'Critical', 'Warning', 'Info'];

export default function AdminAlerts() {
  const [alerts, setAlerts]   = useState(INITIAL_ALERTS);
  const [category, setCategory] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [showResolved, setShowResolved] = useState(false);

  const resolve = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  const resolveAll = () => setAlerts(prev => prev.map(a => ({ ...a, resolved: true })));

  const filtered = alerts.filter(a =>
    (showResolved ? a.resolved : !a.resolved) &&
    (category === 'All' || a.category === category) &&
    (severity === 'All' || a.severity === severity)
  );

  const unresolved = alerts.filter(a => !a.resolved);
  const counts = {
    critical: unresolved.filter(a => a.severity === 'Critical').length,
    warning:  unresolved.filter(a => a.severity === 'Warning').length,
    info:     unresolved.filter(a => a.severity === 'Info').length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Alerts
            {unresolved.length > 0 && (
              <span className="text-sm px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">{unresolved.length} active</span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Platform-wide system and compliance alerts</p>
        </div>
        {unresolved.length > 0 && (
          <Button onClick={resolveAll} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />Resolve All
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical', val: counts.critical, color: 'text-red-400' },
          { label: 'Warning',  val: counts.warning,  color: 'text-amber-400' },
          { label: 'Info',     val: counts.info,     color: 'text-blue-400' },
        ].map(k => (
          <Card key={k.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/60">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={severity} onChange={e => setSeverity(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/60">
          {SEVERITIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setShowResolved(p => !p)}
          className={`px-4 py-2 rounded-lg text-sm border transition-all ${showResolved ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
        >
          {showResolved ? 'Show Active' : 'Show Resolved'}
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map(a => {
          const scfg = SEV_CFG[a.severity] || SEV_CFG.Info;
          const Icon = scfg.icon;
          return (
            <Card key={a.id} className={`bg-slate-800 border-slate-700 ${a.resolved ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${scfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${scfg.cls}`}>{a.severity}</span>
                      <span className="text-slate-500 text-xs">{a.category}</span>
                      {a.manufacturer !== '—' && <span className="text-slate-500 text-xs">· {a.manufacturer}</span>}
                    </div>
                    <p className="text-white text-sm">{a.message}</p>
                    <p className="text-slate-500 text-xs mt-1">{a.id} · {a.time}</p>
                  </div>
                  {!a.resolved && (
                    <Button size="sm" onClick={() => resolve(a.id)}
                      className="bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-600/40 text-xs flex-shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" />Resolve
                    </Button>
                  )}
                  {a.resolved && (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />Resolved
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            {showResolved ? 'No resolved alerts.' : 'No active alerts.'}
          </div>
        )}
      </div>
    </div>
  );
}
