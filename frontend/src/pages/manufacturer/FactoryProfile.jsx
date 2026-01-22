import React, { useState } from 'react';
import { 
    Building2, MapPin, Phone, Mail, Globe, Users, 
    Edit2, Save, X, Plus, Trash2, Factory
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock factory data
const mockFactoryData = {
    name: 'Dhaka Textiles Manufacturing Ltd',
    registrationNo: 'DTM-2024-001',
    establishedYear: '2005',
    address: '123 Industrial Zone, Gazipur, Dhaka',
    country: 'Bangladesh',
    phone: '+880 2 8901234',
    email: 'info@dhakatextiles.com',
    website: 'www.dhakatextiles.com',
    employees: '2,500',
    description: 'Leading textile manufacturer specializing in organic cotton products with GOTS and GRS certifications.',
    units: [
        { id: 1, name: 'Spinning Unit A', type: 'Spinning', capacity: '5000 kg/day', status: 'Active' },
        { id: 2, name: 'Weaving Unit B', type: 'Weaving', capacity: '3000 meters/day', status: 'Active' },
        { id: 3, name: 'Dyeing Unit C', type: 'Dyeing', capacity: '2000 kg/day', status: 'Maintenance' },
        { id: 4, name: 'CMT Unit D', type: 'CMT', capacity: '10000 pcs/day', status: 'Active' },
    ]
};

export const FactoryProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [factoryData, setFactoryData] = useState(mockFactoryData);
    const [editData, setEditData] = useState(mockFactoryData);
    const [newUnit, setNewUnit] = useState({ name: '', type: '', capacity: '', status: 'Active' });
    const [showAddUnit, setShowAddUnit] = useState(false);

    const handleSave = () => {
        setFactoryData(editData);
        setIsEditing(false);
        toast.success('Factory profile updated successfully');
    };

    const handleCancel = () => {
        setEditData(factoryData);
        setIsEditing(false);
    };

    const handleAddUnit = () => {
        if (!newUnit.name || !newUnit.type || !newUnit.capacity) {
            toast.error('Please fill all unit details');
            return;
        }
        const updatedUnits = [...editData.units, { ...newUnit, id: Date.now() }];
        setEditData({ ...editData, units: updatedUnits });
        setNewUnit({ name: '', type: '', capacity: '', status: 'Active' });
        setShowAddUnit(false);
        toast.success('Unit added successfully');
    };

    const handleDeleteUnit = (id) => {
        const updatedUnits = editData.units.filter(unit => unit.id !== id);
        setEditData({ ...editData, units: updatedUnits });
        toast.success('Unit removed');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Factory Profile
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your factory information and production units
                    </p>
                </div>
                {!isEditing ? (
                    <Button variant="hero" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button variant="hero" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">General Information</TabsTrigger>
                    <TabsTrigger value="units">Production Units</TabsTrigger>
                </TabsList>

                {/* General Information Tab */}
                <TabsContent value="general" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info Card */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-accent" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Factory Name</Label>
                                        {isEditing ? (
                                            <Input
                                                id="name"
                                                value={editData.name}
                                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium">{factoryData.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationNo">Registration No.</Label>
                                        {isEditing ? (
                                            <Input
                                                id="registrationNo"
                                                value={editData.registrationNo}
                                                onChange={(e) => setEditData({...editData, registrationNo: e.target.value})}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium">{factoryData.registrationNo}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="establishedYear">Established Year</Label>
                                        {isEditing ? (
                                            <Input
                                                id="establishedYear"
                                                value={editData.establishedYear}
                                                onChange={(e) => setEditData({...editData, establishedYear: e.target.value})}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium">{factoryData.establishedYear}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employees">Total Employees</Label>
                                        {isEditing ? (
                                            <Input
                                                id="employees"
                                                value={editData.employees}
                                                onChange={(e) => setEditData({...editData, employees: e.target.value})}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium">{factoryData.employees}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    {isEditing ? (
                                        <Textarea
                                            id="description"
                                            value={editData.description}
                                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">{factoryData.description}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-accent" />
                                    Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    {isEditing ? (
                                        <Textarea
                                            id="address"
                                            value={editData.address}
                                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                                            rows={2}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground text-sm">{factoryData.address}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    {isEditing ? (
                                        <Input
                                            id="country"
                                            value={editData.country}
                                            onChange={(e) => setEditData({...editData, country: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-foreground font-medium">{factoryData.country}</p>
                                    )}
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {isEditing ? (
                                            <Input
                                                value={editData.phone}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                className="h-8"
                                            />
                                        ) : (
                                            <span className="text-foreground">{factoryData.phone}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {isEditing ? (
                                            <Input
                                                value={editData.email}
                                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                                className="h-8"
                                            />
                                        ) : (
                                            <span className="text-foreground">{factoryData.email}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        {isEditing ? (
                                            <Input
                                                value={editData.website}
                                                onChange={(e) => setEditData({...editData, website: e.target.value})}
                                                className="h-8"
                                            />
                                        ) : (
                                            <span className="text-foreground">{factoryData.website}</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Production Units Tab */}
                <TabsContent value="units" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Factory className="h-5 w-5 text-accent" />
                                    Production Units
                                </CardTitle>
                                <CardDescription>Manage your factory&apos;s production units and capacity</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowAddUnit(!showAddUnit)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Unit
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Unit Form */}
                            {showAddUnit && (
                                <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border space-y-4">
                                    <h4 className="font-medium text-foreground">Add New Unit</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Unit Name</Label>
                                            <Input
                                                placeholder="e.g., Spinning Unit E"
                                                value={newUnit.name}
                                                onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Input
                                                placeholder="e.g., Spinning, Weaving"
                                                value={newUnit.type}
                                                onChange={(e) => setNewUnit({...newUnit, type: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Capacity</Label>
                                            <Input
                                                placeholder="e.g., 5000 kg/day"
                                                value={newUnit.capacity}
                                                onChange={(e) => setNewUnit({...newUnit, capacity: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <Button variant="hero" onClick={handleAddUnit} className="flex-1">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add
                                            </Button>
                                            <Button variant="ghost" onClick={() => setShowAddUnit(false)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Units List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(isEditing ? editData.units : factoryData.units).map((unit) => (
                                    <div 
                                        key={unit.id} 
                                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-medium text-foreground">{unit.name}</h4>
                                                <p className="text-sm text-muted-foreground">{unit.type}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge 
                                                    variant="outline" 
                                                    className={unit.status === 'Active' 
                                                        ? 'border-success/50 text-success' 
                                                        : 'border-warning/50 text-warning'
                                                    }
                                                >
                                                    {unit.status}
                                                </Badge>
                                                {isEditing && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteUnit(unit.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-medium">Capacity:</span> {unit.capacity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FactoryProfile;
