import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Play, RefreshCw, CheckCircle, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ASSIGNED_AUDITS = [
  { id: 'AUD-003', manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', type: 'SMETA 4-Pillar',    brand: 'H&M Group',    scheduled: '01 Mar 2027', deadline: '15 Mar 2027', status: 'In Progress', progress: 60 },
  { id: 'AUD-004', manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', type: 'GOTS Chain of Custody', brand: 'Zara (Inditex)', scheduled: '20 Mar 2027', deadline: '05 Apr 2027', status: 'Scheduled',  progress: 0 },
  { id: 'AUD-005', manufacturer: 'Arvind Ltd',           country: 'India',       type: 'Higg FEM Level 2', brand: 'M&S',          scheduled: '05 Apr 2027', deadline: '20 Apr 2027', status: 'Scheduled',  progress: 0 },
  { id: 'AUD-008', manufacturer: 'Arvind Ltd',           country: 'India',       type: 'SA8000 Social',    brand: 'Primark Ltd',  scheduled: '10 Apr 2027', deadline: '25 Apr 2027', status: 'Scheduled',  progress: 0 },
  { id: 'AUD-001', manufacturer: 'TCH Garments Pvt Ltd', country: 'India',       type: 'SA8000 Social',    brand: 'Zara (Inditex)', scheduled: '10 Jan 2027', deadline: '10 Jan 2027', status: 'Completed',  progress: 100 },
  { id: 'AUD-002', manufacturer: 'TCH Garments Pvt Ltd', country: 'India',       type: 'ISO 14001',        brand: 'Zara (Inditex)', scheduled: '15 Feb 2027', deadline: '15 Feb 2027', status: 'Completed',  progress: 100 },
];

const STATUS_CFG = {
  Completed:   { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  'In Progress': { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40',        icon: RefreshCw },
  Scheduled:   { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',      icon: Calendar },
};

const STATUS_TABS = ['All', 'In Progress', 'Scheduled', 'Completed'];

export default function AuditorAssigned() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded]         = useState(null);
  const [progresses, setProgresses]     = useState({});

  const getProgress = (id, seed) => progresses[id] ?? seed;
  const advanceProgress = (id) => {
    const cur = getProgress(id, ASSIGNED_AUDITS.find(a => a.id === id)?.progress ?? 0);
    setProgresses(p => ({ ...p, [id]: Math.min(100, cur + 20) }));
  };

  const filtered = ASSIGNED_AUDITS.filter(a => statusFilter === 'All' || a.status === statusFilter);

  const counts = {
    total: ASSIGNED_AUDITS.length,
    inProgress: ASSIGNED_AUDITS.filter(a => a.status === 'In Progress').length,
    scheduled: ASSIGNED_AUDITS.filter(a => a.status === 'Scheduled').length,
    completed: ASSIGNED_AUDITS.filter(a => a.status === 'Completed').length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Assigned Audits</h1>
        <p className="text-slate-400 mt-1">Your audit assignments — SGS Auditor</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned', val: counts.total, color: 'text-white' },
          { label: 'In Progress', val: counts.inProgress, color: 'text-blue-400' },
          { label: 'Scheduled', val: counts.scheduled, color: 'text-amber-400' },
          { label: 'Completed', val: counts.completed, color: 'text-emerald-400' },
        ].map(k => (
          <Card key={k.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setStatusFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === t ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Audit List */}
      <div className="space-y-3">
        {filtered.map(a => {
          const scfg = STATUS_CFG[a.status] || STATUS_CFG.Scheduled;
          const StatusIcon = scfg.icon;
          const isOpen = expanded === a.id;
          const progress = getProgress(a.id, a.progress);

          return (
            <Card key={a.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : a.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="text-teal-300 font-mono text-xs">{a.id}</span>
                      <span className="text-white font-semibold">{a.manufacturer}</span>
                      <span className="text-slate-500 text-xs">{a.country}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${scfg.cls}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />{a.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{a.type}</span>
                      <span>·</span>
                      <span>Brand: {a.brand}</span>
                      <span>·</span>
                      <span>Deadline: {a.deadline}</span>
                    </div>
                    {a.status !== 'Scheduled' && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 max-w-xs h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-1.5 rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-teal-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{progress}%</span>
                      </div>
                    )}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 border-t border-slate-700/50 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="text-slate-500">Audit ID: </span><span className="text-slate-300 font-mono">{a.id}</span></div>
                      <div><span className="text-slate-500">Type: </span><span className="text-slate-300">{a.type}</span></div>
                      <div><span className="text-slate-500">Scheduled: </span><span className="text-slate-300">{a.scheduled}</span></div>
                      <div><span className="text-slate-500">Deadline: </span><span className="text-slate-300">{a.deadline}</span></div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {a.status === 'Scheduled' && (
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white text-sm"
                          onClick={e => { e.stopPropagation(); navigate(`/dashboard/auditor/audit/${a.id}`); }}>
                          <Play className="w-4 h-4 mr-2" />Start Audit
                        </Button>
                      )}
                      {a.status === 'In Progress' && progress < 100 && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          onClick={e => { e.stopPropagation(); advanceProgress(a.id); }}>
                          <RefreshCw className="w-4 h-4 mr-2" />Update Progress (+20%)
                        </Button>
                      )}
                      {(a.status === 'In Progress' || a.status === 'Scheduled') && (
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
                          onClick={e => { e.stopPropagation(); navigate(`/dashboard/auditor/audit/${a.id}`); }}>
                          View Full Details
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
