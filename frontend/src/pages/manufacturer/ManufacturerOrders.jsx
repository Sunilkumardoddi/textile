import React, { useState } from 'react';
import {
  ShoppingBag, ChevronDown, ChevronUp, DollarSign, Clock, TrendingUp,
  GitBranch, Plus, Pencil, Trash2, ChevronRight, X, Check, Filter,
  Building2, MapPin, Leaf, Droplets, Wind, Recycle, Award, Zap, Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── PO Seed Data ─────────────────────────────────────────────────────────────

const PO_DATA = [
  {
    po: 'PO-AW27-4812', buyer: 'Zara', initials: 'ZR', color: 'bg-pink-600', season: 'AW2027',
    value: 489200, qty: 12400, delivery: '15 Oct 2027', status: 'Active', styles: 4,
    breakdown: [
      { style: 'ZR-AW27-JK001', desc: 'Wool Blend Jacket',        cat: 'Outerwear', qty: 800,  fob: 24.50, delivery: '28 Feb 2027', status: 'Completed'    },
      { style: 'ZR-AW27-SW002', desc: 'Cotton Fleece Sweatshirt', cat: 'Tops',      qty: 1200, fob: 12.80, delivery: '10 Mar 2027', status: 'Completed'    },
      { style: 'ZR-AW27-TR003', desc: 'Polyester Twill Trousers', cat: 'Bottoms',   qty: 700,  fob: 18.20, delivery: '30 Mar 2027', status: 'Shipped'      },
      { style: 'ZR-AW27-DRS004', desc: 'Viscose Satin Dress',     cat: 'Dresses',   qty: 400,  fob: 22.10, delivery: '10 May 2027', status: 'In Production'},
    ],
  },
  {
    po: 'PO-AW27-3991', buyer: 'H&M Group', initials: 'HM', color: 'bg-red-600', season: 'AW2027',
    value: 298400, qty: 8600, delivery: '20 Sep 2027', status: 'Active', styles: 3,
    breakdown: [
      { style: 'HM-AW27-PK001', desc: 'Nylon Ripstop Parka',       cat: 'Outerwear', qty: 800, fob: 21.00, delivery: '15 Apr 2027', status: 'QC'           },
      { style: 'HM-AW27-CN002', desc: 'Organic Cotton Cardigan',   cat: 'Knitwear',  qty: 900, fob: 16.40, delivery: '20 Apr 2027', status: 'In Production'},
      { style: 'HM-AW27-TR003', desc: 'Recycled Poly Trousers',    cat: 'Bottoms',   qty: 700, fob: 15.60, delivery: '25 Apr 2027', status: 'In Production'},
    ],
  },
  {
    po: 'PO-AW27-5100', buyer: 'M&S', initials: 'MS', color: 'bg-green-700', season: 'AW2027',
    value: 724600, qty: 15200, delivery: '01 Nov 2027', status: 'Active', styles: 5,
    breakdown: [
      { style: 'MS-AW27-CT001', desc: 'Merino Wool Coat',       cat: 'Outerwear', qty: 600,  fob: 48.50, delivery: '30 Apr 2027', status: 'In Production'   },
      { style: 'MS-AW27-SW002', desc: 'Cotton Modal Sweater',   cat: 'Knitwear',  qty: 1200, fob: 19.20, delivery: '05 May 2027', status: 'In Production'   },
      { style: 'MS-AW27-TR003', desc: 'Cotton Chino Trousers',  cat: 'Bottoms',   qty: 900,  fob: 17.80, delivery: '15 May 2027', status: 'Pending Start'   },
      { style: 'MS-AW27-BL004', desc: 'Silk Blend Blouse',      cat: 'Tops',      qty: 800,  fob: 26.00, delivery: '20 May 2027', status: 'Pending Start'   },
      { style: 'MS-AW27-JN005', desc: 'Denim Slim Jean',        cat: 'Bottoms',   qty: 1100, fob: 22.50, delivery: '30 May 2027', status: 'Pending Start'   },
    ],
  },
  {
    po: 'PO-SS27-2201', buyer: 'Zara', initials: 'ZR', color: 'bg-pink-600', season: 'SS2027',
    value: 312000, qty: 9800, delivery: '01 Mar 2027', status: 'Completed', styles: 3,
    breakdown: [
      { style: 'ZR-SS27-TS001', desc: 'Linen T-Shirt',    cat: 'Tops',    qty: 3200, fob: 8.90,  delivery: '01 Mar 2027', status: 'Completed'},
      { style: 'ZR-SS27-SH002', desc: 'Cotton Shorts',    cat: 'Bottoms', qty: 3000, fob: 10.20, delivery: '01 Mar 2027', status: 'Completed'},
      { style: 'ZR-SS27-DR003', desc: 'Floral Midi Dress',cat: 'Dresses', qty: 3600, fob: 14.50, delivery: '01 Mar 2027', status: 'Completed'},
    ],
  },
  {
    po: 'PO-SS27-1890', buyer: 'H&M', initials: 'HM', color: 'bg-red-600', season: 'SS2027',
    value: 195000, qty: 6200, delivery: '15 Feb 2027', status: 'Completed', styles: 2,
    breakdown: [
      { style: 'HM-SS27-BK001', desc: 'Bamboo Bikini Set', cat: 'Swimwear', qty: 3000, fob: 16.00, delivery: '15 Feb 2027', status: 'Completed'},
      { style: 'HM-SS27-PL002', desc: 'Linen Playsuit',    cat: 'Dresses',  qty: 3200, fob: 14.80, delivery: '15 Feb 2027', status: 'Completed'},
    ],
  },
  {
    po: 'PO-AW28-1001', buyer: 'Primark', initials: 'PK', color: 'bg-indigo-600', season: 'AW2028',
    value: 182400, qty: 11000, delivery: '01 Oct 2028', status: 'Pending Confirmation', styles: 3,
    breakdown: [
      { style: 'PK-AW28-HO001', desc: 'Fleece Hoodie',  cat: 'Tops',      qty: 4000, fob: 9.80,  delivery: '01 Sep 2028', status: 'Pending Confirmation'},
      { style: 'PK-AW28-JG002', desc: 'Jogger Pants',   cat: 'Bottoms',   qty: 4000, fob: 8.20,  delivery: '01 Sep 2028', status: 'Pending Confirmation'},
      { style: 'PK-AW28-JK003', desc: 'Padded Jacket',  cat: 'Outerwear', qty: 3000, fob: 18.60, delivery: '15 Sep 2028', status: 'Pending Confirmation'},
    ],
  },
];

// ── Supply-Chain Seed Trees ───────────────────────────────────────────────────

const INITIAL_SC_TREES = {
  'PO-AW27-4812': {
    id: 'root', tier: 'Brand', name: 'Zara (Inditex)', location: 'Madrid, Spain',
    role: 'Buyer / Brand Owner', status: 'Active',
    children: [{
      id: 't1-001', tier: 'Tier 1', name: 'TCH Garments Pvt Ltd', location: 'Bangalore, India',
      role: 'CMT Manufacturer', status: 'Active',
      children: [
        {
          id: 't2-001', tier: 'Tier 2', name: 'Arvind Mills Ltd', location: 'Ahmedabad, India',
          role: 'Fabric Weaving & Dyeing', status: 'Certified',
          children: [{
            id: 't3-001', tier: 'Tier 3', name: 'Shree Ram Fibres', location: 'Surat, India',
            role: 'Yarn Spinning', status: 'Partial',
            children: [{
              id: 't4-001', tier: 'Tier 4', name: 'Multiple Cotton Farms', location: 'Gujarat / Rajasthan, India',
              role: 'Raw Cotton Farming', status: 'Unverified', children: []
            }]
          }]
        },
        {
          id: 't2-002', tier: 'Tier 2', name: 'Sutlej Textiles', location: 'Bhilwara, India',
          role: 'Fabric Processing', status: 'Certified', children: []
        },
      ]
    }]
  },
  'PO-AW27-3991': {
    id: 'root', tier: 'Brand', name: 'H&M Group', location: 'Stockholm, Sweden',
    role: 'Buyer / Brand Owner', status: 'Active',
    children: [{
      id: 't1-001', tier: 'Tier 1', name: 'TCH Garments Pvt Ltd', location: 'Bangalore, India',
      role: 'CMT Manufacturer', status: 'Active',
      children: [
        {
          id: 't2-001', tier: 'Tier 2', name: 'Vardhman Textiles', location: 'Ludhiana, India',
          role: 'Fabric Weaving', status: 'Certified',
          children: [{
            id: 't3-001', tier: 'Tier 3', name: 'Nahar Spinning', location: 'Ludhiana, India',
            role: 'Yarn Spinning', status: 'Certified',
            children: [{
              id: 't4-001', tier: 'Tier 4', name: 'Organic Cotton Cooperatives', location: 'Punjab, India',
              role: 'BCI Cotton Farming', status: 'Partial', children: []
            }]
          }]
        },
      ]
    }]
  },
  'PO-AW27-5100': {
    id: 'root', tier: 'Brand', name: 'Marks & Spencer', location: 'London, UK',
    role: 'Buyer / Brand Owner', status: 'Active',
    children: [{
      id: 't1-001', tier: 'Tier 1', name: 'TCH Garments Pvt Ltd', location: 'Bangalore, India',
      role: 'CMT Manufacturer', status: 'Active',
      children: [
        {
          id: 't2-001', tier: 'Tier 2', name: 'Raymond Ltd', location: 'Thane, India',
          role: 'Wool Fabric Milling', status: 'Certified',
          children: [{
            id: 't3-001', tier: 'Tier 3', name: 'Indo Wool Processors', location: 'Bikaner, India',
            role: 'Wool Scouring & Combing', status: 'Pending',
            children: [{
              id: 't4-001', tier: 'Tier 4', name: 'New Zealand Merino Farms', location: 'Canterbury, New Zealand',
              role: 'Merino Wool Farming', status: 'Certified', children: []
            }]
          }]
        },
        {
          id: 't2-002', tier: 'Tier 2', name: 'RSWM Ltd', location: 'Bhilwara, India',
          role: 'Yarn & Fabric Supply', status: 'Certified', children: []
        },
      ]
    }]
  },
  'PO-SS27-2201': {
    id: 'root', tier: 'Brand', name: 'Zara (Inditex)', location: 'Madrid, Spain',
    role: 'Buyer / Brand Owner', status: 'Active',
    children: [{
      id: 't1-001', tier: 'Tier 1', name: 'TCH Garments Pvt Ltd', location: 'Bangalore, India',
      role: 'CMT Manufacturer', status: 'Active',
      children: [
        {
          id: 't2-001', tier: 'Tier 2', name: 'Arvind Mills Ltd', location: 'Ahmedabad, India',
          role: 'Linen Fabric Processing', status: 'Certified',
          children: [{
            id: 't3-001', tier: 'Tier 3', name: 'Linen Fibre Processors', location: 'West Bengal, India',
            role: 'Flax / Linen Retting', status: 'Partial',
            children: [{
              id: 't4-001', tier: 'Tier 4', name: 'Flax Farms', location: 'Normandy, France',
              role: 'Flax Cultivation', status: 'Certified', children: []
            }]
          }]
        },
      ]
    }]
  },
  'PO-SS27-1890': {
    id: 'root', tier: 'Brand', name: 'H&M', location: 'Stockholm, Sweden',
    role: 'Buyer / Brand Owner', status: 'Active',
    children: [{
      id: 't1-001', tier: 'Tier 1', name: 'TCH Garments Pvt Ltd', location: 'Bangalore, India',
      role: 'CMT Manufacturer', status: 'Active',
      children: [
        {
          id: 't2-001', tier: 'Tier 2', name: 'Welspun India', location: 'Anjar, India',
          role: 'Bamboo / Cotton Fabric', status: 'Pending',
          children: [{
            id: 't3-001', tier: 'Tier 3', name: 'Bamboo Fibre Mills', location: 'Assam, India',
            role: 'Bamboo Fibre Extraction', status: 'Partial', children: []
          }]
        },
      ]
    }]
  },
  'PO-AW28-1001': {
    id: 'root', tier: 'Brand', name: 'Primark', location: 'Dublin, Ireland',
    role: 'Buyer / Brand Owner', status: 'Active',
    children: [{
      id: 't1-001', tier: 'Tier 1', name: 'TCH Garments Pvt Ltd', location: 'Bangalore, India',
      role: 'CMT Manufacturer', status: 'Active',
      children: [
        {
          id: 't2-001', tier: 'Tier 2', name: 'Indo Count Industries', location: 'Kolhapur, India',
          role: 'Fleece & Jersey Fabric', status: 'Certified',
          children: [{
            id: 't3-001', tier: 'Tier 3', name: 'Bombay Rayon Fashions', location: 'Mumbai, India',
            role: 'Yarn Dyeing & Finishing', status: 'Partial',
            children: [{
              id: 't4-001', tier: 'Tier 4', name: 'Polyester Chip Suppliers', location: 'Reliance Complex, Gujarat',
              role: 'Recycled PET Production', status: 'Unverified', children: []
            }]
          }]
        },
      ]
    }]
  },
};

// ── Sustainability Seed Data (per PO, keyed by node ID) ──────────────────────
// carbon/water/energy are per-garment contributions; pct values 0-100

const SUST_DATA = {
  'PO-AW27-4812': {
    chainScore: 76,
    nodes: {
      'root':   { carbon: 0.3,  water: 8,   energy: 2,    chemPct: 100, wastePct: 85, score: 92, certs: ['ISO 14001','SA8000'],             sdgs: [8,12,13] },
      't1-001': { carbon: 2.4,  water: 38,  energy: 18,   chemPct: 94,  wastePct: 78, score: 82, certs: ['SA8000','OEKO-TEX','ISO 9001'],   sdgs: [8,12]    },
      't2-001': { carbon: 3.2,  water: 64,  energy: 28,   chemPct: 88,  wastePct: 72, score: 74, certs: ['GOTS','BCI'],                     sdgs: [6,12,15] },
      't2-002': { carbon: 1.8,  water: 42,  energy: 14,   chemPct: 91,  wastePct: 80, score: 79, certs: ['OEKO-TEX'],                       sdgs: [12]      },
      't3-001': { carbon: 0.5,  water: 28,  energy: 6,    chemPct: 76,  wastePct: 55, score: 58, certs: ['BCI'],                            sdgs: [6,15]    },
      't4-001': { carbon: 0.2,  water: 6,   energy: 0.5,  chemPct: 65,  wastePct: 40, score: 44, certs: [],                                 sdgs: [15]      },
    },
  },
  'PO-AW27-3991': {
    chainScore: 82,
    nodes: {
      'root':   { carbon: 0.2,  water: 6,   energy: 1.5,  chemPct: 100, wastePct: 88, score: 95, certs: ['ISO 14001'],                      sdgs: [8,12,13] },
      't1-001': { carbon: 2.1,  water: 34,  energy: 16,   chemPct: 96,  wastePct: 82, score: 86, certs: ['SA8000','OEKO-TEX'],              sdgs: [8,12]    },
      't2-001': { carbon: 2.8,  water: 58,  energy: 24,   chemPct: 92,  wastePct: 76, score: 80, certs: ['GOTS','BCI','OEKO-TEX'],          sdgs: [6,12,15] },
      't3-001': { carbon: 0.4,  water: 22,  energy: 5,    chemPct: 88,  wastePct: 65, score: 72, certs: ['BCI','GRS'],                      sdgs: [6,15]    },
      't4-001': { carbon: 0.15, water: 5,   energy: 0.3,  chemPct: 82,  wastePct: 60, score: 68, certs: ['BCI'],                            sdgs: [15]      },
    },
  },
  'PO-AW27-5100': {
    chainScore: 71,
    nodes: {
      'root':   { carbon: 0.4,  water: 10,  energy: 2.5,  chemPct: 100, wastePct: 90, score: 93, certs: ['ISO 14001','SA8000'],             sdgs: [8,12,13] },
      't1-001': { carbon: 3.1,  water: 46,  energy: 22,   chemPct: 91,  wastePct: 74, score: 79, certs: ['SA8000','OEKO-TEX'],              sdgs: [8,12]    },
      't2-001': { carbon: 4.2,  water: 72,  energy: 32,   chemPct: 84,  wastePct: 68, score: 68, certs: ['RWS','ISO 9001'],                 sdgs: [6,12,15] },
      't2-002': { carbon: 1.6,  water: 36,  energy: 12,   chemPct: 89,  wastePct: 76, score: 75, certs: ['OEKO-TEX'],                       sdgs: [12]      },
      't3-001': { carbon: 1.2,  water: 44,  energy: 8,    chemPct: 72,  wastePct: 50, score: 54, certs: [],                                 sdgs: [15]      },
      't4-001': { carbon: 0.1,  water: 3,   energy: 0.2,  chemPct: 95,  wastePct: 88, score: 87, certs: ['RWS','ZQ Merino'],               sdgs: [15]      },
    },
  },
  'PO-SS27-2201': {
    chainScore: 88,
    nodes: {
      'root':   { carbon: 0.2,  water: 6,   energy: 1.5,  chemPct: 100, wastePct: 90, score: 95, certs: ['ISO 14001','SA8000'],             sdgs: [8,12,13] },
      't1-001': { carbon: 1.8,  water: 28,  energy: 14,   chemPct: 97,  wastePct: 86, score: 90, certs: ['SA8000','OEKO-TEX','ISO 9001'],   sdgs: [8,12]    },
      't2-001': { carbon: 2.2,  water: 50,  energy: 20,   chemPct: 94,  wastePct: 84, score: 86, certs: ['GOTS','OEKO-TEX','EU Flax'],      sdgs: [6,12,15] },
      't3-001': { carbon: 0.3,  water: 18,  energy: 4,    chemPct: 80,  wastePct: 65, score: 70, certs: ['EU Flax'],                        sdgs: [6,15]    },
      't4-001': { carbon: 0.1,  water: 4,   energy: 0.4,  chemPct: 88,  wastePct: 72, score: 78, certs: ['EU Flax','Organic'],              sdgs: [15]      },
    },
  },
  'PO-SS27-1890': {
    chainScore: 67,
    nodes: {
      'root':   { carbon: 0.2,  water: 5,   energy: 1.2,  chemPct: 100, wastePct: 88, score: 94, certs: ['ISO 14001'],                      sdgs: [8,12,13] },
      't1-001': { carbon: 2.0,  water: 32,  energy: 16,   chemPct: 92,  wastePct: 76, score: 80, certs: ['SA8000','OEKO-TEX'],              sdgs: [8,12]    },
      't2-001': { carbon: 3.6,  water: 68,  energy: 30,   chemPct: 78,  wastePct: 60, score: 62, certs: ['OEKO-TEX'],                       sdgs: [6,12]    },
      't3-001': { carbon: 0.8,  water: 36,  energy: 10,   chemPct: 64,  wastePct: 42, score: 48, certs: [],                                 sdgs: [15]      },
    },
  },
  'PO-AW28-1001': {
    chainScore: 61,
    nodes: {
      'root':   { carbon: 0.3,  water: 8,   energy: 2,    chemPct: 100, wastePct: 85, score: 90, certs: ['ISO 14001'],                      sdgs: [8,12,13] },
      't1-001': { carbon: 2.6,  water: 40,  energy: 20,   chemPct: 90,  wastePct: 72, score: 76, certs: ['SA8000','OEKO-TEX'],              sdgs: [8,12]    },
      't2-001': { carbon: 3.8,  water: 58,  energy: 26,   chemPct: 82,  wastePct: 62, score: 65, certs: ['OEKO-TEX','GRS'],                 sdgs: [6,12]    },
      't3-001': { carbon: 1.4,  water: 48,  energy: 14,   chemPct: 68,  wastePct: 48, score: 52, certs: ['GRS'],                            sdgs: [12,13]   },
      't4-001': { carbon: 0.6,  water: 16,  energy: 4,    chemPct: 54,  wastePct: 32, score: 38, certs: [],                                 sdgs: [13]      },
    },
  },
};

// ── Tree Helpers ──────────────────────────────────────────────────────────────

const updateNode = (node, id, data) => {
  if (node.id === id) return { ...node, ...data };
  return { ...node, children: node.children.map(c => updateNode(c, id, data)) };
};

const deleteNode = (node, id) => ({
  ...node,
  children: node.children.filter(c => c.id !== id).map(c => deleteNode(c, id)),
});

const addChild = (node, parentId, child) => {
  if (node.id === parentId) return { ...node, children: [...node.children, child] };
  return { ...node, children: node.children.map(c => addChild(c, parentId, child)) };
};

let nodeCounter = 1000;
const newId = () => `node-${++nodeCounter}`;

const flattenTree = (node, acc = []) => {
  acc.push(node);
  node.children.forEach(c => flattenTree(c, acc));
  return acc;
};

// ── Config ────────────────────────────────────────────────────────────────────

const TIER_CFG = {
  'Brand':  { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300', line: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  'Tier 1': { bg: 'bg-teal-500/20',   border: 'border-teal-500/40',   text: 'text-teal-300',   line: 'border-teal-500/30',   badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40'       },
  'Tier 2': { bg: 'bg-emerald-500/20',border: 'border-emerald-500/40',text: 'text-emerald-300',line: 'border-emerald-500/30',badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'},
  'Tier 3': { bg: 'bg-amber-500/20',  border: 'border-amber-500/40',  text: 'text-amber-300',  line: 'border-amber-500/30',  badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'    },
  'Tier 4': { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-300', line: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
};

const TIER_OPTIONS    = ['Brand', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
const STATUS_OPTIONS  = ['Active', 'Certified', 'Pending', 'Partial', 'Unverified', 'Gap'];
const STATUS_COLORS   = {
  Active: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  Completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Pending Confirmation': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};
const ROW_STATUS_COLORS = {
  Completed: 'text-emerald-400', Shipped: 'text-blue-400', QC: 'text-amber-400',
  'In Production': 'text-teal-400', 'Pending Start': 'text-slate-500',
  'Pending Confirmation': 'text-amber-400',
};

const BRANDS = ['All', ...Array.from(new Set(PO_DATA.map(p => p.buyer)))];
const STATUS_TABS = ['All', 'Active', 'Completed', 'Pending Confirmation'];

// ── Node Form (inline edit / create) ─────────────────────────────────────────

function NodeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="mt-2 p-3 rounded-lg bg-slate-700 border border-slate-600 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Name</label>
          <Input value={form.name} onChange={e => set('name', e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Location</label>
          <Input value={form.location} onChange={e => set('location', e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Role</label>
          <Input value={form.role} onChange={e => set('role', e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Tier</label>
          <Select value={form.tier} onValueChange={v => set('tier', v)}>
            <SelectTrigger className="h-7 text-xs bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {TIER_OPTIONS.map(t => <SelectItem key={t} value={t} className="text-xs text-white">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Status</label>
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="h-7 text-xs bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs text-white">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded border border-slate-600 text-slate-400 hover:text-white">
          <X className="w-3 h-3" /> Cancel
        </button>
        <button onClick={() => onSave(form)}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-teal-600/30 border border-teal-500/50 text-teal-300 hover:bg-teal-600/50">
          <Check className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  );
}

// ── Tree Node ─────────────────────────────────────────────────────────────────

function TreeNode({ node, isRoot, onUpdate, onDelete, onAddChild, depth = 0 }) {
  const [expanded, setExpanded]       = useState(true);
  const [editing, setEditing]         = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [confirmDel, setConfirmDel]   = useState(false);

  const cfg = TIER_CFG[node.tier] || TIER_CFG['Tier 4'];
  const statusCfg = {
    Active:     'bg-teal-500/20 text-teal-300 border-teal-500/40',
    Certified:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Pending:    'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Partial:    'bg-orange-500/20 text-orange-300 border-orange-500/40',
    Unverified: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
    Gap:        'bg-red-500/20 text-red-300 border-red-500/40',
  };

  const handleSaveEdit = (data) => {
    onUpdate(node.id, data);
    setEditing(false);
  };

  const handleAddChild = (data) => {
    onAddChild(node.id, { ...data, id: newId(), children: [] });
    setAddingChild(false);
  };

  const handleDelete = () => {
    if (confirmDel) { onDelete(node.id); } else { setConfirmDel(true); }
  };

  return (
    <div className={depth > 0 ? 'relative ml-6' : ''}>
      {/* Vertical connector line from parent */}
      {depth > 0 && (
        <span className="absolute left-[-16px] top-0 bottom-0 w-px bg-slate-600/60" />
      )}

      <div className="relative">
        {/* Horizontal connector */}
        {depth > 0 && (
          <span className="absolute left-[-16px] top-5 w-4 h-px bg-slate-600/60" />
        )}

        {/* Node card */}
        <div className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border} mb-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Expand toggle */}
              {node.children.length > 0 ? (
                <button onClick={() => setExpanded(!expanded)}
                  className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-white">
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge className={`text-xs px-1.5 py-0 ${cfg.badge}`}>{node.tier}</Badge>
                  <span className="text-white font-medium text-sm truncate">{node.name}</span>
                  <Badge className={`text-xs px-1.5 py-0 border ${statusCfg[node.status] || statusCfg['Unverified']}`}>
                    {node.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{node.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />{node.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setAddingChild(!addingChild); setEditing(false); setConfirmDel(false); }}
                title="Add child node"
                className="p-1.5 rounded text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setEditing(!editing); setAddingChild(false); setConfirmDel(false); }}
                title="Edit node"
                className="p-1.5 rounded text-slate-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {!isRoot && (
                confirmDel ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-400">Sure?</span>
                    <button onClick={handleDelete}
                      className="p-1.5 rounded text-red-400 hover:bg-red-500/20">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDel(false)}
                      className="p-1.5 rounded text-slate-400 hover:bg-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleDelete}
                    title="Delete node"
                    className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <NodeForm
              initial={{ name: node.name, location: node.location, role: node.role, tier: node.tier, status: node.status }}
              onSave={handleSaveEdit}
              onCancel={() => setEditing(false)}
            />
          )}

          {/* Add child form */}
          {addingChild && (
            <NodeForm
              initial={{ name: '', location: '', role: '', tier: 'Tier 2', status: 'Pending' }}
              onSave={handleAddChild}
              onCancel={() => setAddingChild(false)}
            />
          )}
        </div>

        {/* Children */}
        {expanded && node.children.length > 0 && (
          <div className="relative">
            {node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                isRoot={false}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SC Map Modal ──────────────────────────────────────────────────────────────

function SCMapModal({ po, tree, onClose, onTreeChange }) {
  const handleUpdate = (id, data) => onTreeChange(updateNode(tree, id, data));
  const handleDelete = (id)       => onTreeChange(deleteNode(tree, id));
  const handleAddChild = (parentId, child) => onTreeChange(addChild(tree, parentId, child));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Supply Chain Map</h2>
              <p className="text-xs text-slate-400">{po.po} · {po.buyer} · {po.season}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
              {TIER_OPTIONS.map(t => (
                <span key={t} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${TIER_CFG[t].bg.replace('/20', '')} border ${TIER_CFG[t].border}`} />
                  {t}
                </span>
              ))}
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hint bar */}
        <div className="px-6 py-2 bg-slate-800/50 border-b border-slate-700 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Plus className="w-3 h-3 text-teal-400" /> Add child node</span>
          <span className="flex items-center gap-1"><Pencil className="w-3 h-3 text-blue-400" /> Edit node</span>
          <span className="flex items-center gap-1"><Trash2 className="w-3 h-3 text-red-400" /> Delete node</span>
          <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Expand / collapse</span>
        </div>

        {/* Tree */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <TreeNode
            node={tree}
            depth={0}
            isRoot={true}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
          />
        </div>
      </div>
    </div>
  );
}

// ── Sustainability Modal ──────────────────────────────────────────────────────

const SCORE_COLOR = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
const SCORE_BAR   = (s) => s >= 80 ? 'bg-emerald-500'  : s >= 60 ? 'bg-amber-500'   : 'bg-red-500';
const SDG_LABELS  = { 6:'Clean Water',8:'Decent Work',12:'Resp. Consumption',13:'Climate Action',15:'Life on Land' };

function SustainabilityModal({ po, tree, sustData, onClose }) {
  const nodes     = flattenTree(tree);
  const chainData = sustData || { chainScore: 0, nodes: {} };

  const totalCarbon = nodes.reduce((s, n) => s + (chainData.nodes[n.id]?.carbon || 0), 0);
  const totalWater  = nodes.reduce((s, n) => s + (chainData.nodes[n.id]?.water  || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Chain Sustainability Data</h2>
              <p className="text-xs text-slate-400">{po.po} · {po.buyer} · {po.season}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chain summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Chain Score</p>
            <p className={`text-3xl font-bold ${SCORE_COLOR(chainData.chainScore)}`}>{chainData.chainScore}<span className="text-lg">/100</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Total Carbon / Garment</p>
            <p className="text-2xl font-bold text-slate-200">{totalCarbon.toFixed(1)}<span className="text-sm text-slate-400 ml-1">kg CO₂e</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Total Water / Garment</p>
            <p className="text-2xl font-bold text-blue-300">{totalWater.toFixed(0)}<span className="text-sm text-slate-400 ml-1">L</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Tiers Mapped</p>
            <p className="text-2xl font-bold text-teal-300">{nodes.length}</p>
          </div>
        </div>

        {/* Per-node cards */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          {nodes.map((node, idx) => {
            const cfg  = TIER_CFG[node.tier] || TIER_CFG['Tier 4'];
            const sust = chainData.nodes[node.id];

            return (
              <div key={node.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                {/* Node header */}
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/5">
                  <Badge className={`text-xs ${cfg.badge}`}>{node.tier}</Badge>
                  <span className="text-white font-semibold">{node.name}</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{node.location}
                  </span>
                  <span className="text-slate-500 text-xs ml-auto">{node.role}</span>
                </div>

                {sust ? (
                  <div className="px-4 py-3 space-y-3">
                    {/* Score bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Sustainability Score</span>
                        <span className={`font-bold ${SCORE_COLOR(sust.score)}`}>{sust.score}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700">
                        <div className={`h-2 rounded-full transition-all duration-500 ${SCORE_BAR(sust.score)}`}
                          style={{ width: `${sust.score}%` }} />
                      </div>
                    </div>

                    {/* KPI grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { icon: Wind,     label: 'Carbon',        val: `${sust.carbon} kg CO₂e`, color: 'text-slate-300'   },
                        { icon: Droplets, label: 'Water',          val: `${sust.water} L`,         color: 'text-blue-300'    },
                        { icon: Zap,      label: 'Energy',         val: `${sust.energy} kWh`,      color: 'text-yellow-300'  },
                        { icon: Award,    label: 'Chem Compliance',val: `${sust.chemPct}%`,         color: 'text-emerald-300' },
                        { icon: Recycle,  label: 'Waste Diverted', val: `${sust.wastePct}%`,        color: 'text-teal-300'    },
                      ].map(kpi => (
                        <div key={kpi.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                          <kpi.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${kpi.color}`} />
                          <p className={`text-sm font-bold ${kpi.color}`}>{kpi.val}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-tight">{kpi.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Certs + SDGs */}
                    <div className="flex flex-wrap items-center gap-4">
                      {sust.certs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-xs text-slate-500">Certs:</span>
                          {sust.certs.map(c => (
                            <span key={c}
                              className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {sust.sdgs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">SDGs:</span>
                          {sust.sdgs.map(n => (
                            <span key={n} title={SDG_LABELS[n] || `SDG ${n}`}
                              className="px-1.5 py-0.5 rounded text-xs bg-blue-500/15 border border-blue-500/30 text-blue-300 font-medium">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-4 text-center text-slate-500 text-sm italic">
                    No sustainability data recorded for this node yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ManufacturerOrders() {
  const [statusFilter, setStatusFilter]   = useState('All');
  const [brandFilter, setBrandFilter]     = useState('All');
  const [expandedPO, setExpandedPO]       = useState(null);
  const [confirmedPOs, setConfirmedPOs]   = useState(new Set());
  const [scModalPO, setScModalPO]         = useState(null);
  const [sustModalPO, setSustModalPO]     = useState(null);
  const [scTrees, setScTrees]             = useState(INITIAL_SC_TREES);

  const confirmPO   = (id)  => setConfirmedPOs(prev => new Set([...prev, id]));
  const getStatus   = (po)  => confirmedPOs.has(po.po) ? 'Active' : po.status;
  const withStatus  = PO_DATA.map(p => ({ ...p, status: getStatus(p) }));

  const filtered = withStatus.filter(p => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchBrand  = brandFilter  === 'All' || p.buyer  === brandFilter;
    return matchStatus && matchBrand;
  });

  const activePOs  = withStatus.filter(p => p.status === 'Active').length;
  const totalValue = PO_DATA.reduce((s, p) => s + p.value, 0);

  const activeSCPO   = scModalPO   ? PO_DATA.find(p => p.po === scModalPO)   : null;
  const activeSustPO = sustModalPO ? PO_DATA.find(p => p.po === sustModalPO) : null;

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
            { label: 'Total Active POs', value: activePOs,                           icon: ShoppingBag, color: 'text-teal-400'    },
            { label: 'Total Value',       value: `$${(totalValue/1000).toFixed(0)}K`, icon: DollarSign,  color: 'text-emerald-400' },
            { label: 'Avg Lead Time',     value: '112 days',                          icon: Clock,       color: 'text-amber-400'   },
            { label: 'On-Time Delivery',  value: '96.4%',                             icon: TrendingUp,  color: 'text-blue-400'    },
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
        <div className="flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map(tab => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  statusFilter === tab
                    ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                    : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Brand filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400 whitespace-nowrap">Filter by Brand:</span>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-44 h-8 text-sm bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {BRANDS.map(b => (
                  <SelectItem key={b} value={b} className="text-sm text-white hover:bg-slate-700">{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-500">{filtered.length} PO{filtered.length !== 1 ? 's' : ''} shown</p>

        {/* PO Cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center text-slate-500">No purchase orders match the selected filters.</CardContent>
            </Card>
          )}

          {filtered.map(po => (
            <Card key={po.po} className={`bg-slate-800 border-slate-700 overflow-hidden ${po.status === 'Pending Confirmation' ? 'border-amber-500/30' : ''}`}>
              {/* PO header */}
              <div
                className="p-5 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpandedPO(expandedPO === po.po ? null : po.po)}
              >
                <div className="flex flex-wrap items-center gap-4">
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

                  {/* SC Map button */}
                  <button
                    onClick={e => { e.stopPropagation(); setScModalPO(po.po); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-600 hover:text-white transition-colors flex-shrink-0">
                    <GitBranch className="w-3.5 h-3.5 text-teal-400" />
                    SC Map
                  </button>

                  {/* Sustainability button */}
                  <button
                    onClick={e => { e.stopPropagation(); setSustModalPO(po.po); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-600 hover:text-white transition-colors flex-shrink-0">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    Sustainability
                  </button>

                  {expandedPO === po.po
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Expanded: style breakdown */}
              {expandedPO === po.po && (
                <div className="border-t border-slate-700 px-5 py-4 bg-slate-900/50">
                  {po.status === 'Pending Confirmation' && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <p className="text-amber-300 text-sm">This PO is awaiting your confirmation to proceed to production.</p>
                      <button
                        onClick={e => { e.stopPropagation(); confirmPO(po.po); }}
                        className="ml-4 flex-shrink-0 px-4 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/50 text-teal-300 text-sm font-medium hover:bg-teal-600/30 transition-colors">
                        Confirm Order
                      </button>
                    </div>
                  )}
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

      {/* Supply Chain Map Modal */}
      {scModalPO && activeSCPO && scTrees[scModalPO] && (
        <SCMapModal
          po={activeSCPO}
          tree={scTrees[scModalPO]}
          onClose={() => setScModalPO(null)}
          onTreeChange={newTree => setScTrees(prev => ({ ...prev, [scModalPO]: newTree }))}
        />
      )}

      {/* Sustainability Modal */}
      {sustModalPO && activeSustPO && scTrees[sustModalPO] && (
        <SustainabilityModal
          po={activeSustPO}
          tree={scTrees[sustModalPO]}
          sustData={SUST_DATA[sustModalPO]}
          onClose={() => setSustModalPO(null)}
        />
      )}
    </div>
  );
}
