import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
    Plus, Minus, ChevronDown, ChevronRight, Eye, EyeOff, 
    Lock, Unlock, ZoomIn, ZoomOut, Maximize2, Search,
    CheckCircle2, AlertTriangle, Clock, XCircle, Edit2,
    Copy, Trash2, Save, X, Filter, Download, Upload,
    Leaf, Circle, Package, Shirt, Droplets, Printer,
    Scissors, Waves, Factory, Building2, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Node type configurations with hierarchy levels
const nodeTypeConfig = {
    garment: {
        level: 0,
        name: 'Final Garment',
        icon: Shirt,
        color: '#f97316', // Orange
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        size: { width: 200, height: 80 },
    },
    washing: {
        level: 1,
        name: 'Washing',
        icon: Waves,
        color: '#06b6d4', // Cyan
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-300',
        size: { width: 180, height: 70 },
    },
    cmt: {
        level: 1,
        name: 'CMT',
        icon: Scissors,
        color: '#ec4899', // Pink
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-300',
        size: { width: 180, height: 70 },
    },
    printing: {
        level: 2,
        name: 'Printing',
        icon: Printer,
        color: '#8b5cf6', // Violet
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-300',
        size: { width: 170, height: 65 },
    },
    dyeing: {
        level: 2,
        name: 'Dyeing',
        icon: Droplets,
        color: '#6366f1', // Indigo
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-300',
        size: { width: 170, height: 65 },
    },
    fabric: {
        level: 3,
        name: 'Weaving/Knitting',
        icon: Package,
        color: '#a855f7', // Purple
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        size: { width: 180, height: 70 },
    },
    spinning: {
        level: 4,
        name: 'Spinning',
        icon: Circle,
        color: '#3b82f6', // Blue
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        size: { width: 170, height: 65 },
    },
    fibre: {
        level: 5,
        name: 'Raw Material',
        icon: Leaf,
        color: '#22c55e', // Green
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        size: { width: 75.6, height: 75.6 }, // 2cm fixed = 75.6px at 96dpi
    },
};

// Status configurations
const statusConfig = {
    completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
    missing: { label: 'Missing', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
    expired: { label: 'Expired', color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle },
};

// Sample hierarchical data
const initialTreeData = {
    id: 'garment-1',
    type: 'garment',
    name: 'Fashion Brand Co - T-Shirt Line',
    company: 'Dhaka Textiles Manufacturing Ltd',
    location: 'Dhaka, Bangladesh',
    status: 'pending',
    completedFields: 8,
    totalFields: 12,
    locked: false,
    expanded: true,
    data: { orderNo: 'ORD-2024-001', style: 'TS-2024-001', quantity: '5000 pcs' },
    children: [
        {
            id: 'washing-1',
            type: 'washing',
            name: 'Garment Washing Unit',
            company: 'CleanTex Washing Ltd',
            location: 'Gazipur, Bangladesh',
            status: 'completed',
            completedFields: 6,
            totalFields: 6,
            locked: true,
            expanded: true,
            data: { washType: 'Enzyme Wash', capacity: '8000 pcs/day' },
            children: []
        },
        {
            id: 'cmt-1',
            type: 'cmt',
            name: 'Cut-Make-Trim Unit',
            company: 'Garment Solutions Ltd',
            location: 'Dhaka, Bangladesh',
            status: 'pending',
            completedFields: 4,
            totalFields: 8,
            locked: false,
            expanded: true,
            data: { capacity: '10000 pcs/day', lines: '12 production lines' },
            children: [
                {
                    id: 'printing-1',
                    type: 'printing',
                    name: 'Screen Printing Unit',
                    company: 'PrintMaster Co',
                    location: 'Narayanganj, Bangladesh',
                    status: 'completed',
                    completedFields: 5,
                    totalFields: 5,
                    locked: true,
                    expanded: false,
                    data: { printType: 'Screen Print', colors: '4 colors' },
                    children: []
                },
                {
                    id: 'dyeing-1',
                    type: 'dyeing',
                    name: 'Fabric Dyeing Unit',
                    company: 'ColorTex Industries',
                    location: 'Savar, Bangladesh',
                    status: 'pending',
                    completedFields: 3,
                    totalFields: 7,
                    locked: false,
                    expanded: true,
                    data: { dyeMethod: 'Piece Dyed', color: 'Navy Blue' },
                    children: [
                        {
                            id: 'fabric-1',
                            type: 'fabric',
                            name: 'Knitting Mill A',
                            company: 'KnitWell Textiles',
                            location: 'Gazipur, Bangladesh',
                            status: 'completed',
                            completedFields: 6,
                            totalFields: 6,
                            locked: true,
                            expanded: true,
                            data: { fabricType: 'Single Jersey', gsm: '180' },
                            children: [
                                {
                                    id: 'spinning-1',
                                    type: 'spinning',
                                    name: 'Ring Spinning Mill',
                                    company: 'SpinCo Textiles',
                                    location: 'Chittagong, Bangladesh',
                                    status: 'completed',
                                    completedFields: 5,
                                    totalFields: 5,
                                    locked: true,
                                    expanded: true,
                                    data: { yarnCount: '30s Ne', yarnType: 'Ring Spun' },
                                    children: [
                                        {
                                            id: 'fibre-1',
                                            type: 'fibre',
                                            name: 'Organic Cotton',
                                            company: 'Rajasthan Organic Farms',
                                            location: 'Rajasthan, India',
                                            status: 'completed',
                                            completedFields: 8,
                                            totalFields: 8,
                                            locked: true,
                                            expanded: false,
                                            data: { fibreType: 'Organic Cotton', certification: 'GOTS', origin: 'India' },
                                            children: []
                                        },
                                        {
                                            id: 'fibre-2',
                                            type: 'fibre',
                                            name: 'BCI Cotton',
                                            company: 'Gujarat Cotton Co',
                                            location: 'Gujarat, India',
                                            status: 'pending',
                                            completedFields: 5,
                                            totalFields: 8,
                                            locked: false,
                                            expanded: false,
                                            data: { fibreType: 'BCI Cotton', certification: 'BCI', origin: 'India' },
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 'fabric-2',
                            type: 'fabric',
                            name: 'Weaving Mill B',
                            company: 'WeaveTech Mills',
                            location: 'Narsingdi, Bangladesh',
                            status: 'missing',
                            completedFields: 0,
                            totalFields: 6,
                            locked: false,
                            expanded: true,
                            data: {},
                            children: [
                                {
                                    id: 'spinning-2',
                                    type: 'spinning',
                                    name: 'Open-End Spinning',
                                    company: 'RotoSpin Ltd',
                                    location: 'Dhaka, Bangladesh',
                                    status: 'missing',
                                    completedFields: 0,
                                    totalFields: 5,
                                    locked: false,
                                    expanded: true,
                                    data: {},
                                    children: [
                                        {
                                            id: 'fibre-3',
                                            type: 'fibre',
                                            name: 'Recycled Cotton',
                                            company: 'ReCircle Fibres',
                                            location: 'Tamil Nadu, India',
                                            status: 'expired',
                                            completedFields: 8,
                                            totalFields: 8,
                                            locked: false,
                                            expanded: false,
                                            data: { fibreType: 'Recycled', certification: 'GRS (Expired)', origin: 'India' },
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

// Helper function to find node and its path
const findNodePath = (tree, nodeId, path = []) => {
    if (tree.id === nodeId) return [...path, tree.id];
    for (const child of tree.children || []) {
        const result = findNodePath(child, nodeId, [...path, tree.id]);
        if (result) return result;
    }
    return null;
};

// Helper to get all descendants
const getAllDescendants = (node, ids = []) => {
    ids.push(node.id);
    for (const child of node.children || []) {
        getAllDescendants(child, ids);
    }
    return ids;
};

// Helper to get all ancestors and descendants (full branch)
const getFullBranch = (tree, nodeId) => {
    const path = findNodePath(tree, nodeId) || [];
    const findNode = (tree, id) => {
        if (tree.id === id) return tree;
        for (const child of tree.children || []) {
            const result = findNode(child, id);
            if (result) return result;
        }
        return null;
    };
    const node = findNode(tree, nodeId);
    const descendants = node ? getAllDescendants(node) : [];
    return [...new Set([...path, ...descendants])];
};

// TreeNode Component
const TreeNode = ({ 
    node, 
    depth = 0, 
    onToggle, 
    onSelect, 
    selectedId, 
    highlightedIds,
    onAddChild,
    onDuplicate,
    onDelete,
    onEdit
}) => {
    const config = nodeTypeConfig[node.type];
    const status = statusConfig[node.status];
    const Icon = config.icon;
    const StatusIcon = status.icon;
    const isSelected = selectedId === node.id;
    const isHighlighted = highlightedIds.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const isFibre = node.type === 'fibre';
    const nodeWidth = isFibre ? 75.6 : config.size.width;
    const nodeHeight = isFibre ? 75.6 : config.size.height;

    return (
        <div className="flex flex-col items-center">
            {/* Node */}
            <div 
                className={`relative transition-all duration-300 cursor-pointer ${
                    isHighlighted ? 'z-10' : 'z-0'
                }`}
                style={{ 
                    width: nodeWidth,
                    opacity: highlightedIds.length > 0 && !isHighlighted ? 0.4 : 1 
                }}
                onClick={() => onSelect(node.id)}
            >
                {/* Connection line to parent */}
                {depth > 0 && (
                    <div 
                        className={`absolute left-1/2 -top-6 w-0.5 h-6 ${
                            isHighlighted ? 'bg-secondary' : 'bg-border'
                        } transition-colors`}
                        style={{ transform: 'translateX(-50%)' }}
                    />
                )}

                {/* Main node card */}
                <div 
                    className={`rounded-xl border-2 transition-all ${
                        isSelected 
                            ? 'border-secondary shadow-lg shadow-secondary/20 ring-2 ring-secondary/30' 
                            : isHighlighted 
                                ? 'border-secondary/70 shadow-md' 
                                : 'border-border hover:border-muted-foreground/50'
                    } ${config.bgColor} overflow-hidden`}
                    style={{ minHeight: nodeHeight }}
                >
                    {/* Header */}
                    <div 
                        className="px-2 py-1.5 flex items-center gap-1.5"
                        style={{ backgroundColor: `${config.color}15` }}
                    >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: config.color }} />
                        {!isFibre && (
                            <span className="text-[10px] font-semibold truncate flex-1" style={{ color: config.color }}>
                                {config.name}
                            </span>
                        )}
                        {node.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>

                    {/* Content */}
                    <div className={`px-2 py-1.5 ${isFibre ? 'text-center' : ''}`}>
                        <p className={`font-medium text-foreground truncate ${isFibre ? 'text-[9px]' : 'text-xs'}`}>
                            {isFibre ? node.data?.fibreType || 'Fibre' : node.name}
                        </p>
                        {!isFibre && (
                            <>
                                <p className="text-[10px] text-muted-foreground truncate">{node.company}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[8px] px-1 py-0 ${status.bg} ${status.color} border-0`}
                                    >
                                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                        {status.label}
                                    </Badge>
                                    <span className="text-[9px] text-muted-foreground font-medium">
                                        {node.completedFields}/{node.totalFields}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Expand/Collapse button */}
                    {hasChildren && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center hover:bg-muted z-20"
                        >
                            {node.expanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </button>
                    )}

                    {/* Context menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="h-3 w-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onEdit(node)}>
                                <Edit2 className="h-3.5 w-3.5 mr-2" />
                                Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(node)}>
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddChild(node)}>
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                Add Supplier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => onDelete(node.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Children */}
            {hasChildren && node.expanded && (
                <div className="flex gap-4 mt-8 relative">
                    {/* Horizontal connector line */}
                    {node.children.length > 1 && (
                        <div 
                            className={`absolute top-0 h-0.5 ${isHighlighted ? 'bg-secondary' : 'bg-border'} transition-colors`}
                            style={{
                                left: '50%',
                                width: `calc(100% - ${nodeWidth}px)`,
                                transform: 'translateX(-50%) translateY(-12px)',
                            }}
                        />
                    )}
                    {node.children.map((child, index) => (
                        <div key={child.id} className="relative">
                            {/* Vertical connector to horizontal line */}
                            {node.children.length > 1 && (
                                <div 
                                    className={`absolute left-1/2 -top-3 w-0.5 h-3 ${
                                        highlightedIds.includes(child.id) ? 'bg-secondary' : 'bg-border'
                                    } transition-colors`}
                                    style={{ transform: 'translateX(-50%)' }}
                                />
                            )}
                            <TreeNode
                                node={child}
                                depth={depth + 1}
                                onToggle={onToggle}
                                onSelect={onSelect}
                                selectedId={selectedId}
                                highlightedIds={highlightedIds}
                                onAddChild={onAddChild}
                                onDuplicate={onDuplicate}
                                onDelete={onDelete}
                                onEdit={onEdit}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main TraceabilityTree Component
export const TraceabilityTree = () => {
    const [treeData, setTreeData] = useState(initialTreeData);
    const [selectedId, setSelectedId] = useState(null);
    const [highlightedIds, setHighlightedIds] = useState([]);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [editingNode, setEditingNode] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addParentNode, setAddParentNode] = useState(null);
    const [newNodeType, setNewNodeType] = useState('fibre');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Toggle expand/collapse
    const handleToggle = useCallback((nodeId) => {
        const toggleNode = (node) => {
            if (node.id === nodeId) {
                return { ...node, expanded: !node.expanded };
            }
            return {
                ...node,
                children: node.children?.map(toggleNode)
            };
        };
        setTreeData(toggleNode(treeData));
    }, [treeData]);

    // Select node and highlight branch
    const handleSelect = useCallback((nodeId) => {
        setSelectedId(nodeId);
        const branch = getFullBranch(treeData, nodeId);
        setHighlightedIds(branch);
    }, [treeData]);

    // Clear selection
    const handleClearSelection = () => {
        setSelectedId(null);
        setHighlightedIds([]);
    };

    // Zoom controls
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
    const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

    // Pan handling
    const handleMouseDown = (e) => {
        if (e.target === containerRef.current || e.target.closest('.tree-canvas')) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // Add child node
    const handleAddChild = (parentNode) => {
        setAddParentNode(parentNode);
        setShowAddDialog(true);
    };

    const handleConfirmAddChild = () => {
        if (!addParentNode) return;

        const newNode = {
            id: `${newNodeType}-${Date.now()}`,
            type: newNodeType,
            name: `New ${nodeTypeConfig[newNodeType].name}`,
            company: 'Enter Company Name',
            location: 'Enter Location',
            status: 'missing',
            completedFields: 0,
            totalFields: 8,
            locked: false,
            expanded: false,
            data: {},
            children: []
        };

        const addToParent = (node) => {
            if (node.id === addParentNode.id) {
                return { ...node, children: [...(node.children || []), newNode], expanded: true };
            }
            return { ...node, children: node.children?.map(addToParent) };
        };

        setTreeData(addToParent(treeData));
        setShowAddDialog(false);
        setAddParentNode(null);
        toast.success('Supplier node added');
    };

    // Duplicate node
    const handleDuplicate = (node) => {
        const duplicateNode = (n) => ({
            ...n,
            id: `${n.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            locked: false,
            children: n.children?.map(duplicateNode)
        });

        const findAndDuplicateInParent = (tree, nodeId) => {
            const newChildren = [];
            for (const child of tree.children || []) {
                newChildren.push(child);
                if (child.id === nodeId) {
                    newChildren.push(duplicateNode(child));
                } else if (child.children?.length > 0) {
                    const result = findAndDuplicateInParent(child, nodeId);
                    if (result !== child) {
                        newChildren[newChildren.length - 1] = result;
                    }
                }
            }
            return { ...tree, children: newChildren };
        };

        setTreeData(findAndDuplicateInParent(treeData, node.id));
        toast.success('Node duplicated with full branch');
    };

    // Delete node
    const handleDelete = (nodeId) => {
        const deleteNode = (node) => {
            if (node.id === nodeId) return null;
            return {
                ...node,
                children: node.children?.map(deleteNode).filter(Boolean)
            };
        };
        const result = deleteNode(treeData);
        if (result) {
            setTreeData(result);
            setSelectedId(null);
            setHighlightedIds([]);
            toast.success('Node deleted');
        }
    };

    // Edit node
    const handleEdit = (node) => {
        if (node.locked) {
            toast.error('This node is locked. Request approval to edit.');
            return;
        }
        setEditingNode(node);
    };

    // Save node edits
    const handleSaveEdit = (updatedData) => {
        const updateNode = (node) => {
            if (node.id === editingNode.id) {
                return { ...node, ...updatedData };
            }
            return { ...node, children: node.children?.map(updateNode) };
        };
        setTreeData(updateNode(treeData));
        setEditingNode(null);
        toast.success('Node data saved');
    };

    // Submit and lock node
    const handleSubmitNode = () => {
        if (!editingNode) return;
        
        const lockNode = (node) => {
            if (node.id === editingNode.id) {
                return { ...node, locked: true, status: 'completed', completedFields: node.totalFields };
            }
            return { ...node, children: node.children?.map(lockNode) };
        };
        setTreeData(lockNode(treeData));
        setEditingNode(null);
        toast.success('Data submitted and locked. Changes require approval.');
    };

    // Get selected node
    const getSelectedNode = useMemo(() => {
        const findNode = (node) => {
            if (node.id === selectedId) return node;
            for (const child of node.children || []) {
                const result = findNode(child);
                if (result) return result;
            }
            return null;
        };
        return findNode(treeData);
    }, [treeData, selectedId]);

    // Count stats
    const stats = useMemo(() => {
        const count = { total: 0, completed: 0, pending: 0, missing: 0, expired: 0 };
        const traverse = (node) => {
            count.total++;
            count[node.status]++;
            node.children?.forEach(traverse);
        };
        traverse(treeData);
        return count;
    }, [treeData]);

    return (
        <div className="space-y-4 h-full">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Supply Chain Traceability
                    </h1>
                    <p className="text-muted-foreground">
                        Hierarchical view of your textile supply chain
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search nodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-48"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="missing">Missing</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total Nodes:</span>
                    <Badge variant="secondary">{stats.total}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{stats.completed} Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{stats.pending} Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{stats.missing} Missing</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{stats.expired} Expired</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleZoomReset} className="h-8 w-8">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 320px)' }}>
                {/* Tree Canvas */}
                <Card className="lg:col-span-3 overflow-hidden">
                    <CardContent className="p-0 h-full">
                        <div
                            ref={containerRef}
                            className="w-full h-full overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 cursor-grab active:cursor-grabbing"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onClick={(e) => {
                                if (e.target === containerRef.current) {
                                    handleClearSelection();
                                }
                            }}
                        >
                            <div
                                className="tree-canvas p-8 pt-12 inline-block min-w-full min-h-full"
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transformOrigin: 'top center',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                }}
                            >
                                <TreeNode
                                    node={treeData}
                                    onToggle={handleToggle}
                                    onSelect={handleSelect}
                                    selectedId={selectedId}
                                    highlightedIds={highlightedIds}
                                    onAddChild={handleAddChild}
                                    onDuplicate={handleDuplicate}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Panel */}
                <Card className="overflow-hidden flex flex-col">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle className="text-lg">Node Details</CardTitle>
                        <CardDescription>
                            {selectedId ? 'Selected node information' : 'Click a node to view details'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        {getSelectedNode ? (
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4">
                                    {/* Node Header */}
                                    <div className="flex items-start gap-3">
                                        <div 
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: `${nodeTypeConfig[getSelectedNode.type].color}20` }}
                                        >
                                            {React.createElement(nodeTypeConfig[getSelectedNode.type].icon, {
                                                className: 'h-5 w-5',
                                                style: { color: nodeTypeConfig[getSelectedNode.type].color }
                                            })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{getSelectedNode.name}</p>
                                            <p className="text-sm text-muted-foreground">{nodeTypeConfig[getSelectedNode.type].name}</p>
                                        </div>
                                    </div>

                                    {/* Status & Lock */}
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className={`${statusConfig[getSelectedNode.status].bg} ${statusConfig[getSelectedNode.status].color} border-0`}
                                        >
                                            {React.createElement(statusConfig[getSelectedNode.status].icon, { className: 'h-3 w-3 mr-1' })}
                                            {statusConfig[getSelectedNode.status].label}
                                        </Badge>
                                        {getSelectedNode.locked ? (
                                            <Badge variant="outline" className="bg-muted">
                                                <Lock className="h-3 w-3 mr-1" />
                                                Locked
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                <Unlock className="h-3 w-3 mr-1" />
                                                Editable
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Completion */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Completion</span>
                                            <span className="font-medium">
                                                {getSelectedNode.completedFields}/{getSelectedNode.totalFields}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-secondary transition-all"
                                                style={{ width: `${(getSelectedNode.completedFields / getSelectedNode.totalFields) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 pt-2 border-t border-border">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Company</span>
                                            <span className="text-foreground text-right">{getSelectedNode.company}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Location</span>
                                            <span className="text-foreground text-right">{getSelectedNode.location}</span>
                                        </div>
                                        {Object.entries(getSelectedNode.data || {}).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-foreground text-right">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 pt-4">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleEdit(getSelectedNode)}
                                            disabled={getSelectedNode.locked}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit Data
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddChild(getSelectedNode)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Upstream Supplier
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleDuplicate(getSelectedNode)}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplicate Node
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Eye className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground">Select a node to view its details and traceability data</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Legend */}
            <Card>
                <CardContent className="p-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="font-medium text-muted-foreground">Node Types:</span>
                        {Object.entries(nodeTypeConfig).map(([key, config]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <div 
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span className="text-muted-foreground">{config.name}</span>
                            </div>
                        ))}
                        <div className="ml-auto flex items-center gap-4">
                            <span className="text-muted-foreground">
                                <Lock className="h-3 w-3 inline mr-1" />
                                Locked = Submitted (Immutable)
                            </span>
                            <span className="text-muted-foreground">
                                Click node to highlight branch
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Node Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Upstream Supplier</DialogTitle>
                        <DialogDescription>
                            Add a new supplier node to {addParentNode?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                        {Object.entries(nodeTypeConfig)
                            .filter(([key]) => {
                                const parentLevel = nodeTypeConfig[addParentNode?.type]?.level ?? -1;
                                return nodeTypeConfig[key].level > parentLevel;
                            })
                            .map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => setNewNodeType(key)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                        newNodeType === key 
                                            ? 'border-secondary bg-secondary/10' 
                                            : 'border-border hover:border-muted-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${config.color}20` }}
                                        >
                                            {React.createElement(config.icon, {
                                                className: 'h-4 w-4',
                                                style: { color: config.color }
                                            })}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{config.name}</span>
                                    </div>
                                </button>
                            ))
                        }
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="hero" onClick={handleConfirmAddChild}>
                            Add Supplier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Node Dialog */}
            <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
                <DialogContent className="max-w-lg">
                    {editingNode && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {React.createElement(nodeTypeConfig[editingNode.type].icon, {
                                        className: 'h-5 w-5',
                                        style: { color: nodeTypeConfig[editingNode.type].color }
                                    })}
                                    Edit {nodeTypeConfig[editingNode.type].name}
                                </DialogTitle>
                                <DialogDescription>
                                    Update traceability data. Once submitted, data will be locked.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input defaultValue={editingNode.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input defaultValue={editingNode.company} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input defaultValue={editingNode.location} />
                                </div>
                                {editingNode.type === 'fibre' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Fibre Type</Label>
                                                <Select defaultValue={editingNode.data?.fibreType}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Organic Cotton">Organic Cotton</SelectItem>
                                                        <SelectItem value="BCI Cotton">BCI Cotton</SelectItem>
                                                        <SelectItem value="Conventional">Conventional</SelectItem>
                                                        <SelectItem value="Recycled">Recycled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Certification</Label>
                                                <Select defaultValue={editingNode.data?.certification}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="GOTS">GOTS</SelectItem>
                                                        <SelectItem value="OCS">OCS</SelectItem>
                                                        <SelectItem value="GRS">GRS</SelectItem>
                                                        <SelectItem value="BCI">BCI</SelectItem>
                                                        <SelectItem value="None">None</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Origin Country</Label>
                                            <Input defaultValue={editingNode.data?.origin} placeholder="e.g., India" />
                                        </div>
                                    </>
                                )}
                                <div className="p-3 bg-warning/10 rounded-lg text-sm text-warning flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Once you submit this data, it will be locked and can only be modified through an approval workflow with Admin/Auditor.
                                    </span>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingNode(null)}>
                                    Cancel
                                </Button>
                                <Button variant="outline" onClick={() => handleSaveEdit({})}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Draft
                                </Button>
                                <Button variant="hero" onClick={handleSubmitNode}>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Submit & Lock
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TraceabilityTree;
