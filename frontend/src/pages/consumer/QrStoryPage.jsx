import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Globe, Leaf, Factory, Package, Droplets, Shirt, CheckCircle2,
    MapPin, Calendar, Award, Shield, ChevronDown, ChevronUp,
    ExternalLink, QrCode, Share2, Heart, ArrowRight, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Mock product data (would come from QR code scan in production)
const mockProduct = {
    id: 'PROD-2024-001',
    name: 'Organic Cotton Classic T-Shirt',
    brand: 'EcoWear Collection',
    sku: 'ECW-TSH-ORG-001',
    color: 'Natural White',
    size: 'M',
    price: '$45.00',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    certifications: [
        { name: 'GOTS Certified', icon: Leaf, color: 'text-green-600' },
        { name: 'Fair Trade', icon: Heart, color: 'text-pink-600' },
        { name: 'Carbon Neutral', icon: Globe, color: 'text-blue-600' },
    ],
    sustainability: {
        waterSaved: '2,700L',
        co2Reduced: '7.5kg',
        recycledMaterials: '15%',
        organicContent: '95%',
    },
    journey: [
        {
            stage: 'Raw Material',
            title: 'Organic Cotton Farm',
            location: 'Gujarat, India',
            supplier: 'Organic Farms Co-operative',
            date: '2024-01-05',
            description: 'Hand-picked organic cotton grown without pesticides or synthetic fertilizers. Our partner farm uses traditional farming methods passed down through generations.',
            icon: Leaf,
            metrics: { quantity: '2.5 KG', quality: 'Grade A', certification: 'GOTS' },
            image: 'https://images.unsplash.com/photo-1599666433232-2b222e4abd86?w=300',
            expanded: false,
        },
        {
            stage: 'Spinning',
            title: 'Yarn Production',
            location: 'Coimbatore, India',
            supplier: 'SpinWell Textiles',
            date: '2024-01-12',
            description: 'Cotton fibers are spun into high-quality yarn using energy-efficient machinery powered by 60% renewable energy.',
            icon: Factory,
            metrics: { quantity: '2.2 KG Yarn', count: '30s Combed', energy: '60% Renewable' },
            image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300',
            expanded: false,
        },
        {
            stage: 'Fabric',
            title: 'Knitting Mill',
            location: 'Tirupur, India',
            supplier: 'KnitCraft Industries',
            date: '2024-01-18',
            description: 'Yarn is knitted into soft, breathable jersey fabric using circular knitting machines. Zero water waste through closed-loop systems.',
            icon: Package,
            metrics: { quantity: '8.5 Meters', gsm: '180 GSM', width: '72 inches' },
            image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300',
            expanded: false,
        },
        {
            stage: 'Processing',
            title: 'Dyeing & Finishing',
            location: 'Tirupur, India',
            supplier: 'ColorEco Processing',
            date: '2024-01-22',
            description: 'Natural, GOTS-approved dyes are used with water recycling technology. 90% of process water is treated and reused.',
            icon: Droplets,
            metrics: { color: 'Natural White', process: 'Bio-Wash', waterRecycled: '90%' },
            image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300',
            expanded: false,
        },
        {
            stage: 'Manufacturing',
            title: 'Cut, Make & Trim',
            location: 'Dhaka, Bangladesh',
            supplier: 'FairStitch Garments',
            date: '2024-01-28',
            description: 'Skilled artisans craft each garment with precision. Fair wages and safe working conditions are guaranteed for all 450 workers.',
            icon: Shirt,
            metrics: { workers: '450 Employees', certification: 'SA8000', wages: 'Living Wage+' },
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300',
            expanded: false,
        },
        {
            stage: 'Quality Check',
            title: 'Final Inspection',
            location: 'Dhaka, Bangladesh',
            supplier: 'QualityFirst Labs',
            date: '2024-02-02',
            description: 'Every garment undergoes rigorous quality checks for stitching, measurements, and fabric integrity before packaging.',
            icon: CheckCircle2,
            metrics: { tests: '12 Point Check', grade: 'A+', defectRate: '<0.5%' },
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
            expanded: false,
        },
    ],
};

export const QrStoryPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [expandedStages, setExpandedStages] = useState({});
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        // Simulate fetching product data based on QR code
        setProduct(mockProduct);
    }, [productId]);

    const toggleStage = (index) => {
        setExpandedStages(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${product.name} - Product Journey`,
                    text: `Check out the sustainable journey of this ${product.name}`,
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            toast.error('Failed to share');
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading product story...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/5" data-testid="qr-story-page">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-primary to-primary-deep text-primary-foreground">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Globe className="h-6 w-6" />
                            <span className="font-heading font-bold">TextileTrace</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-primary-foreground hover:bg-white/10"
                                onClick={() => setLiked(!liked)}
                            >
                                <Heart className={`h-5 w-5 ${liked ? 'fill-current text-red-400' : ''}`} />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-primary-foreground hover:bg-white/10"
                                onClick={handleShare}
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                                {product.brand}
                            </Badge>
                            <h1 className="font-heading text-xl font-bold mb-1">{product.name}</h1>
                            <p className="text-sm text-white/70">
                                {product.color} • Size {product.size} • {product.sku}
                            </p>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex flex-wrap gap-2 mt-6">
                        {product.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white/10 border-white/20 text-white">
                                <cert.icon className="h-3.5 w-3.5 mr-1" />
                                {cert.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sustainability Impact */}
            <div className="max-w-2xl mx-auto px-4 -mt-4">
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-secondary" />
                            Your Positive Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 rounded-xl bg-blue-50">
                                <p className="text-2xl font-bold text-blue-600">{product.sustainability.waterSaved}</p>
                                <p className="text-xs text-muted-foreground">Water Saved</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-green-50">
                                <p className="text-2xl font-bold text-green-600">{product.sustainability.co2Reduced}</p>
                                <p className="text-xs text-muted-foreground">CO2 Reduced</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-amber-50">
                                <p className="text-2xl font-bold text-amber-600">{product.sustainability.organicContent}</p>
                                <p className="text-xs text-muted-foreground">Organic Content</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-purple-50">
                                <p className="text-2xl font-bold text-purple-600">{product.sustainability.recycledMaterials}</p>
                                <p className="text-xs text-muted-foreground">Recycled Materials</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Product Journey */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <MapPin className="h-5 w-5 text-secondary" />
                    <h2 className="font-heading text-xl font-bold text-foreground">
                        The Story of Your Product
                    </h2>
                </div>

                <div className="space-y-4">
                    {product.journey.map((stage, index) => (
                        <Card 
                            key={index} 
                            className={`overflow-hidden transition-all ${expandedStages[index] ? 'ring-2 ring-secondary' : ''}`}
                            data-testid={`journey-stage-${index}`}
                        >
                            <div 
                                className="p-4 cursor-pointer"
                                onClick={() => toggleStage(index)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Stage Icon */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                            <stage.icon className="h-6 w-6 text-secondary" />
                                        </div>
                                        {index < product.journey.length - 1 && (
                                            <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-secondary/20 -translate-x-1/2" />
                                        )}
                                    </div>

                                    {/* Stage Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 mb-1 text-[10px]">
                                                    Step {index + 1}: {stage.stage}
                                                </Badge>
                                                <h3 className="font-medium text-foreground">{stage.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span>{stage.location}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                                {expandedStages[index] ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4 ml-16">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">{stage.supplier}</span>
                                        <span className="text-muted-foreground">{stage.date}</span>
                                    </div>
                                    <Progress value={100} className="h-1.5 bg-secondary/20" />
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedStages[index] && (
                                <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                                    <div className="ml-16 pt-4 space-y-4">
                                        {stage.image && (
                                            <div className="rounded-xl overflow-hidden h-32 bg-muted">
                                                <img 
                                                    src={stage.image} 
                                                    alt={stage.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {stage.description}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(stage.metrics).map(([key, value]) => (
                                                <div key={key} className="bg-background rounded-lg p-2 text-center">
                                                    <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                                    <p className="text-sm font-medium text-foreground">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <Shield className="h-4 w-4 text-success" />
                                            <span className="text-xs text-success">Verified by TextileTrace</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            {/* Trust Badge Footer */}
            <div className="bg-muted/50 border-t">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-secondary/10">
                                <QrCode className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Blockchain Verified</p>
                                <p className="text-xs text-muted-foreground">Every step is immutably recorded</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            View Certificate
                            <ExternalLink className="h-3.5 w-3.5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Brand Footer */}
            <div className="bg-primary text-primary-foreground py-8">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <Globe className="h-8 w-8 mx-auto mb-3 opacity-80" />
                    <p className="text-sm opacity-70">
                        Powered by TextileTrace - Building transparent supply chains
                    </p>
                    <p className="text-xs mt-2 opacity-50">
                        Scan more products to discover their story
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QrStoryPage;
