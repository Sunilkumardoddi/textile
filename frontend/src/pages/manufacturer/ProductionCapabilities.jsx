import React, { useState } from 'react';
import { 
    Settings, CheckCircle2, Circle, Edit2, Save, X, Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Production capabilities
const capabilitiesData = [
    {
        id: 'cotton',
        name: 'Cotton Processing',
        description: 'Raw cotton cleaning, ginning, and preparation for spinning',
        enabled: true,
        details: {
            capacity: '10,000 kg/day',
            certifications: ['GOTS', 'OCS'],
            processes: ['Ginning', 'Cleaning', 'Blending', 'Carding']
        }
    },
    {
        id: 'spinning',
        name: 'Spinning',
        description: 'Converting raw fibers into yarn through various spinning methods',
        enabled: true,
        details: {
            capacity: '8,000 kg/day',
            certifications: ['GOTS', 'GRS'],
            processes: ['Ring Spinning', 'Open-End Spinning', 'Compact Spinning']
        }
    },
    {
        id: 'weaving',
        name: 'Weaving',
        description: 'Fabric production through interlacing yarn on looms',
        enabled: true,
        details: {
            capacity: '5,000 meters/day',
            certifications: ['GOTS', 'OEKO-TEX'],
            processes: ['Plain Weave', 'Twill Weave', 'Satin Weave', 'Jacquard']
        }
    },
    {
        id: 'dyeing',
        name: 'Dyeing',
        description: 'Coloring fabrics and yarns using various dyeing techniques',
        enabled: true,
        details: {
            capacity: '4,000 kg/day',
            certifications: ['GOTS', 'OEKO-TEX', 'ZDHC'],
            processes: ['Piece Dyeing', 'Yarn Dyeing', 'Garment Dyeing', 'Natural Dyes']
        }
    },
    {
        id: 'printing',
        name: 'Printing',
        description: 'Applying patterns and designs to fabrics',
        enabled: false,
        details: {
            capacity: '3,000 meters/day',
            certifications: ['GOTS', 'OEKO-TEX'],
            processes: ['Screen Printing', 'Digital Printing', 'Rotary Printing']
        }
    },
    {
        id: 'cmt',
        name: 'CMT (Cut-Make-Trim)',
        description: 'Complete garment manufacturing from cutting to finishing',
        enabled: true,
        details: {
            capacity: '15,000 pcs/day',
            certifications: ['WRAP', 'BSCI', 'SEDEX'],
            processes: ['Cutting', 'Sewing', 'Finishing', 'Packing', 'Quality Control']
        }
    },
    {
        id: 'washing',
        name: 'Washing',
        description: 'Garment washing and finishing treatments',
        enabled: true,
        details: {
            capacity: '8,000 pcs/day',
            certifications: ['OEKO-TEX', 'ZDHC'],
            processes: ['Stone Wash', 'Enzyme Wash', 'Softening', 'Bleaching']
        }
    },
];

export const ProductionCapabilities = () => {
    const [capabilities, setCapabilities] = useState(capabilitiesData);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);

    const handleToggle = (id) => {
        setCapabilities(capabilities.map(cap => 
            cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
        ));
        const cap = capabilities.find(c => c.id === id);
        toast.success(`${cap.name} ${cap.enabled ? 'disabled' : 'enabled'}`);
    };

    const handleEdit = (capability) => {
        setEditingId(capability.id);
        setEditData({ ...capability.details });
    };

    const handleSave = (id) => {
        setCapabilities(capabilities.map(cap => 
            cap.id === id ? { ...cap, details: editData } : cap
        ));
        setEditingId(null);
        setEditData(null);
        toast.success('Capability updated successfully');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Production Capabilities
                    </h1>
                    <p className="text-muted-foreground">
                        Declare and manage your factory&apos;s production capabilities
                    </p>
                </div>
            </div>

            {/* Capabilities Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-accent" />
                        Active Capabilities
                    </CardTitle>
                    <CardDescription>
                        {capabilities.filter(c => c.enabled).length} of {capabilities.length} capabilities enabled
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {capabilities.map((cap) => (
                            <Badge 
                                key={cap.id}
                                variant={cap.enabled ? 'default' : 'outline'}
                                className={cap.enabled 
                                    ? 'bg-accent text-accent-foreground' 
                                    : 'text-muted-foreground'
                                }
                            >
                                {cap.enabled ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                    <Circle className="h-3 w-3 mr-1" />
                                )}
                                {cap.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Capabilities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {capabilities.map((capability) => (
                    <Card 
                        key={capability.id}
                        className={`transition-all ${capability.enabled ? '' : 'opacity-60'}`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {capability.name}
                                        {capability.enabled && (
                                            <Badge variant="outline" className="border-success/50 text-success text-[10px]">
                                                Active
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {capability.description}
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={capability.enabled}
                                    onCheckedChange={() => handleToggle(capability.id)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editingId === capability.id ? (
                                /* Edit Mode */
                                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-dashed border-border">
                                    <div className="space-y-2">
                                        <Label>Capacity</Label>
                                        <Input
                                            value={editData.capacity}
                                            onChange={(e) => setEditData({...editData, capacity: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Certifications (comma separated)</Label>
                                        <Input
                                            value={editData.certifications.join(', ')}
                                            onChange={(e) => setEditData({
                                                ...editData, 
                                                certifications: e.target.value.split(',').map(s => s.trim())
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Processes (comma separated)</Label>
                                        <Textarea
                                            value={editData.processes.join(', ')}
                                            onChange={(e) => setEditData({
                                                ...editData, 
                                                processes: e.target.value.split(',').map(s => s.trim())
                                            })}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="hero" size="sm" onClick={() => handleSave(capability.id)}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Capacity</span>
                                            <span className="font-medium text-foreground">{capability.details.capacity}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">Certifications</span>
                                            <div className="flex flex-wrap gap-1">
                                                {capability.details.certifications.map((cert) => (
                                                    <Badge key={cert} variant="secondary" className="text-[10px]">
                                                        {cert}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">Processes</span>
                                            <div className="flex flex-wrap gap-1">
                                                {capability.details.processes.map((process) => (
                                                    <Badge key={process} variant="outline" className="text-[10px]">
                                                        {process}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full text-muted-foreground"
                                        onClick={() => handleEdit(capability)}
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Details
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProductionCapabilities;
