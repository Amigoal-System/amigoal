
'use client';
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addClub, isSubdomainTaken } from '@/ai/flows/clubs';
import { useDebounce } from 'use-debounce';

const templates = ['Modern', 'Classic', 'Dynamic'];

export default function AddClubPage() {
    const [formData, setFormData] = useState({
        name: '',
        manager: '',
        website: '',
        clubLoginUser: '',
        contactEmail: '',
        phone: '',
        subdomain: '',
        template: 'Modern' as string | null,
    });
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
    const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
    const [debouncedSubdomain] = useDebounce(formData.subdomain, 500);
    
    const { toast } = useToast();
    const router = useRouter();

    const generateSubdomain = (name: string) => {
      return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    };

    const handleClubNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => {
            const slug = generateSubdomain(name);
            const newSubdomain = prev.template !== null ? slug : '';
            const newLoginUser = slug ? `admin@${slug}` : '';
            return { ...prev, name, subdomain: newSubdomain, clubLoginUser: newLoginUser };
        });
    };

    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = generateSubdomain(e.target.value);
        setFormData(prev => ({...prev, subdomain: value}));
    };
    
    const handleTemplateChange = (template: string | null) => {
        setFormData(prev => {
            const newSubdomain = template !== null ? (prev.subdomain || generateSubdomain(prev.name)) : '';
            return { ...prev, template, subdomain: newSubdomain };
        });
    }

    const checkSubdomain = async (value: string) => {
        if (!value) {
            setIsSubdomainAvailable(null);
            return;
        }
        setIsCheckingSubdomain(true);
        try {
            const isTaken = await isSubdomainTaken(value);
            setIsSubdomainAvailable(!isTaken);
        } catch(error) {
            console.error("Subdomain check failed:", error);
            setIsSubdomainAvailable(null);
            toast({
                title: "Fehler bei Subdomain-Prüfung",
                description: "Konnte nicht prüfen, ob die Subdomain verfügbar ist.",
                variant: 'destructive',
            });
        } finally {
            setIsCheckingSubdomain(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.template !== null && isSubdomainAvailable === false) {
             toast({ title: 'Subdomain vergeben', description: 'Bitte wählen Sie eine andere Subdomain.', variant: 'destructive' });
             return;
        }
        if (formData.template !== null && isCheckingSubdomain) {
             toast({ title: 'Subdomain-Prüfung läuft', description: 'Bitte warten Sie, bis die Subdomain-Verfügbarkeit geprüft wurde.', variant: 'destructive' });
             return;
        }

        const newClub = {
            ...formData,
            logo: `https://placehold.co/80x80.png?text=${formData.name.substring(0,2).toUpperCase()}`,
            paymentStatus: 'Paid' as const,
            overdueSince: null,
            url: formData.template !== null ? `${formData.subdomain}.amigoal.app` : null,
            hasWebsite: formData.template !== null,
        };

        try {
            await addClub(newClub);
            toast({
                title: 'Verein erstellt!',
                description: `${formData.name} wurde erfolgreich hinzugefügt.`
            });
            router.push('/de/dashboard/clubs');
        } catch (error) {
             console.error("Error creating club:", error);
            toast({
                title: 'Fehler',
                description: 'Der Verein konnte nicht erstellt werden.',
                variant: 'destructive',
            });
        }
    };
    
     React.useEffect(() => {
        if (formData.template !== null) {
            checkSubdomain(debouncedSubdomain);
        } else {
            setIsSubdomainAvailable(null);
        }
    }, [debouncedSubdomain, formData.template]);

    return (
        <div className="max-w-2xl mx-auto">
             <Button variant="ghost" asChild className="mb-4">
                <Link href="/de/dashboard/clubs">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Zurück zur Übersicht
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Neuen Verein hinzufügen</CardTitle>
                    <CardDescription>Füllen Sie die Details aus, um einen neuen Verein auf der Plattform zu registrieren.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="name">Name des Vereins</Label>
                            <Input id="name" value={formData.name} onChange={handleClubNameChange} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="manager">Club Manager</Label>
                            <Input id="manager" value={formData.manager} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="clubLoginUser">Login-Benutzername</Label>
                                <Input id="clubLoginUser" value={formData.clubLoginUser} onChange={handleInputChange} required placeholder="z.B. admin@fcverein" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                                <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefonnummer (optional)</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Website-Vorlage</Label>
                            <div className="flex flex-wrap gap-2">
                                {templates.map(t => (
                                    <Button key={t} type="button" variant={formData.template === t ? 'default' : 'outline'} onClick={() => handleTemplateChange(t)}>
                                        {t}
                                    </Button>
                                ))}
                                <Button type="button" variant={formData.template === null ? 'default' : 'outline'} onClick={() => handleTemplateChange(null)}>
                                    Keine Webseite
                                </Button>
                            </div>
                        </div>

                        {formData.template !== null && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="subdomain">Wunsch-Subdomain</Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="subdomain"
                                            value={formData.subdomain}
                                            onChange={handleSubdomainChange}
                                            required={formData.template !== null}
                                            className="rounded-r-none"
                                        />
                                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600 h-10">
                                            .amigoal.app
                                        </span>
                                        <div className="ml-2 w-5 h-5 flex items-center justify-center">
                                            {isCheckingSubdomain ? <Loader2 className="animate-spin h-4 w-4" /> :
                                            isSubdomainAvailable === true ? <Check className="text-green-500 h-5 w-5"/> :
                                            isSubdomainAvailable === false ? <X className="text-red-500 h-5 w-5"/> : null}
                                        </div>
                                    </div>
                                    {isSubdomainAvailable === false && <p className="text-red-500 text-xs mt-1">Diese Subdomain ist bereits vergeben.</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Bestehende Website (optional)</Label>
                                    <Input id="website" value={formData.website} onChange={handleInputChange} />
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isCheckingSubdomain || (formData.template !== null && isSubdomainAvailable === false)}>
                           Verein erstellen
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
