

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperDescription, StepperSeparator } from '@/components/ui/stepper';
import { ArrowRight, Check, Package, ShieldQuestion, User, X, Users as UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AmigoalLogo } from '@/components/icons';
import { getConfiguration } from '@/ai/flows/configurations';
import type { SaasPackage } from '@/ai/flows/configurations.types';
import PasswordField from '@/components/ui/password-field';
import { addClub, isSubdomainTaken } from '@/ai/flows/clubs';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
// Simple translation helper for toasts
const toastTranslations = {
    de: {
        successTitle: 'Verein erfolgreich registriert!',
        successDesc: (clubName: string) => `${clubName} kann jetzt loslegen.`,
        errorTitle: 'Fehler bei der Registrierung',
        errorDesc: 'Bitte versuchen Sie es später erneut.',
        subdomainErrorTitle: 'Fehler bei Subdomain-Prüfung',
        subdomainErrorDescription: 'Konnte nicht prüfen, ob die Subdomain verfügbar ist.'
    },
    en: {
        successTitle: 'Club registered successfully!',
        successDesc: (clubName: string) => `${clubName} is ready to go.`,
        errorTitle: 'Registration Failed',
        errorDesc: 'Please try again later.',
        subdomainErrorTitle: 'Subdomain Check Error',
        subdomainErrorDescription: 'Could not check if the subdomain is available.'
    }
};

import { useDebounce } from 'use-debounce';
import { Loader2 } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import { type Locale } from '@/i18n.config';

const generateSubdomain = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
};

const Step1 = ({ formData, setFormData }) => {
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [debouncedSubdomain] = useDebounce(formData.subdomain, 500);
    const { toast } = useToast();
    const params = useParams();
    const lang = (params?.lang as Locale) || 'de';

  const checkSubdomain = async (value: string) => {
      if (!value) {
          setIsSubdomainAvailable(null);
          return;
      }
      setIsCheckingSubdomain(true);
      try {
          const isTaken = await isSubdomainTaken(value);
          setIsSubdomainAvailable(!isTaken);
      } catch (error) {
          console.error("Subdomain check failed:", error);
          setIsSubdomainAvailable(null);
          toast({
              title: toastTranslations[lang].subdomainErrorTitle,
              description: toastTranslations[lang].subdomainErrorDescription,
              variant: 'destructive',
          });
      } finally {
          setIsCheckingSubdomain(false);
      }
  };

  const handleClubNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => {
        const newSubdomain = generateSubdomain(name);
        return { ...prev, clubName: name, subdomain: newSubdomain };
    });
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = generateSubdomain(e.target.value);
    setFormData(prev => ({...prev, subdomain: value}));
  };

   React.useEffect(() => {
        checkSubdomain(debouncedSubdomain);
    }, [debouncedSubdomain]);

  return (
    <div className="space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="club-name">Name des Vereins</Label>
            <Input id="club-name" placeholder="FC Barcelona" required value={formData.clubName} onChange={handleClubNameChange} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="subdomain">Wunsch-Subdomain</Label>
            <div className="flex items-center">
                <Input
                    id="subdomain"
                    placeholder="fcbarcelona"
                    required
                    value={formData.subdomain}
                    onChange={handleSubdomainChange}
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
    </div>
  )
}

const Step2 = ({ formData, setFormData }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
        return (
                <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Ihr voller Name</Label>
                            <Input id="fullName" placeholder="Max Mustermann" required value={formData.fullName} onChange={handleInputChange}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Ihre E-Mail</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleInputChange}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="country">Land</Label>
                            <Input id="country" placeholder="z.B. Deutschland" required value={formData.country || ''} onChange={handleInputChange}/>
                        </div>
                         <PasswordField 
                                id="password"
                                label="Passwort"
                                placeholder="Passwort wählen..."
                                value={formData.password}
                                onChange={handleInputChange}
                        />
                </div>
        )
}

const Step3 = ({ formData, setFormData, packages }) => {
    return (
        <div className="grid md:grid-cols-3 gap-4">
            {packages.map(pkg => (
                <Card key={pkg.id} className={`cursor-pointer ${formData.package === pkg.id ? 'border-primary ring-2 ring-primary' : ''}`} onClick={() => setFormData(prev => ({...prev, package: pkg.id}))}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>{pkg.name}</CardTitle>
                            {pkg.isPopular && <Badge>Beliebt</Badge>}
                        </div>
                        <CardDescription className="text-2xl font-bold">{pkg.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                           <div className="flex items-center gap-2">
                               <UsersIcon className="h-4 w-4 text-primary"/>
                               <span>Bis zu <strong>{pkg.maxUsers}</strong> Nutzer</span>
                           </div>
                           <div className="flex items-center gap-2">
                               <Check className="h-4 w-4 text-green-500"/>
                               <span>Alle Kernfunktionen</span>
                           </div>
                           {pkg.description && <p className="text-xs text-muted-foreground pt-2">{pkg.description}</p>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

const Step4 = ({ formData, packages }) => {
    const selectedPackage = packages.find(p => p.id === formData.package);
    return (
        <div className="text-center space-y-4">
             <Check className="h-16 w-16 text-green-500 mx-auto bg-green-100 rounded-full p-2"/>
             <h2 className="text-2xl font-bold">Fast geschafft!</h2>
             <p className="text-muted-foreground">Bitte überprüfen Sie Ihre Angaben, bevor Sie die Registrierung abschliessen.</p>
             <Card className="text-left">
                <CardContent className="p-4 space-y-2 text-sm">
                     <p><strong>Verein:</strong> {formData.clubName}</p>
                     <p><strong>Subdomain:</strong> {formData.subdomain}.amigoal.app</p>
                     <p><strong>Ihr Name:</strong> {formData.fullName}</p>
                     <p><strong>Ihre E-Mail:</strong> {formData.email}</p>
                     <p><strong>Paket:</strong> {selectedPackage?.name} ({selectedPackage?.price})</p>
                </CardContent>
             </Card>
        </div>
    )
}


export default function RegisterPage() {
    const params = useParams();
    const router = useRouter();
    const lang = params.lang as Locale;
    const [dict, setDict] = useState<any>(null);
    const [step, setStep] = useState(0);
    const [saasPackages, setSaaSPackages] = useState<SaasPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { toast } = useToast();
    
    const [formData, setFormData] = useState({
        clubName: '',
        subdomain: '',
        fullName: '',
        email: '',
        password: '',
        package: 'pro',
        country: ''
    });

    useEffect(() => {
        if (lang) {
            const fetchDict = async () => {
                const d = await getDictionary(lang);
                setDict(d.register_page);
            };
            fetchDict();
        }
    }, [lang]);

    useEffect(() => {
        const fetchPackages = async () => {
            setIsLoading(true);
            const config = await getConfiguration();
            setSaaSPackages(config?.saasPackages || []);
            setIsLoading(false);
        };
        fetchPackages();
    }, []);
    
     const steps = [
        { label: dict?.step1.label, icon: <Check />, description: dict?.step1.description, content: <Step1 formData={formData} setFormData={setFormData} /> },
        { label: dict?.step2.label, icon: <User />, description: dict?.step2.description, content: <Step2 formData={formData} setFormData={setFormData} /> },
        { label: dict?.step3.label, icon: <Package />, description: dict?.step3.description, content: <Step3 formData={formData} setFormData={setFormData} packages={saasPackages}/> },
        { label: dict?.step4.label, icon: <ShieldQuestion />, description: dict?.step4.description, content: <Step4 formData={formData} packages={saasPackages} /> }
    ];

  const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                const newClubData = {
                    name: formData.clubName,
                    manager: formData.fullName,
                    logo: `https://placehold.co/80x80.png?text=${formData.clubName.substring(0,2).toUpperCase()}`,
                    clubLoginUser: formData.email,
                    contactEmail: formData.email,
                    paymentStatus: 'Paid' as const,
                    overdueSince: null,
                    url: `${formData.subdomain}.amigoal.app`,
                    hasWebsite: true,
                    template: 'Modern',
                    country: formData.country,
                    website: '',
                    phone: '',
                };
                await addClub(newClubData);
                toast({
                    title: dict.toast.successTitle,
                    description: dict.toast.successDescription.replace('{CLUB_NAME}', formData.clubName)
                });
                localStorage.setItem('amigoal_email', formData.email);
                localStorage.setItem('amigoal_active_role', 'Club-Admin');
                router.push(`/${lang}/dashboard`);
            } catch (error) {
                toast({
                    title: dict.toast.errorTitle,
                    description: dict.toast.errorDescription,
                    variant: 'destructive'
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    }
    
    const isStepValid = () => {
        switch(step) {
            case 0: return formData.clubName && formData.subdomain;
            case 1: return formData.fullName && formData.email && formData.password;
            case 2: return formData.package;
            default: return true;
        }
    }
    
    if (!dict) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-4xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AmigoalLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-headline">{dict.title}</CardTitle>
          <CardDescription>{dict.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto pb-4 mb-8">
              <Stepper value={step} className="min-w-max">
                  {steps.map((s, i) => (
                       <React.Fragment key={i}>
                          <StepperItem step={i}>
                              <StepperTrigger onClick={() => setStep(i)}>
                                  <StepperIndicator>{s.icon}</StepperIndicator>
                                  <div>
                                      <StepperTitle>{s.label}</StepperTitle>
                                      <StepperDescription>{s.description}</StepperDescription>
                                  </div>
                              </StepperTrigger>
                          </StepperItem>
                          {i < steps.length - 1 && <StepperSeparator />}
                      </React.Fragment>
                  ))}
              </Stepper>
            </div>
            
            <div className="min-h-[250px]">
                {isLoading ? <p>Lade Pakete...</p> : steps[step].content}
            </div>

        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={step === 0 || isSubmitting}>{dict.backButton}</Button>
            <Button onClick={handleNext} disabled={!isStepValid() || isSubmitting}>
                {isSubmitting && step === steps.length - 1 ? (
                    <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Wird registriert...
                    </>
                ) : (
                    <>
                        {step === steps.length - 1 ? dict.finishButton : dict.nextButton}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
