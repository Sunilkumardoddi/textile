import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, Upload, Image, Search, Filter, Grid, List,
    Check, X, Loader2, RefreshCw, Download, Eye, AlertTriangle,
    Layers, Users, TrendingUp, CheckCircle, Package, Palette,
    ChevronDown, SlidersHorizontal, Heart, Star, Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collectionsAPI, seasonsAPI } from '@/lib/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FABRIC_TYPES = [
    { value: 'cotton', label: 'Cotton' },
    { value: 'polyester', label: 'Polyester' },
    { value: 'silk', label: 'Silk' },
    { value: 'wool', label: 'Wool' },
    { value: 'linen', label: 'Linen' },
    { value: 'denim', label: 'Denim' },
    { value: 'jersey', label: 'Jersey' },
    { value: 'velvet', label: 'Velvet' },
    { value: 'chiffon', label: 'Chiffon' },
    { value: 'satin', label: 'Satin' },
    { value: 'twill', label: 'Twill' },
    { value: 'fleece', label: 'Fleece' },
    { value: 'other', label: 'Other' }
];

const WEAVE_TYPES = [
    { value: 'woven', label: 'Woven' },
    { value: 'knit', label: 'Knit' },
    { value: 'non_woven', label: 'Non-Woven' }
];

const ManufacturerCollection = () => {
    const { seasonId, collectionId } = useParams();
    const navigate = useNavigate();
    
    // State
    const [collection, setCollection] = useState(null);
    const [swatches, setSwatches] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedSwatches, setSelectedSwatches] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [showSwatchDetail, setShowSwatchDetail] = useState(null);
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const [creating, setCreating] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        supplier_id: '',
        fabric_type: '',
        weave_type: '',
        gsm_min: '',
        gsm_max: '',
        status: '',
        tags: ''
    });
    
    // Pagination
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 50;

    // New collection form
    const [newCollection, setNewCollection] = useState({
        name: '',
        description: '',
        deadline: '',
        max_swatches_per_supplier: 1000,
        guidelines: ''
    });

    const fetchCollection = useCallback(async () => {
        if (!collectionId) return;
        try {
            const [collectionRes, analyticsRes] = await Promise.all([
                collectionsAPI.getById(collectionId),
                collectionsAPI.getAnalytics(collectionId)
            ]);
            setCollection(collectionRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Failed to fetch collection:', error);
            setCollection({ id: collectionId, name: 'Collection', collection_code: collectionId, description: '' });
            setAnalytics({ participating_suppliers: 0, total_swatches: 0, approved_swatches: 0, pending_swatches: 0 });
        }
    }, [collectionId]);

    const fetchSwatches = useCallback(async (reset = false) => {
        if (!collectionId) return;
        
        const currentPage = reset ? 0 : page;
        if (reset) {
            setPage(0);
            setSwatches([]);
        }
        
        try {
            setLoadingMore(!reset);
            const params = {
                limit: LIMIT,
                skip: currentPage * LIMIT,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            };
            
            const response = await collectionsAPI.getSwatches(collectionId, params);
            const newSwatches = response.data;
            
            if (reset) {
                setSwatches(newSwatches);
            } else {
                setSwatches(prev => [...prev, ...newSwatches]);
            }
            
            setHasMore(newSwatches.length === LIMIT);
        } catch (error) {
            toast.error('Failed to load swatches');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [collectionId, filters, page]);

    useEffect(() => {
        if (collectionId) {
            setLoading(true);
            fetchCollection();
            fetchSwatches(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionId, fetchCollection]);

    useEffect(() => {
        if (!loading && collectionId) {
            fetchSwatches(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleCreateCollection = async () => {
        if (!newCollection.name) {
            toast.error('Please enter a collection name');
            return;
        }
        
        setCreating(true);
        try {
            const response = await collectionsAPI.create({
                ...newCollection,
                season_id: seasonId,
                max_swatches_per_supplier: parseInt(newCollection.max_swatches_per_supplier)
            });
            toast.success('Collection created');
            setShowCreateCollection(false);
            navigate(`/dashboard/brand/seasons/${seasonId}/collections/${response.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create collection');
        } finally {
            setCreating(false);
        }
    };

    const handleSelectSwatches = async (action) => {
        if (selectedSwatches.length === 0) {
            toast.error('Please select swatches first');
            return;
        }
        
        try {
            await collectionsAPI.selectSwatches(collectionId, {
                swatch_ids: selectedSwatches,
                action: action
            });
            toast.success(`${selectedSwatches.length} swatches ${action}ed`);
            setSelectedSwatches([]);
            fetchSwatches(true);
            fetchCollection();
        } catch (error) {
            toast.error('Failed to update swatches');
        }
    };

    const toggleSwatchSelection = (swatchId) => {
        setSelectedSwatches(prev => 
            prev.includes(swatchId) 
                ? prev.filter(id => id !== swatchId)
                : [...prev, swatchId]
        );
    };

    const selectAll = () => {
        setSelectedSwatches(swatches.map(s => s.id));
    };

    const clearSelection = () => {
        setSelectedSwatches([]);
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
        fetchSwatches(false);
    };

    const getStatusColor = (status) => {
        const colors = {
            uploaded: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            viewed: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            shortlisted: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            selected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
            in_sampling: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
        return colors[status] || colors.uploaded;
    };

    if (loading && !collection) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    // If no collection selected, show collection list
    if (!collectionId) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Manufacturer Collections</h2>
                        <p className="text-slate-400">Manage fabric swatch collections from suppliers</p>
                    </div>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setShowCreateCollection(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Collection
                    </Button>
                </div>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Select a collection to view swatches</p>
                    </CardContent>
                </Card>

                {/* Create Collection Dialog */}
                <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create Manufacturer Collection</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Invite suppliers to submit fabric swatches
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Collection Name *</Label>
                                <Input
                                    placeholder="e.g., AW27 Fabric Collection"
                                    value={newCollection.name}
                                    onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Submission Deadline</Label>
                                <Input
                                    type="date"
                                    value={newCollection.deadline}
                                    onChange={(e) => setNewCollection(prev => ({ ...prev, deadline: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Max Swatches per Supplier</Label>
                                <Input
                                    type="number"
                                    value={newCollection.max_swatches_per_supplier}
                                    onChange={(e) => setNewCollection(prev => ({ ...prev, max_swatches_per_supplier: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Guidelines for Suppliers</Label>
                                <Textarea
                                    placeholder="Specify requirements for fabric submissions..."
                                    value={newCollection.guidelines}
                                    onChange={(e) => setNewCollection(prev => ({ ...prev, guidelines: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateCollection(false)} className="border-slate-600 text-slate-300">
                                Cancel
                            </Button>
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleCreateCollection}
                                disabled={creating}
                            >
                                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="manufacturer-collection">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/dashboard/brand/seasons/${seasonId}`)}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Season
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{collection?.name}</h1>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                            {collection?.collection_code}
                        </Badge>
                    </div>
                    <p className="text-slate-400 mt-1">{collection?.description || 'Fabric swatch collection'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => { fetchCollection(); fetchSwatches(true); }} className="border-slate-600 text-slate-300">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{analytics?.participating_suppliers || 0}</p>
                                <p className="text-xs text-slate-400">Suppliers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Layers className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{analytics?.total_swatches?.toLocaleString() || 0}</p>
                                <p className="text-xs text-slate-400">Total Swatches</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Star className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-400">{analytics?.by_status?.shortlisted || 0}</p>
                                <p className="text-xs text-slate-400">Shortlisted</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-400">{analytics?.by_status?.selected || 0}</p>
                                <p className="text-xs text-slate-400">Selected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/10">
                                <Tag className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{analytics?.sustainable_percentage || 0}%</p>
                                <p className="text-xs text-slate-400">Sustainable</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search swatches..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="pl-10 bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    
                    <Sheet open={showFilters} onOpenChange={setShowFilters}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="border-slate-600 text-slate-300">
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-slate-800 border-slate-700 w-80">
                            <SheetHeader>
                                <SheetTitle className="text-white">Filter Swatches</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Fabric Type</Label>
                                    <Select 
                                        value={filters.fabric_type || "all"} 
                                        onValueChange={(v) => setFilters(prev => ({ ...prev, fabric_type: v === "all" ? "" : v }))}
                                    >
                                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Types</SelectItem>
                                            {FABRIC_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Weave Type</Label>
                                    <Select 
                                        value={filters.weave_type || "all"} 
                                        onValueChange={(v) => setFilters(prev => ({ ...prev, weave_type: v === "all" ? "" : v }))}
                                    >
                                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                            <SelectValue placeholder="All weaves" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Weaves</SelectItem>
                                            {WEAVE_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">GSM Range</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.gsm_min}
                                            onChange={(e) => setFilters(prev => ({ ...prev, gsm_min: e.target.value }))}
                                            className="bg-slate-900/50 border-slate-600 text-white"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.gsm_max}
                                            onChange={(e) => setFilters(prev => ({ ...prev, gsm_max: e.target.value }))}
                                            className="bg-slate-900/50 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Status</Label>
                                    <Select 
                                        value={filters.status || "all"} 
                                        onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === "all" ? "" : v }))}
                                    >
                                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="uploaded">Uploaded</SelectItem>
                                            <SelectItem value="viewed">Viewed</SelectItem>
                                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                            <SelectItem value="selected">Selected</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Tags (comma-separated)</Label>
                                    <Input
                                        placeholder="sustainable, organic"
                                        value={filters.tags}
                                        onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                                        className="bg-slate-900/50 border-slate-600 text-white"
                                    />
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="w-full border-slate-600 text-slate-300"
                                    onClick={() => setFilters({
                                        search: '', supplier_id: '', fabric_type: '', weave_type: '',
                                        gsm_min: '', gsm_max: '', status: '', tags: ''
                                    })}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center gap-2">
                    {selectedSwatches.length > 0 && (
                        <>
                            <span className="text-slate-400 text-sm">{selectedSwatches.length} selected</span>
                            <Button size="sm" variant="outline" onClick={clearSelection} className="border-slate-600 text-slate-300">
                                Clear
                            </Button>
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleSelectSwatches('shortlist')}>
                                <Star className="h-4 w-4 mr-1" />
                                Shortlist
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSelectSwatches('select')}>
                                <Check className="h-4 w-4 mr-1" />
                                Select
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => handleSelectSwatches('reject')}>
                                <X className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                        </>
                    )}
                    <Button variant="outline" size="sm" onClick={selectAll} className="border-slate-600 text-slate-300">
                        Select All
                    </Button>
                    <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                        <Button 
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'bg-slate-700' : ''}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-slate-700' : ''}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Pinterest-style Swatch Gallery */}
            {swatches.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-16 text-center">
                        <Palette className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No swatches yet</h3>
                        <p className="text-slate-400 mb-4">Waiting for supplier submissions</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'grid' ? (
                // Pinterest-style masonry grid
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {swatches.map((swatch) => (
                        <div 
                            key={swatch.id}
                            className={`break-inside-avoid bg-slate-800/50 border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-emerald-500/50 group ${
                                selectedSwatches.includes(swatch.id) 
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/50' 
                                    : 'border-slate-700'
                            }`}
                            onClick={() => toggleSwatchSelection(swatch.id)}
                        >
                            {/* Image */}
                            <div className="relative aspect-square bg-slate-700">
                                {swatch.thumbnail_url || swatch.image_url ? (
                                    <img 
                                        src={`${BACKEND_URL}${swatch.thumbnail_url || swatch.image_url}`}
                                        alt={swatch.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Palette className="h-12 w-12 text-slate-500" />
                                    </div>
                                )}
                                
                                {/* Selection indicator */}
                                <div className={`absolute top-2 left-2 p-1 rounded-full transition-all ${
                                    selectedSwatches.includes(swatch.id) 
                                        ? 'bg-emerald-500' 
                                        : 'bg-slate-800/80 opacity-0 group-hover:opacity-100'
                                }`}>
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                                
                                {/* Status badge */}
                                <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(swatch.status)}`}>
                                        {swatch.status}
                                    </Badge>
                                </div>
                                
                                {/* Duplicate warning */}
                                {swatch.is_duplicate && (
                                    <div className="absolute bottom-2 left-2">
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Duplicate
                                        </Badge>
                                    </div>
                                )}
                                
                                {/* Quick actions on hover */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowSwatchDetail(swatch);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Info */}
                            <div className="p-3">
                                <p className="text-white font-medium text-sm truncate">{swatch.name}</p>
                                <p className="text-slate-400 text-xs truncate">{swatch.supplier_name}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {swatch.metadata?.fabric_type && (
                                        <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                                            {swatch.metadata.fabric_type}
                                        </Badge>
                                    )}
                                    {swatch.metadata?.gsm && (
                                        <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                                            {swatch.metadata.gsm} GSM
                                        </Badge>
                                    )}
                                </div>
                                {swatch.tags?.length > 0 && (
                                    <div className="flex items-center gap-1 mt-2">
                                        {swatch.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-xs text-emerald-400">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // List view
                <div className="space-y-2">
                    {swatches.map((swatch) => (
                        <Card 
                            key={swatch.id}
                            className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-emerald-500/50 ${
                                selectedSwatches.includes(swatch.id) ? 'ring-2 ring-emerald-500' : ''
                            }`}
                            onClick={() => toggleSwatchSelection(swatch.id)}
                        >
                            <CardContent className="p-3 flex items-center gap-4">
                                <Checkbox 
                                    checked={selectedSwatches.includes(swatch.id)}
                                    onCheckedChange={() => toggleSwatchSelection(swatch.id)}
                                />
                                <div className="w-16 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                                    {swatch.thumbnail_url || swatch.image_url ? (
                                        <img 
                                            src={`${BACKEND_URL}${swatch.thumbnail_url || swatch.image_url}`}
                                            alt={swatch.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Palette className="h-6 w-6 text-slate-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-medium truncate">{swatch.name}</p>
                                        <span className="text-slate-500 text-xs">{swatch.swatch_code}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{swatch.supplier_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {swatch.metadata?.fabric_type && (
                                            <span className="text-xs text-slate-400">{swatch.metadata.fabric_type}</span>
                                        )}
                                        {swatch.metadata?.gsm && (
                                            <span className="text-xs text-slate-400">{swatch.metadata.gsm} GSM</span>
                                        )}
                                        {swatch.metadata?.composition && (
                                            <span className="text-xs text-slate-400">{swatch.metadata.composition}</span>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className={getStatusColor(swatch.status)}>
                                    {swatch.status}
                                </Badge>
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSwatchDetail(swatch);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Load More */}
            {hasMore && swatches.length > 0 && (
                <div className="text-center py-4">
                    <Button 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="border-slate-600 text-slate-300"
                    >
                        {loadingMore ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load More
                    </Button>
                </div>
            )}

            {/* Swatch Detail Modal */}
            <Dialog open={!!showSwatchDetail} onOpenChange={() => setShowSwatchDetail(null)}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                    {showSwatchDetail && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-white">{showSwatchDetail.name}</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    {showSwatchDetail.swatch_code} • {showSwatchDetail.supplier_name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6 py-4">
                                <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                                    <img 
                                        src={`${BACKEND_URL}${showSwatchDetail.image_url}`}
                                        alt={showSwatchDetail.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-slate-400 text-xs">Status</Label>
                                        <Badge variant="outline" className={`mt-1 ${getStatusColor(showSwatchDetail.status)}`}>
                                            {showSwatchDetail.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-400 text-xs">Fabric Type</Label>
                                            <p className="text-white capitalize">{showSwatchDetail.metadata?.fabric_type}</p>
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs">Weave</Label>
                                            <p className="text-white capitalize">{showSwatchDetail.metadata?.weave_type}</p>
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs">GSM</Label>
                                            <p className="text-white">{showSwatchDetail.metadata?.gsm || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs">Composition</Label>
                                            <p className="text-white">{showSwatchDetail.metadata?.composition || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs">Color</Label>
                                            <p className="text-white">{showSwatchDetail.metadata?.color || '-'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs">Pattern</Label>
                                            <p className="text-white">{showSwatchDetail.metadata?.pattern || '-'}</p>
                                        </div>
                                    </div>
                                    {showSwatchDetail.tags?.length > 0 && (
                                        <div>
                                            <Label className="text-slate-400 text-xs">Tags</Label>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {showSwatchDetail.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-emerald-400 border-emerald-500/30">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {showSwatchDetail.certifications?.length > 0 && (
                                        <div>
                                            <Label className="text-slate-400 text-xs">Certifications</Label>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {showSwatchDetail.certifications.map(cert => (
                                                    <Badge key={cert} variant="outline" className="text-blue-400 border-blue-500/30">
                                                        {cert}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowSwatchDetail(null)} className="border-slate-600 text-slate-300">
                                    Close
                                </Button>
                                <Button 
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => {
                                        toggleSwatchSelection(showSwatchDetail.id);
                                        setShowSwatchDetail(null);
                                    }}
                                >
                                    {selectedSwatches.includes(showSwatchDetail.id) ? 'Deselect' : 'Select'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManufacturerCollection;
