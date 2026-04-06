import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, Upload, Image, Palette, Layers, CheckCircle, XCircle,
    Loader2, RefreshCw, Eye, Edit2, Filter, Grid, List, Check, X,
    Package, TrendingUp, Clock, AlertTriangle, FileText, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { seasonsAPI } from '@/lib/api';
import { toast } from 'sonner';

const SeasonDetail = () => {
    const { seasonId } = useParams();
    const navigate = useNavigate();
    const [season, setSeason] = useState(null);
    const [stats, setStats] = useState(null);
    const [moodBoards, setMoodBoards] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Mood Board Dialog
    const [showMoodBoardDialog, setShowMoodBoardDialog] = useState(false);
    const [creatingMoodBoard, setCreatingMoodBoard] = useState(false);
    const [moodBoardForm, setMoodBoardForm] = useState({
        title: '',
        description: '',
        theme: '',
        target_market: '',
        images: []
    });
    
    // Design Selection
    const [selectedDesigns, setSelectedDesigns] = useState([]);
    const [designFilter, setDesignFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchData();
    }, [seasonId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [seasonRes, statsRes, moodBoardsRes, designsRes] = await Promise.all([
                seasonsAPI.getById(seasonId),
                seasonsAPI.getStats(seasonId),
                seasonsAPI.getMoodBoards(seasonId),
                seasonsAPI.getDesigns(seasonId, { limit: 100 })
            ]);
            setSeason(seasonRes.data);
            setStats(statsRes.data);
            setMoodBoards(moodBoardsRes.data);
            setDesigns(designsRes.data);
        } catch (error) {
            toast.error('Failed to load season data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMoodBoard = async () => {
        if (!moodBoardForm.title) {
            toast.error('Please enter a title');
            return;
        }

        setCreatingMoodBoard(true);
        try {
            const formData = new FormData();
            formData.append('title', moodBoardForm.title);
            formData.append('description', moodBoardForm.description || '');
            formData.append('theme', moodBoardForm.theme || '');
            formData.append('target_market', moodBoardForm.target_market || '');
            
            moodBoardForm.images.forEach(file => {
                formData.append('images', file);
            });

            await seasonsAPI.createMoodBoard(seasonId, formData);
            toast.success('Mood board created');
            setShowMoodBoardDialog(false);
            setMoodBoardForm({ title: '', description: '', theme: '', target_market: '', images: [] });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create mood board');
        } finally {
            setCreatingMoodBoard(false);
        }
    };

    const handleSelectDesigns = async (action) => {
        if (selectedDesigns.length === 0) {
            toast.error('Please select at least one design');
            return;
        }

        try {
            await seasonsAPI.selectDesigns(seasonId, {
                design_ids: selectedDesigns,
                action: action,
                notes: action === 'reject' ? 'Not selected for this season' : null
            });
            toast.success(`${selectedDesigns.length} designs ${action}ed`);
            setSelectedDesigns([]);
            fetchData();
        } catch (error) {
            toast.error('Failed to update designs');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            selected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
            revision_requested: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        };
        return colors[status] || colors.submitted;
    };

    const filteredDesigns = designs.filter(d => 
        designFilter === 'all' || d.status === designFilter
    );

    const toggleDesignSelection = (designId) => {
        setSelectedDesigns(prev => 
            prev.includes(designId) 
                ? prev.filter(id => id !== designId)
                : [...prev, designId]
        );
    };

    const selectAllVisible = () => {
        const visibleIds = filteredDesigns.map(d => d.id);
        setSelectedDesigns(visibleIds);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    if (!season) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Season not found</p>
            </div>
        );
    }

    const selectionRate = stats?.total_submitted > 0 
        ? Math.round((stats?.total_selected || 0) / stats.total_submitted * 100) 
        : 0;

    return (
        <div className="space-y-6" data-testid="season-detail">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard/brand/seasons')}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{season.name}</h1>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                            {season.season_code}
                        </Badge>
                    </div>
                    <p className="text-slate-400 mt-1">{season.description}</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="border-slate-600 text-slate-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Package className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats?.total_submitted || 0}</p>
                                <p className="text-xs text-slate-400">Designs Submitted</p>
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
                                <p className="text-2xl font-bold text-emerald-400">{stats?.designs_by_status?.selected || 0}</p>
                                <p className="text-xs text-slate-400">Selected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Clock className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-400">{stats?.designs_by_status?.submitted || 0}</p>
                                <p className="text-xs text-slate-400">Pending Review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Palette className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{moodBoards.length}</p>
                                <p className="text-xs text-slate-400">Mood Boards</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/10">
                                <TrendingUp className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{selectionRate}%</p>
                                <p className="text-xs text-slate-400">Selection Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Progress to Target</span>
                        <span className="text-white font-medium">
                            {stats?.designs_by_status?.selected || 0} / {season.target_styles} styles
                        </span>
                    </div>
                    <Progress 
                        value={((stats?.designs_by_status?.selected || 0) / (season.target_styles || 1)) * 100} 
                        className="h-3"
                    />
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">Overview</TabsTrigger>
                    <TabsTrigger value="mood-boards" className="data-[state=active]:bg-emerald-600">Mood Boards</TabsTrigger>
                    <TabsTrigger value="designs" className="data-[state=active]:bg-emerald-600">Designs</TabsTrigger>
                    <TabsTrigger value="suppliers" className="data-[state=active]:bg-emerald-600">Suppliers</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Designs by Category */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Designs by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(stats?.designs_by_category || {}).map(([category, count]) => (
                                        <div key={category} className="flex items-center justify-between">
                                            <span className="text-slate-300 capitalize">{category}</span>
                                            <span className="text-white font-medium">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(stats?.designs_by_category || {}).length === 0 && (
                                        <p className="text-slate-500 text-center py-4">No designs yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Suppliers */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Top Suppliers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(stats?.designs_by_supplier || []).slice(0, 5).map((supplier) => (
                                        <div key={supplier._id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                                            <span className="text-slate-300">{supplier.supplier_name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-400 text-sm">{supplier.submitted} submitted</span>
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                    {supplier.selected} selected
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {(stats?.designs_by_supplier || []).length === 0 && (
                                        <p className="text-slate-500 text-center py-4">No submissions yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Mood Boards Tab */}
                <TabsContent value="mood-boards" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Mood Boards</h3>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setShowMoodBoardDialog(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Mood Board
                        </Button>
                    </div>

                    {moodBoards.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Image className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No mood boards yet</h3>
                                <p className="text-slate-400 mb-4">Create mood boards to inspire your suppliers</p>
                                <Button 
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => setShowMoodBoardDialog(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Mood Board
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {moodBoards.map((mb) => (
                                <Card key={mb.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                                    {mb.images && mb.images.length > 0 ? (
                                        <div className="h-40 bg-slate-700 flex items-center justify-center">
                                            <img 
                                                src={`${process.env.REACT_APP_BACKEND_URL}${mb.images[0]}`}
                                                alt={mb.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-slate-700 flex items-center justify-center">
                                            <Image className="h-12 w-12 text-slate-500" />
                                        </div>
                                    )}
                                    <CardContent className="p-4">
                                        <h4 className="text-white font-medium">{mb.title}</h4>
                                        {mb.theme && <p className="text-slate-400 text-sm mt-1">{mb.theme}</p>}
                                        <div className="flex items-center gap-2 mt-3">
                                            <Badge variant="outline" className="bg-slate-700 text-slate-300">
                                                {mb.images?.length || 0} images
                                            </Badge>
                                            {mb.color_palette?.length > 0 && (
                                                <div className="flex -space-x-1">
                                                    {mb.color_palette.slice(0, 4).map((color, i) => (
                                                        <div 
                                                            key={i}
                                                            className="w-5 h-5 rounded-full border-2 border-slate-800"
                                                            style={{ backgroundColor: color.hex_code }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Designs Tab */}
                <TabsContent value="designs" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Select value={designFilter} onValueChange={setDesignFilter}>
                                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter designs" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all">All Designs</SelectItem>
                                    <SelectItem value="submitted">Pending Review</SelectItem>
                                    <SelectItem value="selected">Selected</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={selectAllVisible} className="border-slate-600 text-slate-300">
                                Select All ({filteredDesigns.length})
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedDesigns.length > 0 && (
                                <>
                                    <span className="text-slate-400 text-sm">{selectedDesigns.length} selected</span>
                                    <Button 
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => handleSelectDesigns('select')}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Select
                                    </Button>
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        onClick={() => handleSelectDesigns('reject')}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </>
                            )}
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

                    {filteredDesigns.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No designs found</h3>
                                <p className="text-slate-400">Waiting for supplier submissions</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
                            {filteredDesigns.map((design) => (
                                <Card 
                                    key={design.id} 
                                    className={`bg-slate-800/50 border-slate-700 overflow-hidden cursor-pointer transition-all ${
                                        selectedDesigns.includes(design.id) ? 'ring-2 ring-emerald-500' : ''
                                    }`}
                                    onClick={() => toggleDesignSelection(design.id)}
                                >
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="h-40 bg-slate-700 relative">
                                                {design.images && design.images.length > 0 ? (
                                                    <img 
                                                        src={`${process.env.REACT_APP_BACKEND_URL}${design.images[0]}`}
                                                        alt={design.style_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Layers className="h-8 w-8 text-slate-500" />
                                                    </div>
                                                )}
                                                {selectedDesigns.includes(design.id) && (
                                                    <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                                {design.is_duplicate && (
                                                    <div className="absolute top-2 left-2">
                                                        <Badge variant="destructive" className="text-xs">Duplicate</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-white font-medium text-sm truncate">{design.style_name}</p>
                                                        <p className="text-slate-400 text-xs">{design.supplier_name}</p>
                                                    </div>
                                                    <Badge variant="outline" className={`text-xs ${getStatusColor(design.status)}`}>
                                                        {design.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-500 text-xs mt-1">{design.design_number}</p>
                                            </CardContent>
                                        </>
                                    ) : (
                                        <CardContent className="p-3 flex items-center gap-4">
                                            <Checkbox 
                                                checked={selectedDesigns.includes(design.id)}
                                                onCheckedChange={() => toggleDesignSelection(design.id)}
                                            />
                                            <div className="w-16 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                                                {design.images && design.images.length > 0 ? (
                                                    <img 
                                                        src={`${process.env.REACT_APP_BACKEND_URL}${design.images[0]}`}
                                                        alt={design.style_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Layers className="h-6 w-6 text-slate-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">{design.style_name}</p>
                                                <p className="text-slate-400 text-sm">{design.supplier_name} • {design.category}</p>
                                            </div>
                                            <Badge variant="outline" className={getStatusColor(design.status)}>
                                                {design.status}
                                            </Badge>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Suppliers Tab */}
                <TabsContent value="suppliers" className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Supplier Performance</CardTitle>
                            <CardDescription className="text-slate-400">
                                Design submissions and selection rates by supplier
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(stats?.designs_by_supplier || []).map((supplier) => {
                                    const rate = supplier.submitted > 0 
                                        ? Math.round((supplier.selected / supplier.submitted) * 100) 
                                        : 0;
                                    return (
                                        <div key={supplier._id} className="p-4 rounded-lg bg-slate-900/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">{supplier.supplier_name}</span>
                                                <span className="text-emerald-400 font-medium">{rate}% selected</span>
                                            </div>
                                            <Progress value={rate} className="h-2 mb-2" />
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span>{supplier.submitted} submitted</span>
                                                <span>{supplier.selected} selected</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(stats?.designs_by_supplier || []).length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No supplier data yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Mood Board Dialog */}
            <Dialog open={showMoodBoardDialog} onOpenChange={setShowMoodBoardDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create Mood Board</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Upload images and define the creative direction
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Title *</Label>
                            <Input
                                placeholder="e.g., Urban Street Style"
                                value={moodBoardForm.title}
                                onChange={(e) => setMoodBoardForm(prev => ({ ...prev, title: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Theme</Label>
                            <Input
                                placeholder="e.g., Minimalist, Bohemian, Athletic"
                                value={moodBoardForm.theme}
                                onChange={(e) => setMoodBoardForm(prev => ({ ...prev, theme: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Target Market</Label>
                            <Input
                                placeholder="e.g., Young Adults, Premium Segment"
                                value={moodBoardForm.target_market}
                                onChange={(e) => setMoodBoardForm(prev => ({ ...prev, target_market: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Description</Label>
                            <Textarea
                                placeholder="Describe the mood, colors, and inspiration..."
                                value={moodBoardForm.description}
                                onChange={(e) => setMoodBoardForm(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Upload Images</Label>
                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setMoodBoardForm(prev => ({ 
                                        ...prev, 
                                        images: Array.from(e.target.files) 
                                    }))}
                                    className="hidden"
                                    id="mood-board-images"
                                />
                                <label htmlFor="mood-board-images" className="cursor-pointer">
                                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">Click to upload images</p>
                                    {moodBoardForm.images.length > 0 && (
                                        <p className="text-emerald-400 text-sm mt-2">
                                            {moodBoardForm.images.length} file(s) selected
                                        </p>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMoodBoardDialog(false)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleCreateMoodBoard}
                            disabled={creatingMoodBoard}
                        >
                            {creatingMoodBoard ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SeasonDetail;
