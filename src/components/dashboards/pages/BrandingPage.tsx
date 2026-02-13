'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTeam } from '@/hooks/use-team';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import { updateClub } from '@/ai/flows/clubs';
import { useMembers } from '@/hooks/useMembers'; // This is a bit of a hack to get club data for now

const availableFonts = [
    { name: 'PT Sans', value: "'PT Sans', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Oswald', value: "'Oswald', sans-serif" },
];

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${'\'\''}${f(0)}${f(8)}${f(4)}`;
}

const hexToHsl = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

const defaultBranding = {
    primary: { h: 217, s: 89, l: 61 },
    background: { h: 218, s: 93, l: 95 },
    accent: { h: 122, s: 53, l: 46 },
    bodyFont: "'PT Sans', sans-serif",
    headlineFont: "'PT Sans', sans-serif",
    logo: null,
};

function BrandingPage() {
    const { toast } = useToast();
    const { currentUserRole, clubName } = useTeam();
    const [branding, setBranding] = useState(defaultBranding);
    const [clubData, setClubData] = useState(null);

    const isSuperAdmin = currentUserRole === 'Super-Admin';

    const fetchBrandingData = useCallback(async () => {
        if (isSuperAdmin) {
            const config = await getConfiguration();
            setBranding(config?.branding || defaultBranding);
        } else {
            // A more direct way to fetch the user's club data.
            if(clubName) {
                const { getAllClubs } = await import('@/ai/flows/clubs');
                const allClubs = await getAllClubs(null); // Pass null to match new flow signature
                const myClub = allClubs.find(c => c.name === clubName);
                if (myClub) {
                    setClubData(myClub);
                    setBranding(myClub.branding || defaultBranding);
                }
            }
        }
    }, [isSuperAdmin, clubName]);
    
    useEffect(() => {
        fetchBrandingData();
    }, [fetchBrandingData]);


    const handleColorChange = (colorName: keyof typeof branding.primary, value: string) => {
        const { h, s, l } = hexToHsl(value);
        setBranding(prev => ({ ...prev, [colorName]: { h, s, l } }));
    };
    
    const applyTheme = useCallback(() => {
        const root = document.documentElement;
        if (branding.primary) root.style.setProperty('--primary', `${branding.primary.h} ${branding.primary.s}% ${branding.primary.l}%`);
        if (branding.background) root.style.setProperty('--background', `${branding.background.h} ${branding.background.s}% ${branding.background.l}%`);
        if (branding.accent) root.style.setProperty('--accent', `${branding.accent.h} ${branding.accent.s}% ${branding.accent.l}%`);
        
        if (branding.bodyFont) root.style.setProperty('--font-body', branding.bodyFont);
        if (branding.headlineFont) root.style.setProperty('--font-headline', branding.headlineFont);
    }, [branding]);

    const handleSave = async () => {
        applyTheme();
        
        if (isSuperAdmin) {
            const currentConfig = await getConfiguration();
            await updateConfiguration({ ...currentConfig, branding });
        } else if (clubData) {
            const updatedClub = { ...clubData, branding };
            await updateClub(updatedClub);
        }

        toast({
            title: "Branding gespeichert!",
            description: "Die neuen Farbeinstellungen wurden angewendet.",
        });
    };

    const handleReset = () => {
        setBranding(defaultBranding);
        // Re-apply default styles
        const root = document.documentElement;
        root.style.setProperty('--primary', '217 89% 61%');
        root.style.setProperty('--background', '218 93% 95%');
        root.style.setProperty('--accent', '122 53% 46%');
        root.style.setProperty('--font-body', "'PT Sans', sans-serif");
        root.style.setProperty('--font-headline', "'PT Sans', sans-serif");
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBranding(prev => ({...prev, logo: event.target?.result as string}));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    useEffect(() => {
       applyTheme();
    }, [branding, applyTheme]);

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette/>Branding & Design</CardTitle>
                <CardDescription>
                    {isSuperAdmin
                        ? 'Passen Sie das globale Erscheinungsbild der Amigoal-Plattform an.'
                        : `Passen Sie das Erscheinungsbild für Ihren Verein an.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Farbschema</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(branding).filter(([key]) => ['primary', 'background', 'accent'].includes(key)).map(([name, {h,s,l}]) => (
                             <div key={name} className="space-y-2">
                                <Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}></div>
                                    <Input type="color" value={hslToHex(h,s,l)} onChange={(e) => handleColorChange(name as keyof typeof branding.primary, e.target.value)} className="p-1 h-10"/>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader><CardTitle className="text-lg">Schriftarten</CardTitle></CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label>Text-Schriftart</Label>
                             <Select value={branding.bodyFont} onValueChange={(val) => setBranding(p => ({...p, bodyFont: val}))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {availableFonts.map(font => <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label>Überschriften-Schriftart</Label>
                            <Select value={branding.headlineFont} onValueChange={(val) => setBranding(p => ({...p, headlineFont: val}))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                     {availableFonts.map(font => <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                     </CardContent>
                </Card>
                <Card>
                     <CardHeader><CardTitle className="text-lg">Logo</CardTitle></CardHeader>
                     <CardContent className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full border bg-muted flex items-center justify-center">
                            {branding.logo ? <img src={branding.logo} alt="Vereinslogo" className="w-full h-full object-cover rounded-full"/> : <span className="text-xs text-muted-foreground">Logo</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo-upload">Neues Logo hochladen</Label>
                            <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload}/>
                            <p className="text-xs text-muted-foreground">Empfohlen: Quadratisches Format, min. 200x200px.</p>
                        </div>
                     </CardContent>
                </Card>
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4"/>Zurücksetzen</Button>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Änderungen speichern</Button>
            </CardFooter>
        </Card>
    );
}
export default BrandingPage;
