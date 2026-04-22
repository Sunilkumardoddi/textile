import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Flag, Save, Send, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AUDIT_DATA = {
  'AUD-003': { manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', type: 'SMETA 4-Pillar', brand: 'H&M Group', scheduled: '01 Mar 2027', deadline: '15 Mar 2027', status: 'In Progress' },
  'AUD-004': { manufacturer: 'Beximco Garments Ltd', country: 'Bangladesh', type: 'GOTS Chain of Custody', brand: 'Zara (Inditex)', scheduled: '20 Mar 2027', deadline: '05 Apr 2027', status: 'Scheduled' },
  'AUD-005': { manufacturer: 'Arvind Ltd',           country: 'India',       type: 'Higg FEM Level 2', brand: 'M&S', scheduled: '05 Apr 2027', deadline: '20 Apr 2027', status: 'Scheduled' },
  'AUD-008': { manufacturer: 'Arvind Ltd',           country: 'India',       type: 'SA8000 Social',    brand: 'Primark Ltd', scheduled: '10 Apr 2027', deadline: '25 Apr 2027', status: 'Scheduled' },
  'AUD-001': { manufacturer: 'TCH Garments Pvt Ltd', country: 'India',       type: 'SA8000 Social',    brand: 'Zara (Inditex)', scheduled: '10 Jan 2027', deadline: '10 Jan 2027', status: 'Completed' },
  'AUD-002': { manufacturer: 'TCH Garments Pvt Ltd', country: 'India',       type: 'ISO 14001',        brand: 'Zara (Inditex)', scheduled: '15 Feb 2027', deadline: '15 Feb 2027', status: 'Completed' },
};

const CHECKLIST_ITEMS = [
  { id: 'C1', section: 'Labour Practices', item: 'Working hours within legal limits (<60 hrs/week)', required: true },
  { id: 'C2', section: 'Labour Practices', item: 'Minimum wage compliance verified', required: true },
  { id: 'C3', section: 'Labour Practices', item: 'No child labour — age verification documented', required: true },
  { id: 'C4', section: 'Health & Safety', item: 'Fire extinguishers serviced within 12 months', required: true },
  { id: 'C5', section: 'Health & Safety', item: 'Emergency exits unobstructed and marked', required: true },
  { id: 'C6', section: 'Health & Safety', item: 'PPE available and in use on factory floor', required: true },
  { id: 'C7', section: 'Environment', item: 'Effluent treatment plant operational', required: true },
  { id: 'C8', section: 'Environment', item: 'Water usage records available and within limits', required: false },
  { id: 'C9', section: 'Environment', item: 'Waste segregation and disposal documented', required: true },
  { id: 'C10', section: 'Management Systems', item: 'Corrective action register maintained', required: false },
  { id: 'C11', section: 'Management Systems', item: 'Worker grievance mechanism in place', required: true },
  { id: 'C12', section: 'Management Systems', item: 'Social audit training records available', required: false },
];

const SECTIONS = [...new Set(CHECKLIST_ITEMS.map(c => c.section))];

export default function AuditorAuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const audit = AUDIT_DATA[id] || {
    manufacturer: 'Unknown Manufacturer', country: '—', type: 'Unknown Audit',
    brand: '—', scheduled: '—', deadline: '—', status: 'Scheduled',
  };

  const [checks, setChecks]     = useState({});
  const [notes, setNotes]       = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setCheck = (itemId, val) => setChecks(p => ({ ...p, [itemId]: val }));
  const setNote  = (itemId, val) => setNotes(p => ({ ...p, [itemId]: val }));

  const answered = CHECKLIST_ITEMS.filter(c => checks[c.id] !== undefined).length;
  const passed   = CHECKLIST_ITEMS.filter(c => checks[c.id] === 'pass').length;
  const failed   = CHECKLIST_ITEMS.filter(c => checks[c.id] === 'fail').length;
  const score    = answered > 0 ? Math.round((passed / CHECKLIST_ITEMS.length) * 100) : 0;
  const progress = Math.round((answered / CHECKLIST_ITEMS.length) * 100);

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="space-y-6 pb-8">
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
          onClick={() => navigate('/dashboard/auditor/assigned')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Assigned
        </Button>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Audit Report Submitted</h2>
          <p className="text-slate-400 mb-1">Audit ID: <span className="text-teal-300 font-mono">{id}</span></p>
          <p className="text-slate-400 mb-4">{audit.manufacturer} · {audit.type}</p>
          <div className="flex gap-6 text-sm">
            <div className="text-center"><p className="text-slate-500">Final Score</p><p className={`text-2xl font-bold ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p></div>
            <div className="text-center"><p className="text-slate-500">Pass</p><p className="text-2xl font-bold text-emerald-400">{passed}</p></div>
            <div className="text-center"><p className="text-slate-500">Fail</p><p className="text-2xl font-bold text-red-400">{failed}</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 mb-3"
            onClick={() => navigate('/dashboard/auditor/assigned')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{audit.type}</h1>
          <p className="text-slate-400 mt-1">{audit.manufacturer} · {audit.country} · Deadline: {audit.deadline}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs mb-1">Progress</p>
          <p className="text-2xl font-bold text-teal-300">{progress}%</p>
          <p className="text-slate-500 text-xs">{answered}/{CHECKLIST_ITEMS.length} items</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-2 rounded-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Audit info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-500">Audit ID: </span><span className="text-slate-300 font-mono">{id}</span></div>
            <div><span className="text-slate-500">Brand: </span><span className="text-slate-300">{audit.brand}</span></div>
            <div><span className="text-slate-500">Scheduled: </span><span className="text-slate-300">{audit.scheduled}</span></div>
            <div><span className="text-slate-500">Status: </span><span className="text-teal-300">{audit.status}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist by section */}
      {SECTIONS.map(section => (
        <Card key={section} className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CHECKLIST_ITEMS.filter(c => c.section === section).map(c => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-slate-500 text-xs font-mono mt-0.5 w-8 flex-shrink-0">{c.id}</span>
                    <div>
                      <p className="text-slate-300 text-sm">{c.item}</p>
                      {c.required && <span className="text-red-400 text-xs">* Required</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setCheck(c.id, 'pass')}
                      className={`px-3 py-1 text-xs rounded border transition-all ${checks[c.id] === 'pass' ? 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300' : 'border-slate-600 text-slate-400 hover:border-emerald-600/50 hover:text-emerald-400'}`}
                    >
                      Pass
                    </button>
                    <button
                      onClick={() => setCheck(c.id, 'fail')}
                      className={`px-3 py-1 text-xs rounded border transition-all ${checks[c.id] === 'fail' ? 'bg-red-600/30 border-red-500/60 text-red-300' : 'border-slate-600 text-slate-400 hover:border-red-600/50 hover:text-red-400'}`}
                    >
                      Fail
                    </button>
                    <button
                      onClick={() => setCheck(c.id, 'na')}
                      className={`px-3 py-1 text-xs rounded border transition-all ${checks[c.id] === 'na' ? 'bg-slate-600/50 border-slate-500 text-slate-300' : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'}`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
                {checks[c.id] === 'fail' && (
                  <div className="ml-10">
                    <input
                      type="text"
                      placeholder="Describe the non-conformance…"
                      value={notes[c.id] || ''}
                      onChange={e => setNote(c.id, e.target.value)}
                      className="w-full bg-slate-900/50 border border-red-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Summary & Submit */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6 text-sm">
              <div><span className="text-slate-500">Score: </span><span className={`font-bold ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</span></div>
              <div><span className="text-slate-500">Pass: </span><span className="text-emerald-400 font-medium">{passed}</span></div>
              <div><span className="text-slate-500">Fail: </span><span className="text-red-400 font-medium">{failed}</span></div>
              <div><span className="text-slate-500">Remaining: </span><span className="text-slate-300 font-medium">{CHECKLIST_ITEMS.length - answered}</span></div>
            </div>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleSubmit}
              disabled={answered < CHECKLIST_ITEMS.filter(c => c.required).length}
            >
              <Send className="w-4 h-4 mr-2" />Submit Audit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
