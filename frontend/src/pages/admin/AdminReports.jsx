import React, { useState } from 'react';
import { BarChart3, Download, CheckCircle, FileText, Package, Leaf, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const REPORTS = [
  {
    category: 'Traceability',
    icon: Package,
    iconColor: 'text-teal-400',
    items: [
      { name: 'Platform Traceability Summary — Q1 2027', date: '01 Apr 2027', type: 'PDF', size: '1.8 MB' },
      { name: 'Batch Traceability Report — AW2027',      date: '15 Mar 2027', type: 'XLSX', size: '2.4 MB' },
      { name: 'PO-Level Chain of Custody Report',        date: '01 Mar 2027', type: 'PDF', size: '3.1 MB' },
    ],
  },
  {
    category: 'Sustainability',
    icon: Leaf,
    iconColor: 'text-emerald-400',
    items: [
      { name: 'Carbon Footprint Report — 2026 Annual',   date: '01 Feb 2027', type: 'PDF', size: '4.2 MB' },
      { name: 'Water Usage & Recycling Summary',         date: '20 Feb 2027', type: 'PDF', size: '1.5 MB' },
      { name: 'Sustainable Material Sourcing Report',    date: '10 Mar 2027', type: 'XLSX', size: '0.9 MB' },
    ],
  },
  {
    category: 'Compliance & Audits',
    icon: CheckCircle,
    iconColor: 'text-amber-400',
    items: [
      { name: 'Audit Summary — All Manufacturers Q1 2027', date: '05 Apr 2027', type: 'PDF', size: '2.7 MB' },
      { name: 'Non-Conformance Register 2026-27',          date: '01 Apr 2027', type: 'XLSX', size: '0.6 MB' },
      { name: 'Certification Expiry Tracker',              date: '22 Apr 2027', type: 'PDF', size: '1.1 MB' },
    ],
  },
  {
    category: 'User & Platform',
    icon: Users,
    iconColor: 'text-blue-400',
    items: [
      { name: 'User Activity Report — Mar 2027',        date: '01 Apr 2027', type: 'PDF', size: '0.8 MB' },
      { name: 'Platform Usage Analytics — Q1 2027',    date: '05 Apr 2027', type: 'PDF', size: '1.3 MB' },
      { name: 'Role-Based Access Log Export',          date: '22 Apr 2027', type: 'CSV', size: '0.3 MB' },
    ],
  },
];

const TYPE_BADGE = {
  PDF:  'bg-red-500/20 text-red-300 border-red-500/40',
  XLSX: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  CSV:  'bg-blue-500/20 text-blue-300 border-blue-500/40',
};

export default function AdminReports() {
  const [downloaded, setDownloaded] = useState({});

  const handleDownload = (name) => setDownloaded(p => ({ ...p, [name]: true }));

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 mt-1">Platform-wide reports across traceability, sustainability, and compliance</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', val: REPORTS.reduce((n, c) => n + c.items.length, 0), color: 'text-white' },
          { label: 'Traceability', val: REPORTS[0].items.length, color: 'text-teal-400' },
          { label: 'Sustainability', val: REPORTS[1].items.length, color: 'text-emerald-400' },
          { label: 'Compliance', val: REPORTS[2].items.length, color: 'text-amber-400' },
        ].map(k => (
          <Card key={k.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <div className="space-y-6">
        {REPORTS.map(cat => {
          const Icon = cat.icon;
          return (
            <Card key={cat.category} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${cat.iconColor}`} />
                  {cat.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-700/50">
                  {cat.items.map(item => (
                    <div key={item.name} className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/20 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Generated {item.date} · {item.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${TYPE_BADGE[item.type]}`}>{item.type}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(item.name)}
                          className={`border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs px-3 ${downloaded[item.name] ? 'border-emerald-600/40 text-emerald-400' : ''}`}
                        >
                          {downloaded[item.name]
                            ? <><CheckCircle className="w-3 h-3 mr-1" />Downloaded</>
                            : <><Download className="w-3 h-3 mr-1" />Download</>}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
