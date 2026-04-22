import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PO_DATA = [
  {
    po: 'PO-AW27-4812', buyer: 'Zara', initials: 'ZR', color: 'bg-pink-600', season: 'AW2027',
    value: 489200, qty: 12400, delivery: '15 Oct 2027', status: 'Active', styles: 4,
    breakdown: [
      { style: 'ZR-AW27-JK001', desc: 'Wool Blend Jacket', cat: 'Outerwear', qty: 800, fob: 24.50, delivery: '28 Feb 2027', status: 'Completed' },
      { style: 'ZR-AW27-SW002', desc: 'Cotton Fleece Sweatshirt', cat: 'Tops', qty: 1200, fob: 12.80, delivery: '10 Mar 2027', status: 'Completed' },
      { style: 'ZR-AW27-TR003', desc: 'Polyester Twill Trousers', cat: 'Bottoms', qty: 700, fob: 18.20, delivery: '30 Mar 2027', status: 'Shipped' },
      { style: 'ZR-AW27-DRS004', desc: 'Viscose Satin Dress', cat: 'Dresses', qty: 400, fob: 22.10, delivery: '10 May 2027', status: 'In Production' },
    ],
  },
  {
    po: 'PO-AW27-3991', buyer: 'H&M Group', initials: 'HM', color: 'bg-red-600', season: 'AW2027',
    value: 298400, qty: 8600, delivery: '20 Sep 2027', status: 'Active', styles: 3,
    breakdown: [
      { style: 'HM-AW27-PK001', desc: 'Nylon Ripstop Parka', cat: 'Outerwear', qty: 800, fob: 21.00, delivery: '15 Apr 2027', status: 'QC' },
      { style: 'HM-AW27-CN002', desc: 'Organic Cotton Cardigan', cat: 'Knitwear', qty: 900, fob: 16.40, delivery: '20 Apr 2027', status: 'In Production' },
      { style: 'HM-AW27-TR003', desc: 'Recycled Poly Trousers', cat: 'Bottoms', qty: 700, fob: 15.60, delivery: '25 Apr 2027', status: 'In Production' },
    ],
  },
  {
    po: 'PO-AW27-5100', buyer: 'M&S', initials: 'MS', color: 'bg-green-700', season: 'AW2027',
    value: 724600, qty: 15200, delivery: '01 Nov 2027', status: 'Active', styles: 5,
    breakdown: [
      { style: 'MS-AW27-CT001', desc: 'Merino Wool Coat', cat: 'Outerwear', qty: 600, fob: 48.50, delivery: '30 Apr 2027', status: 'In Production' },
      { style: 'MS-AW27-SW002', desc: 'Cotton Modal Sweater', cat: 'Knitwear', qty: 1200, fob: 19.20, delivery: '05 May 2027', status: 'In Production' },
      { style: 'MS-AW27-TR003', desc: 'Cotton Chino Trousers', cat: 'Bottoms', qty: 900, fob: 17.80, delivery: '15 May 2027', status: 'Pending Start' },
      { style: 'MS-AW27-BL004', desc: 'Silk Blend Blouse', cat: 'Tops', qty: 800, fob: 26.00, delivery: '20 May 2027', status: 'Pending Start' },
      { style: 'MS-AW27-JN005', desc: 'Denim Slim Jean', cat: 'Bottoms', qty: 1100, fob: 22.50, delivery: '30 May 2027', status: 'Pending Start' },
    ],
  },
  {
    po: 'PO-SS27-2201', buyer: 'Zara', initials: 'ZR', color: 'bg-pink-600', season: 'SS2027',
    value: 312000, qty: 9800, delivery: '01 Mar 2027', status: 'Completed', styles: 3,
    breakdown: [
      { style: 'ZR-SS27-TS001', desc: 'Linen T-Shirt', cat: 'Tops', qty: 3200, fob: 8.90, delivery: '01 Mar 2027', status: 'Completed' },
      { style: 'ZR-SS27-SH002', desc: 'Cotton Shorts', cat: 'Bottoms', qty: 3000, fob: 10.20, delivery: '01 Mar 2027', status: 'Completed' },
      { style: 'ZR-SS27-DR003', desc: 'Floral Midi Dress', cat: 'Dresses', qty: 3600, fob: 14.50, delivery: '01 Mar 2027', status: 'Completed' },
    ],
  },
  {
    po: 'PO-SS27-1890', buyer: 'H&M', initials: 'HM', color: 'bg-red-600', season: 'SS2027',
    value: 195000, qty: 6200, delivery: '15 Feb 2027', status: 'Completed', styles: 2,
    breakdown: [
      { style: 'HM-SS27-BK001', desc: 'Bamboo Bikini Set', cat: 'Swimwear', qty: 3000, fob: 16.00, delivery: '15 Feb 2027', status: 'Completed' },
      { style: 'HM-SS27-PL002', desc: 'Linen Playsuit', cat: 'Dresses', qty: 3200, fob: 14.80, delivery: '15 Feb 2027', status: 'Completed' },
    ],
  },
];

const STATUS_COLORS = {
  Active: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  Completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Pending Confirmation': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

const ROW_STATUS_COLORS = {
  Completed: 'text-emerald-400', Shipped: 'text-blue-400', QC: 'text-amber-400',
  'In Production': 'text-teal-400', 'Pending Start': 'text-slate-500',
};

const FILTER_TABS = ['All', 'Active', 'Completed', 'Pending Confirmation'];

export default function ManufacturerOrders() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedPO, setExpandedPO] = useState(null);

  const filtered = activeFilter === 'All' ? PO_DATA : PO_DATA.filter(p => p.status === activeFilter);

  const activePOs = PO_DATA.filter(p => p.status === 'Active').length;
  const totalValue = PO_DATA.reduce((s, p) => s + p.value, 0);
  const avgLeadTime = '112 days';
  const onTimeDelivery = '96.4%';

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
            <p className="text-slate-400 text-sm">TCH Garments Pvt Ltd — Bangalore, India</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Active POs', value: activePOs, icon: ShoppingBag, color: 'text-teal-400' },
            { label: 'Total Value', value: `$${(totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Avg Lead Time', value: avgLeadTime, icon: Clock, color: 'text-amber-400' },
            { label: 'On-Time Delivery', value: onTimeDelivery, icon: TrendingUp, color: 'text-blue-400' },
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

        {/* PO Cards */}
        <div className="space-y-4">
          {filtered.map(po => (
            <Card key={po.po} className="bg-slate-800 border-slate-700 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpandedPO(expandedPO === po.po ? null : po.po)}
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Buyer logo */}
                  <div className={`w-12 h-12 rounded-xl ${po.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {po.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="font-mono font-semibold text-teal-400">{po.po}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[po.status] || ''}`}>{po.status}</Badge>
                      <span className="text-slate-500 text-xs">{po.season}</span>
                    </div>
                    <p className="text-white font-medium">{po.buyer}</p>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Value</p>
                      <p className="text-emerald-400 font-bold">${po.value.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Total Qty</p>
                      <p className="text-white font-semibold">{po.qty.toLocaleString()} pcs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Delivery</p>
                      <p className="text-slate-300">{po.delivery}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Styles</p>
                      <p className="text-white font-semibold">{po.styles}</p>
                    </div>
                  </div>
                  {expandedPO === po.po ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expandedPO === po.po && (
                <div className="border-t border-slate-700 px-5 py-4 bg-slate-900/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">Style Breakdown</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {['Style No', 'Description', 'Category', 'Qty', 'FOB Price', 'Delivery', 'Status'].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {po.breakdown.map(row => (
                          <tr key={row.style} className="border-b border-slate-800">
                            <td className="px-3 py-2 font-mono text-teal-400 text-xs">{row.style}</td>
                            <td className="px-3 py-2 text-slate-200">{row.desc}</td>
                            <td className="px-3 py-2 text-slate-400">{row.cat}</td>
                            <td className="px-3 py-2 text-white">{row.qty.toLocaleString()}</td>
                            <td className="px-3 py-2 text-emerald-400">${row.fob}</td>
                            <td className="px-3 py-2 text-slate-400">{row.delivery}</td>
                            <td className={`px-3 py-2 font-medium ${ROW_STATUS_COLORS[row.status] || 'text-slate-400'}`}>{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
