import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Globe, Leaf, Circle, Package, Droplets, Printer, Scissors, 
    Waves, Shirt, MapPin, Calendar, Award, CheckCircle2,
    ChevronDown, ChevronUp, Clock, Factory, Recycle, Heart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Mock product journey data
const mockProductData = {
    productId: 'TS-2024-001-5842',
    productName: 'Organic Cotton Essential T-Shirt',
    brand: 'Fashion Brand Co',
    collection: 'Spring 2024 Sustainable Line',
    color: 'Navy Blue',
    size: 'M',
    manufactureDate: '2024-01-28',
    certifications: ['GOTS', 'OEKO-TEX', 'Fair Trade'],
    sustainabilityScore: 92,
    carbonFootprint: '2.4 kg CO2e',
    waterSaved: '2,700 liters',
    journey: [
        {
            stage: 'Raw Material',
            icon: Leaf,
            color: '#22c55e',
            company: 'Rajasthan Organic Farms Cooperative',
            location: 'Rajasthan, India',
            coordinates: '26.9124° N, 75.7873° E',
            date: '2023-10-15',
            description: '100% Organic Cotton sourced from certified organic farms',
            certifications: ['GOTS Certified', 'Organic India'],
            details: {
                'Cotton Type': 'Long Staple Organic',
                'Harvest Season': 'Kharif 2023',
                'Farm Size': '150 hectares',
                'Farmers Involved': '45 families'
            },
            impact: 'No synthetic pesticides or fertilizers used'
        },
        {
            stage: 'Spinning',
            icon: Circle,
            color: '#3b82f6',
            company: 'SpinCo Textiles Ltd',
            location: 'Chittagong, Bangladesh',
            coordinates: '22.3569° N, 91.7832° E',
            date: '2023-11-05',
            description: 'Ring-spun yarn production with renewable energy',
            certifications: ['GOTS', 'GRS'],
            details: {
                'Yarn Count': '30s Ne Combed',
                'Process': 'Ring Spinning',
                'Energy Source': '60% Solar Power'
            },
            impact: '40% reduced energy consumption vs conventional'
        },
        {
            stage: 'Fabric Production',
            icon: Package,
            color: '#a855f7',
            company: 'KnitWell Textiles',
            location: 'Gazipur, Bangladesh',
            coordinates: '24.0023° N, 90.4264° E',
            date: '2023-11-20',
            description: 'Single Jersey knitting with zero-waste cutting',
            certifications: ['OEKO-TEX Standard 100'],
            details: {
                'Fabric Type': 'Single Jersey',
                'GSM': '180 gsm',
                'Width': '72 inches tubular'
            },
            impact: '15% fabric waste reduction through optimized cutting'
        },
        {
            stage: 'Dyeing & Processing',
            icon: Droplets,
            color: '#6366f1',
            company: 'ColorTex Industries',
            location: 'Savar, Bangladesh',
            coordinates: '23.8583° N, 90.2567° E',
            date: '2023-12-05',
            description: 'Low-impact reactive dyeing with water recycling',
            certifications: ['ZDHC Gateway', 'GOTS'],
            details: {
                'Dye Type': 'Low-impact Reactive',
                'Color': 'Navy Blue (Pantone 19-4024)',
                'Water Recycling': '80% water reused'
            },
            impact: '80% water recycled, zero harmful discharge'
        },
        {
            stage: 'Garment Manufacturing',
            icon: Scissors,
            color: '#ec4899',
            company: 'Garment Solutions Ltd',
            location: 'Dhaka, Bangladesh',
            coordinates: '23.8103° N, 90.4125° E',
            date: '2024-01-10',
            description: 'Fair wage facility with worker welfare programs',
            certifications: ['Fair Trade', 'WRAP', 'BSCI'],
            details: {
                'Facility Type': 'CMT Unit',
                'Workers': '850 employees',
                'Fair Wage': '125% of minimum wage'
            },
            impact: 'Living wages for all workers, healthcare provided'
        },
        {
            stage: 'Quality & Shipping',
            icon: Shirt,
            color: '#f97316',
            company: 'Fashion Brand Co QC Center',
            location: 'Dhaka, Bangladesh',
            coordinates: '23.7937° N, 90.4066° E',
            date: '2024-01-28',
            description: 'Final quality inspection and sustainable packaging',
            certifications: ['ISO 9001'],
            details: {
                'QC Pass Rate': '99.2%',
                'Packaging': '100% Recycled Materials',
                'Shipping': 'Carbon Offset Program'
            },
            impact: 'Plastic-free packaging, carbon-neutral shipping'
        }
    ]
};

export const ConsumerStory = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(mockProductData);
    const [expandedStage, setExpandedStage] = useState(null);
    const [showAllStages, setShowAllStages] = useState(false);

    // In production, fetch product data based on productId
    useEffect(() => {
        // Simulated API call
        console.log('Fetching product:', productId);
    }, [productId]);

    const displayedJourney = showAllStages ? product.journey : product.journey.slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-deep to-primary">
            {/* Header */}
            <div className="bg-card/95 backdrop-blur sticky top-0 z-50 border-b border-border">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="h-6 w-6 text-secondary" />
                        <span className="font-heading font-bold text-foreground">TextileTrace</span>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                    </Badge>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Product Header */}
                <div className="text-center text-primary-foreground">
                    <p className="text-sm text-primary-foreground/60 mb-1">{product.brand}</p>
                    <h1 className="font-heading text-2xl font-bold mb-2">{product.productName}</h1>
                    <p className="text-sm text-primary-foreground/70">{product.collection}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                            {product.color}
                        </Badge>
                        <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                            Size {product.size}
                        </Badge>
                    </div>
                </div>

                {/* Sustainability Score */}
                <Card className="overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Sustainability Score</p>
                                <p className="text-3xl font-bold text-success">{product.sustainabilityScore}/100</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                    <Recycle className="h-4 w-4" />
                                    {product.carbonFootprint}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Droplets className="h-4 w-4" />
                                    {product.waterSaved} saved
                                </div>
                            </div>
                        </div>
                        <Progress value={product.sustainabilityScore} className="h-2 [&>div]:bg-success" />
                        
                        {/* Certifications */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {product.certifications.map((cert) => (
                                <Badge key={cert} variant="outline" className="bg-success/10 text-success border-success/30">
                                    <Award className="h-3 w-3 mr-1" />
                                    {cert}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Journey Title */}
                <div className="text-center">
                    <h2 className="font-heading text-xl font-bold text-primary-foreground mb-1">
                        The Story of Your T-Shirt
                    </h2>
                    <p className="text-sm text-primary-foreground/60">
                        From farm to your wardrobe
                    </p>
                </div>

                {/* Journey Timeline */}
                <div className="space-y-4">
                    {displayedJourney.map((stage, index) => {
                        const Icon = stage.icon;
                        const isExpanded = expandedStage === index;
                        const isLast = index === displayedJourney.length - 1;

                        return (
                            <div key={index} className="relative">
                                {/* Timeline Line */}
                                {!isLast && (
                                    <div 
                                        className="absolute left-5 top-14 w-0.5 bg-primary-foreground/20"
                                        style={{ height: isExpanded ? '100%' : '60px' }}
                                    />
                                )}

                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        {/* Stage Header */}
                                        <button
                                            onClick={() => setExpandedStage(isExpanded ? null : index)}
                                            className="w-full p-4 flex items-start gap-4 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <div 
                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${stage.color}20` }}
                                            >
                                                <Icon className="h-5 w-5" style={{ color: stage.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-foreground">{stage.stage}</p>
                                                    <Badge 
                                                        variant="outline" 
                                                        className="text-[10px] h-5"
                                                        style={{ 
                                                            backgroundColor: `${stage.color}10`,
                                                            color: stage.color,
                                                            borderColor: `${stage.color}30`
                                                        }}
                                                    >
                                                        Step {index + 1}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">{stage.company}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {stage.location.split(',')[0]}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {stage.date}
                                                    </span>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </button>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                                                <p className="text-sm text-foreground">{stage.description}</p>

                                                {/* Location */}
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{stage.location}</span>
                                                </div>

                                                {/* Certifications */}
                                                <div className="flex flex-wrap gap-1">
                                                    {stage.certifications.map((cert) => (
                                                        <Badge key={cert} variant="secondary" className="text-[10px]">
                                                            <Award className="h-3 w-3 mr-1" />
                                                            {cert}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {/* Details */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(stage.details).map(([key, value]) => (
                                                        <div key={key} className="bg-muted/50 rounded-lg p-2">
                                                            <p className="text-[10px] text-muted-foreground">{key}</p>
                                                            <p className="text-xs font-medium text-foreground">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Impact */}
                                                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Heart className="h-4 w-4 text-success" />
                                                        <span className="text-xs font-medium text-success">Positive Impact</span>
                                                    </div>
                                                    <p className="text-xs text-success/80">{stage.impact}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Show More Button */}
                {!showAllStages && product.journey.length > 3 && (
                    <Button 
                        variant="outline" 
                        className="w-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
                        onClick={() => setShowAllStages(true)}
                    >
                        Show Full Journey ({product.journey.length - 3} more steps)
                        <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                )}

                {/* Footer */}
                <div className="text-center pt-6 pb-8 space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Globe className="h-5 w-5 text-secondary" />
                        <span className="font-heading font-bold text-primary-foreground">TextileTrace</span>
                    </div>
                    <p className="text-xs text-primary-foreground/40">
                        Verified traceability powered by blockchain technology
                    </p>
                    <p className="text-[10px] text-primary-foreground/30">
                        Product ID: {product.productId}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConsumerStory;
