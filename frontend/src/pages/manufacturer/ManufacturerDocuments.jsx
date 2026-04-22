import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Search, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DOCS = [
  // Certifications
  { name: 'GOTS Certificate', type: 'Certification', issued: '01 Jan 2025', expiry: '31 Dec 2025', issuer: 'Control Union', status: 'Expired', category: 'Certifications' },
  { name: 'SA8000 Social Audit', type: 'Certification', issued: '01 Jun 2024', expiry: '31 May 2026', issuer: 'SGS', status: 'Valid', category: 'Certifications' },
  { name: 'ISO 14001:2015', type: 'Certification', issued: '15 Mar 2024', expiry: '14 Mar 2027', issuer: 'Bureau Veritas', status: 'Valid', category: 'Certifications' },
  { name: 'OEKO-TEX Standard 100', type: 'Certification', issued: '01 Apr 2025', expiry: '31 Mar 2026', issuer: 'Intertek', status: 'Expiring Soon', category: 'Certifications' },
  { name: 'Higg FEM Level 2', type: 'Certification', issued: '01 Jan 2025', expiry: '31 Dec 2025', issuer: 'Higg Co', status: 'Expired', category: 'Certifications' },
  { name: 'Sedex SMETA 4-Pillar', type: 'Certification', issued: '01 Sep 2024', expiry: '31 Aug 2026', issuer: 'Sedex', status: 'Valid', category: 'Certifications' },
  // Test Reports
  { name: 'AW2027 Fabric Test Report', type: 'Test Report', issued: 'Mar 2027', expiry: null, issuer: 'SGS', status: 'Valid', category: 'Test Reports' },
  { name: 'AW2027 Chemical Test Report', type: 'Test Report', issued: 'Feb 2027', expiry: null, issuer: 'Intertek', status: 'Valid', category: 'Test Reports' },
  { name: 'SS2027 Shrinkage Test', type: 'Test Report', issued: 'Nov 2026', expiry: null, issuer: 'Bureau Veritas', status: 'Valid', category: 'Test Reports' },
  // Shipping Docs
  { name: 'Packing List PO-AW27-4812', type: 'Shipping Doc', issued: 'Mar 2027', expiry: null, issuer: 'Internal', status: 'Valid', category: 'Shipping Docs' },
  { name: 'Commercial Invoice PO-SS27-2201', type: 'Shipping Doc', issued: 'Feb 2027', expiry: null, issuer: 'Internal', status: 'Valid', category: 'Shipping Docs' },
  { name: 'Bill of Lading SHP-001', type: 'Shipping Doc', issued: 'Mar 2027', expiry: null, issuer: 'Maersk', status: 'Valid', category: 'Shipping Docs' },
  // Commercial
  { name: 'Export License 2025-26', type: 'Commercial', issued: 'Apr 2025', expiry: '31 Mar 2026', issuer: 'DGFT India', status: 'Expiring Soon', category: 'Commercial' },
  { name: 'IEC Certificate', type: 'Commercial', issued: 'Jan 2018', expiry: null, issuer: 'DGFT India', status: 'Valid', category: 'Commercial' },
];

const STATUS_STYLES = {
  Valid: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle, iconColor: 'text-emerald-400' },
  'Expiring Soon': { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock, iconColor: 'text-amber-400' },
  Expired: { badge: 'bg-red-500/20 text-red-300 border-red-500/40', icon: XCircle, iconColor: 'text-red-400' },
  'Pending Renewal': { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: AlertCircle, iconColor: 'text-slate-400' },
};

const TYPE_BADGE = {
  Certification: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  'Test Report': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Shipping Doc': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Commercial: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
};

const FILTER_TABS = ['All', 'Certifications', 'Test Reports', 'Shipping Docs', 'Commercial'];

export default function ManufacturerDocuments() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = DOCS.filter(doc => {
    const matchesTab = activeTab === 'All' || doc.category === activeTab;
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.issuer.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalDocs = DOCS.length;
  const validCerts = DOCS.filter(d => d.category === 'Certifications' && d.status === 'Valid').length;
  const expiringSoon = DOCS.filter(d => d.status === 'Expiring Soon').length;
  const expired = DOCS.filter(d => d.status === 'Expired').length;

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Documents</h1>
            <p className="text-slate-400 text-sm">TCH Garments Pvt Ltd — Bangalore, India</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: totalDocs, color: 'text-teal-400' },
            { label: 'Valid Certs', value: validCerts, color: 'text-emerald-400' },
            { label: 'Expiring Soon', value: expiringSoon, color: 'text-amber-400' },
            { label: 'Expired', value: expired, color: 'text-red-400' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by name or issuing body..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeTab === tab
                  ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-slate-500 text-sm">{filtered.length} document{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const statusStyle = STATUS_STYLES[doc.status] || STATUS_STYLES['Pending Renewal'];
            const StatusIcon = statusStyle.icon;
            return (
              <Card key={doc.name} className="bg-slate-800 border-slate-700 flex flex-col">
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight">{doc.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{doc.issuer}</p>
                    </div>
                    <StatusIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusStyle.iconColor}`} />
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`text-xs ${TYPE_BADGE[doc.type] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>
                      {doc.type}
                    </Badge>
                    <Badge className={`text-xs ${statusStyle.badge}`}>{doc.status}</Badge>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issued</span>
                      <span className="text-slate-300">{doc.issued}</span>
                    </div>
                    {doc.expiry && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expires</span>
                        <span className={doc.status === 'Expired' ? 'text-red-400' : doc.status === 'Expiring Soon' ? 'text-amber-400' : 'text-slate-300'}>
                          {doc.expiry}
                        </span>
                      </div>
                    )}
                    {!doc.expiry && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Validity</span>
                        <span className="text-slate-400">Permanent / N/A</span>
                      </div>
                    )}
                  </div>

                  {/* Divider + Download */}
                  <div className="mt-auto pt-3 border-t border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No documents match your search.</p>
          </div>
        )}

      </div>
    </div>
  );
}
