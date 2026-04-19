import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import data from '@/data/seasonPOData.json';

const { marketingTeams } = data;

const teamColors = {
    teal:   { bg: 'from-teal-600/20 to-teal-600/5', border: 'border-teal-500/40', dot: 'bg-teal-500', header: 'text-teal-400', titleBg: 'bg-teal-600' },
    blue:   { bg: 'from-blue-600/20 to-blue-600/5', border: 'border-blue-500/40', dot: 'bg-blue-500', header: 'text-blue-400', titleBg: 'bg-blue-600' },
    purple: { bg: 'from-purple-600/20 to-purple-600/5', border: 'border-purple-500/40', dot: 'bg-purple-500', header: 'text-purple-400', titleBg: 'bg-purple-600' },
    amber:  { bg: 'from-amber-600/20 to-amber-600/5', border: 'border-amber-500/40', dot: 'bg-amber-500', header: 'text-amber-400', titleBg: 'bg-amber-600' },
    orange: { bg: 'from-orange-600/20 to-orange-600/5', border: 'border-orange-500/40', dot: 'bg-orange-500', header: 'text-orange-400', titleBg: 'bg-orange-600' },
    red:    { bg: 'from-red-600/20 to-red-600/5', border: 'border-red-500/40', dot: 'bg-red-500', header: 'text-red-400', titleBg: 'bg-red-600' },
};

const MarketingTeamConfig = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 pb-8" data-testid="marketing-team-config">
            {/* Header bar */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">
                        North/South Teams & Designers | Collections/Sessions | Assign Orders | Prepare Suppliers Season-21
                    </p>
                    <h1 className="text-3xl font-bold text-white">Marketing Team Configuration</h1>
                    <p className="text-slate-400 mt-1">Team responsibilities, order assignment & supplier preparation</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/dashboard/brand')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                </Button>
            </div>

            {/* 2x3 team grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {marketingTeams.map(team => {
                    const colors = teamColors[team.color] || teamColors.teal;
                    return (
                        <Card key={team.id}
                            className={`bg-gradient-to-br ${colors.bg} border ${colors.border} hover:scale-[1.02] transition-all`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${colors.titleBg} flex items-center justify-center text-white font-bold text-sm`}>
                                        {team.id}
                                    </div>
                                    <div>
                                        <CardTitle className={`text-base ${colors.header}`}>{team.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                                {team.responsibilities.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
                                        <p className="text-slate-300 text-sm leading-relaxed">{r}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
                <Button variant="outline" className="border-teal-600/40 text-teal-400 hover:bg-teal-600/10"
                    onClick={() => navigate('/dashboard/brand/mood-punching')}>
                    Mood Board Punching →
                </Button>
                <Button variant="outline" className="border-orange-600/40 text-orange-400 hover:bg-orange-600/10"
                    onClick={() => navigate('/dashboard/brand/po-auto')}>
                    PO Auto-Generation →
                </Button>
            </div>
        </div>
    );
};

export default MarketingTeamConfig;
