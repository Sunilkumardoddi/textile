import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Plus, Search, Filter, Eye, Edit2, Trash2,
    Loader2, RefreshCw, Palette, Image, Layers, CheckCircle,
    Clock, Package, TrendingUp, BarChart3, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { seasonsAPI } from '@/lib/api';
import { toast } from 'sonner';

const SeasonManagement = () => {
    const navigate = useNavigate();
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const [newSeason, setNewSeason] = useState({
        name: '',
        season_type: 'fall_winter',
        year: new Date().getFullYear(),
        description: '',
        target_styles: 100,
        budget: ''
    });

    useEffect(() => {
        fetchSeasons();
    }, []);

    const fetchSeasons = async () => {
        try {
            setLoading(true);
            const response = await seasonsAPI.getAll();
            setSeasons(response.data);
        } catch (error) {
            toast.error('Failed to load seasons');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSeason = async () => {
        if (!newSeason.name || !newSeason.season_type || !newSeason.year) {
            toast.error('Please fill in required fields');
            return;
        }

        setCreating(true);
        try {
            await seasonsAPI.create({
                ...newSeason,
                budget: newSeason.budget ? parseFloat(newSeason.budget) : null
            });
            toast.success('Season created successfully');
            setShowCreateDialog(false);
            setNewSeason({
                name: '',
                season_type: 'fall_winter',
                year: new Date().getFullYear(),
                description: '',
                target_styles: 100,
                budget: ''
            });
            fetchSeasons();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create season');
        } finally {
            setCreating(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            planning: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            design_phase: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            selection: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            production: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            completed: 'bg-green-500/10 text-green-400 border-green-500/30',
            archived: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        };
        return colors[status] || colors.planning;
    };

    const getSeasonTypeLabel = (type) => {
        const labels = {
            spring_summer: 'Spring/Summer',
            fall_winter: 'Fall/Winter',
            resort: 'Resort',
            pre_fall: 'Pre-Fall',
            holiday: 'Holiday'
        };
        return labels[type] || type;
    };

    const filteredSeasons = seasons.filter(season => {
        const matchesSearch = season.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            season.season_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || season.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="season-management">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Season Management</h1>
                    <p className="text-slate-400">Manage your seasonal collections and mood boards</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchSeasons} className="border-slate-600 text-slate-300">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setShowCreateDialog(true)}
                        data-testid="create-season-btn"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Season
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10">
                            <Calendar className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{seasons.length}</p>
                            <p className="text-slate-400 text-sm">Total Seasons</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10">
                            <Layers className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {seasons.filter(s => s.status === 'design_phase').length}
                            </p>
                            <p className="text-slate-400 text-sm">In Design Phase</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {seasons.reduce((acc, s) => acc + (s.total_designs_selected || 0), 0)}
                            </p>
                            <p className="text-slate-400 text-sm">Designs Selected</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10">
                            <Package className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {seasons.reduce((acc, s) => acc + (s.total_designs_submitted || 0), 0)}
                            </p>
                            <p className="text-slate-400 text-sm">Total Submissions</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search seasons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="design_phase">Design Phase</SelectItem>
                        <SelectItem value="selection">Selection</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Seasons Grid */}
            {filteredSeasons.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No seasons found</h3>
                        <p className="text-slate-400 mb-4">Create your first season to get started</p>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setShowCreateDialog(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Season
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSeasons.map((season) => {
                        const selectionRate = season.total_designs_submitted > 0
                            ? Math.round((season.total_designs_selected / season.total_designs_submitted) * 100)
                            : 0;
                        
                        return (
                            <Card 
                                key={season.id} 
                                className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                onClick={() => navigate(`/dashboard/brand/seasons/${season.id}`)}
                                data-testid={`season-card-${season.id}`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                {season.name}
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 flex items-center gap-2 mt-1">
                                                <span className="font-mono text-emerald-400">{season.season_code}</span>
                                                <span>•</span>
                                                <span>{getSeasonTypeLabel(season.season_type)}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(season.status)}>
                                            {season.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Progress Stats */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Design Selection</span>
                                            <span className="text-white font-medium">
                                                {season.total_designs_selected} / {season.total_designs_submitted}
                                            </span>
                                        </div>
                                        <Progress value={selectionRate} className="h-2" />
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-white">{season.total_designs_submitted}</p>
                                            <p className="text-xs text-slate-400">Submitted</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-emerald-400">{season.total_designs_selected}</p>
                                            <p className="text-xs text-slate-400">Selected</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-white">{season.target_styles || 0}</p>
                                            <p className="text-xs text-slate-400">Target</p>
                                        </div>
                                    </div>

                                    {/* View Button */}
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-slate-600 text-slate-300 group-hover:border-emerald-500/50 group-hover:text-emerald-400"
                                    >
                                        View Season
                                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create Season Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create New Season</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Set up a new seasonal collection for design submissions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Season Name *</Label>
                            <Input
                                placeholder="e.g., Winter Collection 2026"
                                value={newSeason.name}
                                onChange={(e) => setNewSeason(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                data-testid="season-name-input"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Season Type *</Label>
                                <Select 
                                    value={newSeason.season_type} 
                                    onValueChange={(v) => setNewSeason(prev => ({ ...prev, season_type: v }))}
                                >
                                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="spring_summer">Spring/Summer</SelectItem>
                                        <SelectItem value="fall_winter">Fall/Winter</SelectItem>
                                        <SelectItem value="resort">Resort</SelectItem>
                                        <SelectItem value="pre_fall">Pre-Fall</SelectItem>
                                        <SelectItem value="holiday">Holiday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Year *</Label>
                                <Input
                                    type="number"
                                    value={newSeason.year}
                                    onChange={(e) => setNewSeason(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Target Styles</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={newSeason.target_styles}
                                    onChange={(e) => setNewSeason(prev => ({ ...prev, target_styles: parseInt(e.target.value) }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Budget ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="500000"
                                    value={newSeason.budget}
                                    onChange={(e) => setNewSeason(prev => ({ ...prev, budget: e.target.value }))}
                                    className="bg-slate-900/50 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Description</Label>
                            <Textarea
                                placeholder="Describe the season theme, inspiration, and goals..."
                                value={newSeason.description}
                                onChange={(e) => setNewSeason(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-slate-900/50 border-slate-600 text-white"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600 text-slate-300">
                            Cancel
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleCreateSeason}
                            disabled={creating}
                            data-testid="submit-season-btn"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create Season
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SeasonManagement;
