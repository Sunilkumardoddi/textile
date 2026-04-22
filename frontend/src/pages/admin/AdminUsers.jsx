import React, { useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Shield, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SEED_USERS = [
  { id: 'U001', name: 'Zara Brand Team',       email: 'brand@textile.com',        role: 'brand',        company: 'Zara (Inditex)',         country: 'Spain',       joined: '12 Jan 2025', status: 'Active',    lastLogin: '22 Apr 2026' },
  { id: 'U002', name: 'TCH Garments Pvt Ltd',  email: 'manufacturer@textile.com', role: 'manufacturer', company: 'TCH Garments Pvt Ltd',   country: 'India',       joined: '08 Jan 2025', status: 'Active',    lastLogin: '22 Apr 2026' },
  { id: 'U003', name: 'SGS Auditor',           email: 'auditor@textile.com',      role: 'auditor',      company: 'SGS Group',              country: 'Switzerland', joined: '15 Jan 2025', status: 'Active',    lastLogin: '21 Apr 2026' },
  { id: 'U004', name: 'H&M Buying Team',       email: 'hm@textile.com',           role: 'brand',        company: 'H&M Group',              country: 'Sweden',      joined: '20 Feb 2025', status: 'Active',    lastLogin: '20 Apr 2026' },
  { id: 'U005', name: 'Beximco Garments',      email: 'beximco@textile.com',      role: 'manufacturer', company: 'Beximco Garments Ltd',    country: 'Bangladesh',  joined: '01 Mar 2025', status: 'Active',    lastLogin: '19 Apr 2026' },
  { id: 'U006', name: 'Bureau Veritas',        email: 'bv@textile.com',           role: 'auditor',      company: 'Bureau Veritas Group',   country: 'France',      joined: '10 Mar 2025', status: 'Active',    lastLogin: '18 Apr 2026' },
  { id: 'U007', name: 'M&S Sourcing',          email: 'ms@textile.com',           role: 'brand',        company: 'Marks & Spencer',        country: 'UK',          joined: '15 Mar 2025', status: 'Suspended', lastLogin: '10 Apr 2026' },
  { id: 'U008', name: 'Arvind Mills',          email: 'arvind@textile.com',       role: 'manufacturer', company: 'Arvind Ltd',              country: 'India',       joined: '20 Mar 2025', status: 'Pending',   lastLogin: '—' },
  { id: 'U009', name: 'Intertek Testing',      email: 'intertek@textile.com',     role: 'auditor',      company: 'Intertek Group',         country: 'UK',          joined: '25 Mar 2025', status: 'Pending',   lastLogin: '—' },
  { id: 'U010', name: 'Primark Buying',        email: 'primark@textile.com',      role: 'brand',        company: 'Primark Ltd',            country: 'Ireland',     joined: '01 Apr 2025', status: 'Active',    lastLogin: '17 Apr 2026' },
];

const ROLE_TABS = ['All', 'brand', 'manufacturer', 'auditor'];
const STATUS_CFG = {
  Active:    { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  Suspended: { cls: 'bg-red-500/20 text-red-300 border-red-500/40',            icon: XCircle    },
  Pending:   { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40',      icon: Clock      },
};
const ROLE_CFG = {
  admin:        'bg-purple-500/20 text-purple-300 border-purple-500/40',
  brand:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  manufacturer: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  auditor:      'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

export default function AdminUsers() {
  const [roleTab,   setRoleTab]   = useState('All');
  const [search,    setSearch]    = useState('');
  const [statuses,  setStatuses]  = useState({});
  const [expanded,  setExpanded]  = useState(null);

  const getStatus = (id, seed) => statuses[id] ?? seed;
  const setStatus = (id, val) => setStatuses(p => ({ ...p, [id]: val }));

  const users = SEED_USERS
    .map(u => ({ ...u, status: getStatus(u.id, u.status) }))
    .filter(u => (roleTab === 'All' || u.role === roleTab) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));

  const counts = { total: SEED_USERS.length, active: SEED_USERS.filter(u => getStatus(u.id, u.status) === 'Active').length, pending: SEED_USERS.filter(u => getStatus(u.id, u.status) === 'Pending').length, suspended: SEED_USERS.filter(u => getStatus(u.id, u.status) === 'Suspended').length };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage platform users across all roles</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Invite User
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Total Users', val: counts.total, color: 'text-white' }, { label: 'Active', val: counts.active, color: 'text-emerald-400' }, { label: 'Pending Approval', val: counts.pending, color: 'text-amber-400' }, { label: 'Suspended', val: counts.suspended, color: 'text-red-400' }].map(k => (
          <Card key={k.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Role tabs */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60" />
        </div>
        <div className="flex gap-2">
          {ROLE_TABS.map(t => (
            <button key={t} onClick={() => setRoleTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${roleTab === t ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  {['User', 'Email', 'Role', 'Company', 'Country', 'Joined', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const scfg = STATUS_CFG[u.status] || STATUS_CFG.Active;
                  return (
                    <React.Fragment key={u.id}>
                      <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-bold flex-shrink-0">{u.name[0]}</div>
                            <span className="text-white font-medium whitespace-nowrap">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${ROLE_CFG[u.role]}`}>{u.role}</span></td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{u.company}</td>
                        <td className="px-4 py-3 text-slate-400">{u.country}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{u.joined}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{u.lastLogin}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${scfg.cls}`}>
                            <scfg.icon className="w-3 h-3" />{u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            {u.status === 'Pending'   && <button onClick={() => setStatus(u.id, 'Active')}    className="px-2 py-1 text-xs rounded bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-600/30">Approve</button>}
                            {u.status === 'Active'    && <button onClick={() => setStatus(u.id, 'Suspended')} className="px-2 py-1 text-xs rounded bg-red-600/20 text-red-300 border border-red-600/40 hover:bg-red-600/30">Suspend</button>}
                            {u.status === 'Suspended' && <button onClick={() => setStatus(u.id, 'Active')}    className="px-2 py-1 text-xs rounded bg-teal-600/20 text-teal-300 border border-teal-600/40 hover:bg-teal-600/30">Reactivate</button>}
                          </div>
                        </td>
                      </tr>
                      {expanded === u.id && (
                        <tr className="border-b border-slate-700/50">
                          <td colSpan={9} className="px-6 py-4 bg-slate-900/50">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div><span className="text-slate-500">User ID: </span><span className="text-slate-300 font-mono">{u.id}</span></div>
                              <div><span className="text-slate-500">Role: </span><span className="text-slate-300 capitalize">{u.role}</span></div>
                              <div><span className="text-slate-500">Status: </span><span className="text-slate-300">{u.status}</span></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
