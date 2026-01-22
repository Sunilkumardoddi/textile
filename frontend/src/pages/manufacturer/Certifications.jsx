import React, { useState } from 'react';
import { 
    Award, Upload, Calendar, AlertTriangle, CheckCircle2, 
    Clock, Eye, Download, Trash2, Plus, Filter, Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Mock certifications data
const mockCertifications = [
    {
        id: 1,
        name: 'GOTS',
        fullName: 'Global Organic Textile Standard',
        certNumber: 'GOTS-2024-12345',
        issuedBy: 'Control Union',
        issueDate: '2023-03-15',
        expiryDate: '2024-03-14',
        status: 'expiring',
        daysLeft: 15,
        scope: 'Spinning, Weaving, Dyeing, CMT',
        documentUrl: '#'
    },
    {
        id: 2,
        name: 'GRS',
        fullName: 'Global Recycled Standard',
        certNumber: 'GRS-2024-67890',
        issuedBy: 'Textile Exchange',
        issueDate: '2023-06-01',
        expiryDate: '2024-06-01',
        status: 'valid',
        daysLeft: 120,
        scope: 'Recycled Content Processing',
        documentUrl: '#'
    },
    {
        id: 3,
        name: 'OEKO-TEX',
        fullName: 'OEKO-TEX Standard 100',
        certNumber: 'OT-2024-11111',
        issuedBy: 'Hohenstein Institute',
        issueDate: '2023-05-20',
        expiryDate: '2024-05-19',
        status: 'valid',
        daysLeft: 89,
        scope: 'All Product Classes',
        documentUrl: '#'
    },
    {
        id: 4,
        name: 'OCS',
        fullName: 'Organic Content Standard',
        certNumber: 'OCS-2024-22222',
        issuedBy: 'Control Union',
        issueDate: '2023-02-01',
        expiryDate: '2024-02-08',
        status: 'expired',
        daysLeft: -7,
        scope: 'Organic Fiber Processing',
        documentUrl: '#'
    },
    {
        id: 5,
        name: 'RCS',
        fullName: 'Recycled Claim Standard',
        certNumber: 'RCS-2024-33333',
        issuedBy: 'Textile Exchange',
        issueDate: '2023-08-10',
        expiryDate: '2024-08-09',
        status: 'valid',
        daysLeft: 180,
        scope: 'Recycled Input Verification',
        documentUrl: '#'
    },
];

const certificationTypes = [
    'GOTS', 'GRS', 'OCS', 'RCS', 'OEKO-TEX', 'WRAP', 'BSCI', 'SEDEX', 'SA8000', 'ISO 9001', 'ISO 14001', 'Other'
];

export const Certifications = () => {
    const [certifications, setCertifications] = useState(mockCertifications);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newCert, setNewCert] = useState({
        name: '',
        certNumber: '',
        issuedBy: '',
        issueDate: '',
        expiryDate: '',
        scope: ''
    });

    const filteredCerts = certifications.filter(cert => {
        const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
        const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cert.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'valid': return 'bg-success/10 text-success border-success/30';
            case 'expiring': return 'bg-warning/10 text-warning border-warning/30';
            case 'expired': return 'bg-destructive/10 text-destructive border-destructive/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'valid': return <CheckCircle2 className="h-4 w-4" />;
            case 'expiring': return <Clock className="h-4 w-4" />;
            case 'expired': return <AlertTriangle className="h-4 w-4" />;
            default: return null;
        }
    };

    const handleAddCertification = () => {
        if (!newCert.name || !newCert.certNumber || !newCert.expiryDate) {
            toast.error('Please fill in required fields');
            return;
        }

        const expiryDate = new Date(newCert.expiryDate);
        const today = new Date();
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let status = 'valid';
        if (daysLeft < 0) status = 'expired';
        else if (daysLeft <= 30) status = 'expiring';

        const certification = {
            id: Date.now(),
            ...newCert,
            fullName: newCert.name,
            status,
            daysLeft,
            documentUrl: '#'
        };

        setCertifications([...certifications, certification]);
        setNewCert({ name: '', certNumber: '', issuedBy: '', issueDate: '', expiryDate: '', scope: '' });
        setShowAddDialog(false);
        toast.success('Certification added successfully');
    };

    const handleDeleteCertification = (id) => {
        setCertifications(certifications.filter(c => c.id !== id));
        toast.success('Certification removed');
    };

    const stats = {
        total: certifications.length,
        valid: certifications.filter(c => c.status === 'valid').length,
        expiring: certifications.filter(c => c.status === 'expiring').length,
        expired: certifications.filter(c => c.status === 'expired').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Certifications
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your factory certifications and compliance documents
                    </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button variant="hero">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Certification</DialogTitle>
                            <DialogDescription>
                                Upload and register a new certification document
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Certification Type *</Label>
                                <Select
                                    value={newCert.name}
                                    onValueChange={(value) => setNewCert({...newCert, name: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select certification type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {certificationTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Certificate Number *</Label>
                                <Input
                                    value={newCert.certNumber}
                                    onChange={(e) => setNewCert({...newCert, certNumber: e.target.value})}
                                    placeholder="e.g., GOTS-2024-12345"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Issued By</Label>
                                <Input
                                    value={newCert.issuedBy}
                                    onChange={(e) => setNewCert({...newCert, issuedBy: e.target.value})}
                                    placeholder="e.g., Control Union"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Issue Date</Label>
                                    <Input
                                        type="date"
                                        value={newCert.issueDate}
                                        onChange={(e) => setNewCert({...newCert, issueDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expiry Date *</Label>
                                    <Input
                                        type="date"
                                        value={newCert.expiryDate}
                                        onChange={(e) => setNewCert({...newCert, expiryDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Scope</Label>
                                <Input
                                    value={newCert.scope}
                                    onChange={(e) => setNewCert({...newCert, scope: e.target.value})}
                                    placeholder="e.g., Spinning, Weaving, Dyeing"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Upload Document</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-secondary/50 transition-colors cursor-pointer">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PDF, JPG, PNG (max 10MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="hero" onClick={handleAddCertification}>
                                Add Certification
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            </div>
                            <Award className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Valid</p>
                                <p className="text-2xl font-bold text-success">{stats.valid}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-success/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                                <p className="text-2xl font-bold text-warning">{stats.expiring}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Expired</p>
                                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search certifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="valid">Valid</SelectItem>
                                <SelectItem value="expiring">Expiring Soon</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCerts.map((cert) => (
                    <Card key={cert.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        cert.status === 'valid' ? 'bg-success/10' :
                                        cert.status === 'expiring' ? 'bg-warning/10' :
                                        'bg-destructive/10'
                                    }`}>
                                        <Award className={`h-5 w-5 ${
                                            cert.status === 'valid' ? 'text-success' :
                                            cert.status === 'expiring' ? 'text-warning' :
                                            'text-destructive'
                                        }`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{cert.name}</CardTitle>
                                        <CardDescription className="text-xs">{cert.fullName}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className={getStatusColor(cert.status)}>
                                    {getStatusIcon(cert.status)}
                                    <span className="ml-1 capitalize">{cert.status}</span>
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Certificate No.</span>
                                    <span className="font-medium text-foreground">{cert.certNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Issued By</span>
                                    <span className="text-foreground">{cert.issuedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Expiry Date</span>
                                    <span className="text-foreground">{cert.expiryDate}</span>
                                </div>
                            </div>

                            {/* Expiry Progress */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Validity</span>
                                    <span className={
                                        cert.daysLeft > 30 ? 'text-success' :
                                        cert.daysLeft > 0 ? 'text-warning' :
                                        'text-destructive'
                                    }>
                                        {cert.daysLeft > 0 ? `${cert.daysLeft} days left` : `Expired ${Math.abs(cert.daysLeft)} days ago`}
                                    </span>
                                </div>
                                <Progress 
                                    value={Math.max(0, Math.min(100, (cert.daysLeft / 365) * 100))} 
                                    className={`h-1.5 ${
                                        cert.daysLeft <= 0 ? '[&>div]:bg-destructive' :
                                        cert.daysLeft <= 30 ? '[&>div]:bg-warning' : ''
                                    }`}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteCertification(cert.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCerts.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No certifications found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Certifications;
