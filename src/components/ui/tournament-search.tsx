
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Calendar, Search, X, Plus, Minus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import { cn } from '@/lib/utils';
import { InteractiveSwitzerlandMap } from './interactive-switzerland-map';
import { getConfiguration } from '@/ai/flows/configurations';
import type { TeamCategory } from '@/ai/flows/configurations.types';
import { de } from 'date-fns/locale';
import { format, addMonths } from 'date-fns';

export const TournamentSearch = () => {
    const [teamCategories, setTeamCategories] = useState<TeamCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('Turniere');

    const fetchCategories = useCallback(async () => {
        try {
            const config = await getConfiguration();
            // Assuming 'CH' is the relevant country code for now. This could be made dynamic.
            if (config && config.teamCategories && config.teamCategories['CH']) {
                setTeamCategories(config.teamCategories['CH']);
            }
        } catch (error) {
            console.error("Failed to fetch tournament categories", error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const months = useMemo(() => {
        const next12Months: { year: string, months: string[] }[] = [];
        const currentYearMonths: string[] = [];
        const nextYearMonths: string[] = [];
        
        const now = new Date();
        const currentYear = now.getFullYear();

        for (let i = 0; i < 12; i++) {
            const date = addMonths(now, i);
            const year = date.getFullYear().toString();
            const month = format(date, 'MMMM', { locale: de });
            
            if(year === currentYear.toString()) {
                if(!currentYearMonths.includes(month)) currentYearMonths.push(month);
            } else {
                 if(!nextYearMonths.includes(month)) nextYearMonths.push(month);
            }
        }
        
        if (currentYearMonths.length > 0) {
            next12Months.push({ year: currentYear.toString(), months: currentYearMonths });
        }
        if (nextYearMonths.length > 0) {
            next12Months.push({ year: (currentYear + 1).toString(), months: nextYearMonths });
        }

        return next12Months;
    }, []);

    const handleMonthClick = (month: string) => {
        setSelectedMonths(prev => 
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
        );
    };

    const handleClearSelection = () => {
        setSelectedCategory(null);
        setSelectedMonths([]);
        // We might need a way to reset the map state here if it's managed internally
    }

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-center text-lg">In welcher Kategorie spielt dein Team?</h3>
                        <div className="flex justify-center">
                            <Users className="w-24 h-24 text-muted-foreground" />
                        </div>
                        <Select onValueChange={setSelectedCategory} value={selectedCategory || ''}>
                            <SelectTrigger className="w-full max-w-xs mx-auto">
                                <SelectValue placeholder="Alle Kategorien" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle Kategorien</SelectItem>
                                {teamCategories.map(cat => (
                                     <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-center text-lg">Wo möchtest du spielen?</h3>
                        <div className="relative w-full h-48 mx-auto overflow-hidden flex items-center justify-center border rounded-lg bg-muted/20">
                           <InteractiveSwitzerlandMap onSelectionChange={() => {}}/>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-center text-lg">Wann soll das Turnier stattfinden?</h3>
                        <div className="space-y-3">
                            {months.map(({ year, months: monthList }) => (
                                <div key={year}>
                                    <p className="font-bold mb-2">{year}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {monthList.map(month => (
                                            <Button 
                                                key={month} 
                                                variant={selectedMonths.includes(month) ? "default" : "outline"}
                                                onClick={() => handleMonthClick(month)}
                                            >
                                                {month}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center mt-6 gap-4">
                     <Button variant="link" onClick={handleClearSelection} className="text-muted-foreground">
                        <X className="mr-1 h-4 w-4" /> Auswahl löschen
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700">
                        <Search className="mr-2 h-4 w-4" /> Turniere anzeigen
                    </Button>
                </div>
            </CardContent>
             <CardFooter className="p-0 border-t">
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-t-none h-12">
                        <TabsTrigger value="Turniere" className={cn("h-full rounded-none", activeTab === 'Turniere' && "bg-gray-700 text-white")}>Turniere</TabsTrigger>
                        <TabsTrigger value="Live-Resultate" className={cn("h-full rounded-none", activeTab === 'Live-Resultate' && "bg-red-200 text-red-800")}>Live-Resultate</TabsTrigger>
                        <TabsTrigger value="Trainingsspiele" className={cn("h-full rounded-none", activeTab === 'Trainingsspiele' && "bg-orange-100 text-orange-800")}>Trainingsspiele</TabsTrigger>
                    </TabsList>
                </Tabs>
             </CardFooter>
        </Card>
    );
};
