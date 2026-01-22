import React, { useState } from 'react';
import { 
    FileCheck, Upload, Search, Filter, Download, Trash2, 
    Eye, File, FileText, Image, Clock, CheckCircle2, Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock documents data
const mockDocuments = [
    { id: 1, name: 'GOTS Certificate 2024.pdf', type: 'certificate', category: 'Certification', size: '2.4 MB', uploadedAt: '2024-01-15', status: 'verified' },
    { id: 2, name: 'GRS Scope Certificate.pdf', type: 'certificate', category: 'Certification', size: '1.8 MB', uploadedAt: '2024-01-10', status: 'verified' },
    { id: 3, name: 'Social Audit Report - Jan 2024.pdf', type: 'report', category: 'Audit Report', size: '5.2 MB', uploadedAt: '2024-01-20', status: 'pending' },
    { id: 4, name: 'Environmental Compliance Report.pdf', type: 'report', category: 'Compliance', size: '3.1 MB', uploadedAt: '2024-01-18', status: 'verified' },
    { id: 5, name: 'Factory License 2024.pdf', type: 'license', category: 'License', size: '1.2 MB', uploadedAt: '2024-01-05', status: 'verified' },
    { id: 6, name: 'Test Report - Fabric Batch B2024-001.pdf', type: 'test', category: 'Test Report', size: '0.8 MB', uploadedAt: '2024-01-22', status: 'pending' },
    { id: 7, name: 'Worker Safety Training Records.xlsx', type: 'record', category: 'Training', size: '0.5 MB', uploadedAt: '2024-01-12', status: 'verified' },
    { id: 8, name: 'Chemical Inventory List.xlsx', type: 'record', category: 'Inventory', size: '0.3 MB', uploadedAt: '2024-01-08', status: 'verified' },
];

const documentCategories = [
    'Certification', 'Audit Report', 'Test Report', 'Compliance', 'License', 'Training', 'Inventory', 'Other'
];

const getFileIcon = (type) => {
    switch (type) {
        case 'certificate':
        case 'license':
            return <FileCheck className="h-8 w-8 text-green-500" />;
        case 'report':
            return <FileText className="h-8 w-8 text-blue-500" />;
        case 'test':
            return <File className="h-8 w-8 text-purple-500" />;
        default:
            return <File className="h-8 w-8 text-gray-500" />;
    }
};

export const Documents = () => {
    const [documents, setDocuments] = useState(mockDocuments);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newDoc, setNewDoc] = useState({ name: '', category: '', file: null });

    const filteredDocs = documents.filter(doc => {
        const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleUpload = () => {
        if (!newDoc.category) {
            toast.error('Please select a category');
            return;
        }
        
        const document = {
            id: Date.now(),
            name: newDoc.name || 'Uploaded Document.pdf',
            type: 'document',
            category: newDoc.category,
            size: '1.0 MB',
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        
        setDocuments([document, ...documents]);
        setNewDoc({ name: '', category: '', file: null });
        setShowUploadDialog(false);
        toast.success('Document uploaded successfully');
    };

    const handleDelete = (id) => {
        setDocuments(documents.filter(d => d.id !== id));
        toast.success('Document deleted');
    };

    const stats = {
        total: documents.length,
        verified: documents.filter(d => d.status === 'verified').length,
        pending: documents.filter(d => d.status === 'pending').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                        Documents
                    </h1>
                    <p className="text-muted-foreground">
                        Upload and manage production-related documents
                    </p>
                </div>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                        <Button variant="hero">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>
                                Add a new document to your records
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={newDoc.category}
                                    onValueChange={(value) => setNewDoc({...newDoc, category: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {documentCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Document Name</Label>
                                <Input
                                    value={newDoc.name}
                                    onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                                    placeholder="Enter document name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Upload File</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-secondary/50 transition-colors cursor-pointer">
                                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF, DOC, XLS, JPG, PNG (max 25MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="hero" onClick={handleUpload}>
                                Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Documents</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            </div>
                            <FileCheck className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Verified</p>
                                <p className="text-2xl font-bold text-success">{stats.verified}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-success/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Review</p>
                                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning/50" />
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
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {documentCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {getFileIcon(doc.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-foreground truncate" title={doc.name}>
                                        {doc.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{doc.category}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span>{doc.size}</span>
                                        <span>•</span>
                                        <span>{doc.uploadedAt}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <Badge 
                                    variant="outline"
                                    className={doc.status === 'verified' 
                                        ? 'bg-success/10 text-success border-success/30' 
                                        : 'bg-warning/10 text-warning border-warning/30'
                                    }
                                >
                                    {doc.status === 'verified' ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                        <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {doc.status}
                                </Badge>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredDocs.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No documents found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Documents;
