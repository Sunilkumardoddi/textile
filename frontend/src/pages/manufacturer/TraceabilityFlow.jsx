import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    Plus, Trash2, Eye, Save, X, ChevronRight, 
    Leaf, Circle, Package, Shirt, Link2, Clock,
    CheckCircle2, AlertTriangle, Edit2, Copy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Node type configurations
const nodeTypes = {
    cotton: {
        name: 'Cotton',
        icon: Leaf,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        size: { width: 75.6, height: 75.6 }, // 2cm = 75.6px at 96dpi
        fields: [
            { key: 'sourceCountry', label: 'Source Country', type: 'text' },
            { key: 'supplier', label: 'Supplier Name', type: 'text' },
            { key: 'farmLocation', label: 'Farm/Region', type: 'text' },
            { key: 'cottonType', label: 'Cotton Type', type: 'select', options: ['Organic', 'BCI', 'Conventional', 'Recycled'] },
            { key: 'quantity', label: 'Quantity (kg)', type: 'number' },
            { key: 'batchNo', label: 'Batch/Lot Number', type: 'text' },
            { key: 'harvestDate', label: 'Harvest Date', type: 'date' },
            { key: 'certification', label: 'Certification', type: 'select', options: ['GOTS', 'OCS', 'GRS', 'BCI', 'None'] },
            { key: 'certNumber', label: 'Certificate Number', type: 'text' },
        ]
    },
    yarn: {
        name: 'Yarn',
        icon: Circle,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        size: { width: 90, height: 90 },
        fields: [
            { key: 'yarnType', label: 'Yarn Type', type: 'select', options: ['Ring Spun', 'Open End', 'Compact', 'Rotor'] },
            { key: 'yarnCount', label: 'Yarn Count (Ne)', type: 'text' },
            { key: 'composition', label: 'Composition', type: 'text' },
            { key: 'inputQty', label: 'Input Quantity (kg)', type: 'number' },
            { key: 'outputQty', label: 'Output Quantity (kg)', type: 'number' },
            { key: 'batchNo', label: 'Batch/Lot Number', type: 'text' },
            { key: 'processDate', label: 'Process Date', type: 'date' },
            { key: 'spinningUnit', label: 'Spinning Unit', type: 'text' },
            { key: 'certification', label: 'Certification', type: 'select', options: ['GOTS', 'OCS', 'GRS', 'None'] },
        ]
    },
    fabric: {
        name: 'Fabric',
        icon: Package,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        size: { width: 100, height: 100 },
        fields: [
            { key: 'fabricType', label: 'Fabric Type', type: 'select', options: ['Woven', 'Knit', 'Non-woven'] },
            { key: 'construction', label: 'Construction', type: 'text' },
            { key: 'width', label: 'Width (inches)', type: 'number' },
            { key: 'gsm', label: 'GSM', type: 'number' },
            { key: 'inputQty', label: 'Input Quantity (kg)', type: 'number' },
            { key: 'outputQty', label: 'Output Quantity (meters)', type: 'number' },
            { key: 'batchNo', label: 'Batch/Lot Number', type: 'text' },
            { key: 'processDate', label: 'Process Date', type: 'date' },
            { key: 'dyeingMethod', label: 'Dyeing Method', type: 'select', options: ['Piece Dyed', 'Yarn Dyed', 'None'] },
            { key: 'color', label: 'Color', type: 'text' },
            { key: 'printType', label: 'Print Type', type: 'select', options: ['None', 'Screen', 'Digital', 'Rotary'] },
            { key: 'finishingTreatment', label: 'Finishing', type: 'text' },
            { key: 'certification', label: 'Certification', type: 'select', options: ['GOTS', 'OEKO-TEX', 'GRS', 'None'] },
        ]
    },
    manufacturing: {
        name: 'Final Manufacturing',
        icon: Shirt,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        size: { width: 110, height: 110 },
        fields: [
            { key: 'productType', label: 'Product Type', type: 'text' },
            { key: 'styleName', label: 'Style Name/Number', type: 'text' },
            { key: 'orderNo', label: 'Order Number', type: 'text' },
            { key: 'inputQty', label: 'Input Fabric (meters)', type: 'number' },
            { key: 'outputQty', label: 'Output Quantity (pcs)', type: 'number' },
            { key: 'batchNo', label: 'Batch/Lot Number', type: 'text' },
            { key: 'cutDate', label: 'Cut Date', type: 'date' },
            { key: 'sewDate', label: 'Sew Complete Date', type: 'date' },
            { key: 'washType', label: 'Wash Type', type: 'select', options: ['None', 'Normal', 'Stone', 'Enzyme', 'Acid'] },
            { key: 'packingDate', label: 'Packing Date', type: 'date' },
            { key: 'cartonNo', label: 'Carton Numbers', type: 'text' },
            { key: 'certification', label: 'Certification', type: 'select', options: ['GOTS', 'OEKO-TEX', 'GRS', 'WRAP', 'None'] },
        ]
    }
};

// Initial sample data
const initialNodes = [
    { id: 'cotton-1', type: 'cotton', x: 100, y: 200, data: { sourceCountry: 'India', supplier: 'Organic Farms Ltd', cottonType: 'Organic', quantity: '5000', certification: 'GOTS' }, submitted: true, submittedAt: '2024-01-15T10:30:00Z' },
    { id: 'cotton-2', type: 'cotton', x: 100, y: 350, data: { sourceCountry: 'Turkey', supplier: 'Aegean Cotton Co', cottonType: 'BCI', quantity: '3000', certification: 'BCI' }, submitted: true, submittedAt: '2024-01-16T09:15:00Z' },
    { id: 'yarn-1', type: 'yarn', x: 300, y: 275, data: { yarnType: 'Ring Spun', yarnCount: '30s', composition: '100% Cotton', inputQty: '8000', outputQty: '7200', certification: 'GOTS' }, submitted: true, submittedAt: '2024-01-20T14:00:00Z' },
    { id: 'fabric-1', type: 'fabric', x: 500, y: 275, data: { fabricType: 'Knit', construction: 'Single Jersey', gsm: '180', inputQty: '7200', outputQty: '40000', dyeingMethod: 'Piece Dyed', color: 'Navy Blue' }, submitted: false },
    { id: 'mfg-1', type: 'manufacturing', x: 720, y: 275, data: { productType: 'T-Shirt', styleName: 'TS-2024-001', orderNo: 'ORD-2024-001' }, submitted: false },
];

const initialConnections = [
    { from: 'cotton-1', to: 'yarn-1' },
    { from: 'cotton-2', to: 'yarn-1' },
    { from: 'yarn-1', to: 'fabric-1' },
    { from: 'fabric-1', to: 'mfg-1' },
];

export const TraceabilityFlow = () => {
    const [nodes, setNodes] = useState(initialNodes);
    const [connections, setConnections] = useState(initialConnections);
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [editingNode, setEditingNode] = useState(null);
    const [editData, setEditData] = useState({});
    const [draggedNode, setDraggedNode] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [connectingFrom, setConnectingFrom] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newNodeType, setNewNodeType] = useState('cotton');
    const canvasRef = useRef(null);

    // Get highlighted path when hovering
    const getHighlightedPath = useCallback((nodeId) => {
        if (!nodeId) return [];
        
        const path = new Set();
        const visited = new Set();
        
        // Trace backwards to find all sources
        const traceBack = (id) => {
            if (visited.has(id)) return;
            visited.add(id);
            path.add(id);
            connections.filter(c => c.to === id).forEach(c => {
                path.add(c.from);
                traceBack(c.from);
            });
        };
        
        // Trace forward to find all destinations
        const traceForward = (id) => {
            if (visited.has(id)) return;
            visited.add(id);
            path.add(id);
            connections.filter(c => c.from === id).forEach(c => {
                path.add(c.to);
                traceForward(c.to);
            });
        };
        
        visited.clear();
        traceBack(nodeId);
        visited.clear();
        traceForward(nodeId);
        
        return Array.from(path);
    }, [connections]);

    const highlightedPath = hoveredNode ? getHighlightedPath(hoveredNode) : [];

    // Handle node drag
    const handleMouseDown = (e, node) => {
        if (e.button !== 0) return;
        const rect = canvasRef.current.getBoundingClientRect();
        setDraggedNode(node.id);
        setDragOffset({
            x: e.clientX - rect.left - node.x,
            y: e.clientY - rect.top - node.y
        });
    };

    const handleMouseMove = (e) => {
        if (!draggedNode) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 120));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 120));
        
        setNodes(nodes.map(n => 
            n.id === draggedNode ? { ...n, x: newX, y: newY } : n
        ));
    };

    const handleMouseUp = () => {
        setDraggedNode(null);
    };

    // Add new node
    const handleAddNode = () => {
        const newNode = {
            id: `${newNodeType}-${Date.now()}`,
            type: newNodeType,
            x: 150 + Math.random() * 200,
            y: 150 + Math.random() * 200,
            data: {},
            submitted: false
        };
        setNodes([...nodes, newNode]);
        setShowAddDialog(false);
        toast.success(`${nodeTypes[newNodeType].name} node added`);
    };

    // Duplicate node
    const handleDuplicateNode = (node) => {
        const newNode = {
            ...node,
            id: `${node.type}-${Date.now()}`,
            x: node.x + 50,
            y: node.y + 50,
            submitted: false,
            submittedAt: null
        };
        setNodes([...nodes, newNode]);
        toast.success('Node duplicated');
    };

    // Delete node
    const handleDeleteNode = (nodeId) => {
        setNodes(nodes.filter(n => n.id !== nodeId));
        setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
        setSelectedNode(null);
        toast.success('Node deleted');
    };

    // Start connection
    const handleStartConnection = (nodeId) => {
        setConnectingFrom(nodeId);
    };

    // Complete connection
    const handleCompleteConnection = (toNodeId) => {
        if (connectingFrom && connectingFrom !== toNodeId) {
            const exists = connections.some(c => c.from === connectingFrom && c.to === toNodeId);
            if (!exists) {
                setConnections([...connections, { from: connectingFrom, to: toNodeId }]);
                toast.success('Connection created');
            }
        }
        setConnectingFrom(null);
    };

    // Delete connection
    const handleDeleteConnection = (from, to) => {
        setConnections(connections.filter(c => !(c.from === from && c.to === to)));
        toast.success('Connection removed');
    };

    // Edit node
    const handleEditNode = (node) => {
        setEditingNode(node);
        setEditData({ ...node.data });
    };

    // Save node data
    const handleSaveNode = () => {
        setNodes(nodes.map(n => 
            n.id === editingNode.id ? { ...n, data: editData } : n
        ));
        setEditingNode(null);
        setEditData({});
        toast.success('Node data saved');
    };

    // Submit node (immutable)
    const handleSubmitNode = (nodeId) => {
        setNodes(nodes.map(n => 
            n.id === nodeId ? { ...n, submitted: true, submittedAt: new Date().toISOString() } : n
        ));
        toast.success('Traceability data submitted (now immutable)');
    };

    // Draw connection lines
    const renderConnections = () => {
        return connections.map((conn, index) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const fromConfig = nodeTypes[fromNode.type];
            const toConfig = nodeTypes[toNode.type];
            
            const fromX = fromNode.x + fromConfig.size.width;
            const fromY = fromNode.y + fromConfig.size.height / 2;
            const toX = toNode.x;
            const toY = toNode.y + toConfig.size.height / 2;

            const isHighlighted = highlightedPath.includes(conn.from) && highlightedPath.includes(conn.to);

            // Create curved path
            const midX = (fromX + toX) / 2;
            const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

            return (
                <g key={index}>
                    <path
                        d={path}
                        fill="none"
                        stroke={isHighlighted ? 'hsl(var(--secondary))' : 'hsl(var(--border))'}
                        strokeWidth={isHighlighted ? 3 : 2}
                        strokeDasharray={isHighlighted ? 'none' : '5,5'}
                        className="transition-all duration-300"
                    />
                    {/* Arrow */}
                    <circle
                        cx={toX - 5}
                        cy={toY}
                        r={4}
                        fill={isHighlighted ? 'hsl(var(--secondary))' : 'hsl(var(--muted-foreground))'}
                    />
                </g>
            );
        });
    };

    // Render node
    const renderNode = (node) => {
        const config = nodeTypes[node.type];
        const Icon = config.icon;
        const isSelected = selectedNode === node.id;
        const isHighlighted = highlightedPath.includes(node.id);
        const isConnecting = connectingFrom !== null;

        return (
            <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                    if (connectingFrom) {
                        handleCompleteConnection(node.id);
                    } else {
                        setSelectedNode(node.id);
                    }
                }}
                className="cursor-pointer"
            >
                {/* Node background */}
                <rect
                    x={0}
                    y={0}
                    width={config.size.width}
                    height={config.size.height}
                    rx={12}
                    fill={isHighlighted ? 'hsl(var(--secondary) / 0.15)' : 'hsl(var(--card))'}
                    stroke={isHighlighted ? 'hsl(var(--secondary))' : isSelected ? 'hsl(var(--accent))' : 'hsl(var(--border))'}
                    strokeWidth={isHighlighted || isSelected ? 3 : 2}
                    className="transition-all duration-300"
                />
                
                {/* Node content */}
                <foreignObject x={0} y={0} width={config.size.width} height={config.size.height}>
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <div className={`p-2 rounded-lg ${config.color} text-white mb-1`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                            {config.name}
                        </span>
                        {node.submitted && (
                            <CheckCircle2 className="h-3 w-3 text-success mt-0.5" />
                        )}
                    </div>
                </foreignObject>

                {/* Connection handle */}
                {!isConnecting && (
                    <circle
                        cx={config.size.width}
                        cy={config.size.height / 2}
                        r={6}
                        fill="hsl(var(--secondary))"
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                        className="cursor-crosshair opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStartConnection(node.id);
                        }}
                    />
                )}
            </g>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Traceability Flow
                    </h1>
                    <p className="text-muted-foreground">
                        Visual node-based supply chain traceability interface
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Node
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Node</DialogTitle>
                                <DialogDescription>
                                    Select the type of traceability node to add
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3 py-4">
                                {Object.entries(nodeTypes).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewNodeType(key)}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            newNodeType === key 
                                                ? 'border-secondary bg-secondary/10' 
                                                : 'border-border hover:border-muted-foreground'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${config.color} text-white flex items-center justify-center mx-auto mb-2`}>
                                            <config.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">{config.name}</p>
                                    </button>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                    Cancel
                                </Button>
                                <Button variant="hero" onClick={handleAddNode}>
                                    Add Node
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Instructions */}
            <Card className="bg-muted/30">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Cotton (2cm fixed)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Yarn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <span>Fabric</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span>Final Manufacturing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            <span>Drag nodes • Click edge to connect • Hover to trace path</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Flow Canvas */}
                <Card className="lg:col-span-3">
                    <CardContent className="p-0">
                        <div
                            ref={canvasRef}
                            className="relative w-full h-[500px] bg-muted/20 overflow-hidden rounded-lg"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <svg className="absolute inset-0 w-full h-full">
                                {renderConnections()}
                                {nodes.map(renderNode)}
                            </svg>
                            
                            {/* Cancel connection mode */}
                            {connectingFrom && (
                                <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                    <Link2 className="h-4 w-4" />
                                    Click another node to connect
                                    <button onClick={() => setConnectingFrom(null)} className="ml-2 hover:bg-secondary-foreground/20 rounded p-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Node Details Panel */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Node Details</CardTitle>
                        <CardDescription>
                            {selectedNode ? 'View and edit node data' : 'Select a node to view details'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedNode ? (
                            (() => {
                                const node = nodes.find(n => n.id === selectedNode);
                                if (!node) return null;
                                const config = nodeTypes[node.type];
                                
                                return (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${config.color} text-white`}>
                                                <config.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{config.name}</p>
                                                <p className="text-xs text-muted-foreground">{node.id}</p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        {node.submitted ? (
                                            <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                                                <div className="flex items-center gap-2 text-success text-sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Submitted (Immutable)</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(node.submittedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                                                <div className="flex items-center gap-2 text-warning text-sm">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span>Draft - Not Submitted</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Data Preview */}
                                        <div className="space-y-2">
                                            {Object.entries(node.data).slice(0, 5).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <span className="text-foreground font-medium">{value || '-'}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2 pt-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full"
                                                onClick={() => handleEditNode(node)}
                                                disabled={node.submitted}
                                            >
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit Data
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full"
                                                onClick={() => handleDuplicateNode(node)}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Duplicate
                                            </Button>
                                            {!node.submitted && (
                                                <Button 
                                                    variant="hero" 
                                                    size="sm" 
                                                    className="w-full"
                                                    onClick={() => handleSubmitNode(node.id)}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Submit Data
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteNode(node.id)}
                                                disabled={node.submitted}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Node
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Click on a node to view its details</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Node Dialog */}
            <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {editingNode && (() => {
                        const config = nodeTypes[editingNode.type];
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${config.color} text-white`}>
                                            <config.icon className="h-4 w-4" />
                                        </div>
                                        Edit {config.name} Data
                                    </DialogTitle>
                                    <DialogDescription>
                                        Enter traceability data for this node. All data will be time-stamped upon submission.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                    {config.fields.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <Label htmlFor={field.key}>{field.label}</Label>
                                            {field.type === 'select' ? (
                                                <Select
                                                    value={editData[field.key] || ''}
                                                    onValueChange={(value) => setEditData({...editData, [field.key]: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select ${field.label}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type === 'textarea' ? (
                                                <Textarea
                                                    id={field.key}
                                                    value={editData[field.key] || ''}
                                                    onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                                                    rows={3}
                                                />
                                            ) : (
                                                <Input
                                                    id={field.key}
                                                    type={field.type}
                                                    value={editData[field.key] || ''}
                                                    onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditingNode(null)}>
                                        Cancel
                                    </Button>
                                    <Button variant="hero" onClick={handleSaveNode}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Data
                                    </Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TraceabilityFlow;
