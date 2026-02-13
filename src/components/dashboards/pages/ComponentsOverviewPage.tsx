
'use client';

import { useState, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Gem } from 'lucide-react';
import { CardStack } from '@/components/ui/card-stack';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import { LinkPreview } from '@/components/ui/link-preview';
import { AnimateGrid } from '@/components/ui/animate-grid';
import Image from 'next/image';
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import FeatureSection from '@/components/ui/stack-feature-section';
import { FireworksBackground } from '@/components/ui/fireworks-show';
import { SparklesCore } from '@/components/ui/sparkles';
import MorphingLoader from '@/components/ui/morphing-loader';
import { ScratchToReveal } from '@/components/ui/scratch-to-reveal';


const testimonials = [
    {
      quote: "Amigoal hat die Art und Weise, wie wir unseren Club verwalten, revolutioniert. Es ist intuitiv, leistungsstark und spart uns unglaublich viel Zeit.",
      name: "Pep Guardiola",
      designation: "Cheftrainer, FC Musterstadt",
      src: "https://placehold.co/40x40.png?text=PG"
    },
    {
      quote: "Als Schatzmeister schätze ich die Finanz-Tools von Amigoal. Alles ist an einem Ort, transparent und einfach zu bedienen.",
      name: "Uli Hoeneß",
      designation: "Finanzvorstand, FC Beispiel",
      src: "https://placehold.co/40x40.png?text=UH"
    },
    {
      quote: "Die Kommunikation mit den Eltern war noch nie so einfach. Dank Amigoal sind alle immer auf dem neuesten Stand.",
      name: "Jürgen Klopp",
      designation: "Jugendkoordinator, SV Vorlage",
      src: "https://placehold.co/40x40.png?text=JK"
    },
];


const cardStackItems = [
    {id: 0, name: 'Vereinsfinanzen', designation: '', content: <p>Verwalten Sie mühelos Mitgliederbeiträge, Sponsoring-Einnahmen und Ausgaben. Erstellen Sie Budgets und behalten Sie den finanziellen Überblick.</p>},
    {id: 1, name: 'Spiel- & Trainingsplanung', designation: '', content: <p>Organisieren Sie Trainings, planen Sie Spieltage und kommunizieren Sie Aufstellungen und Taktiken direkt an Ihr Team.</p>},
    {id: 2, name: 'Mitgliederverwaltung', designation: '', content: <p>Eine zentrale Datenbank für all Ihre Mitglieder. Verfolgen Sie Mitgliedschaften, Rollen, Kontaktdaten und mehr an einem Ort.</p>},
];

const tabItems = [
    { value: 'basics', label: 'Grundlagen' },
    { value: 'layout', label: 'Layout & Container' },
    { value: 'forms', label: 'Formularelemente' },
    { value: 'notifications', label: 'Benachrichtigungen' },
    { value: 'complex', label: 'Komplexe Komponenten' },
    { value: 'interactive', label: 'Interaktive Komponenten' }
];

const animateGridCards = Array.from({ length: 16 }, () => ({
  logo: 'https://placehold.co/40x40.png?text=LOGO',
}));

export default function ComponentsOverviewPage() {
    const { toast } = useToast();
    const scratchRef = React.useRef<any>(null);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Komponenten-Übersicht</CardTitle>
          <CardDescription>
            Hier finden Sie eine Sammlung aller wiederverwendbaren
            UI-Komponenten, die in der Amigoal-Plattform verfügbar sind.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="basics" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex flex-col h-auto justify-start p-2">
            {tabItems.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="w-full justify-start">{tab.label}</TabsTrigger>
            ))}
        </TabsList>
        
        <div className="flex-1">
            <TabsContent value="basics">
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="component-group">
                      <h2 className="mb-2 text-lg font-semibold">Buttons</h2>
                      <div className="flex flex-wrap gap-2">
                        <Button>Default</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                      </div>
                    </div>
                     <div className="component-group space-y-4">
                      <h2 className="mb-2 text-lg font-semibold">Avatar & Badge</h2>
                       <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src="https://placehold.co/40x40.png?text=LM" alt="@leomessi" data-ai-hint="person portrait" />
                                <AvatarFallback>LM</AvatarFallback>
                            </Avatar>
                            <Badge>Aktiv</Badge>
                            <Badge variant="secondary">Passiv</Badge>
                            <Badge variant="destructive">Gesperrt</Badge>
                            <Badge variant="outline">Admin</Badge>
                       </div>
                    </div>
                    <div className="component-group space-y-2">
                        <h2 className="mb-2 text-lg font-semibold">Input & Label</h2>
                        <Label htmlFor="email-demo">E-Mail</Label>
                        <Input type="email" id="email-demo" placeholder="Email" />
                    </div>
                 </div>
            </TabsContent>

            <TabsContent value="layout">
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                     <div className="component-group">
                      <h2 className="mb-2 text-lg font-semibold">Card</h2>
                      <Card className="w-[350px]">
                        <CardHeader>
                          <CardTitle>Card-Titel</CardTitle>
                          <CardDescription>Card-Beschreibung</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Dies ist der Inhalt der Karte.</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Abbrechen</Button>
                            <Button>Bestätigen</Button>
                        </CardFooter>
                      </Card>
                    </div>
                    <div className="component-group">
                      <h2 className="mb-2 text-lg font-semibold">Accordion</h2>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Ist es zugänglich?</AccordionTrigger>
                          <AccordionContent>
                            Ja. Es entspricht den WAI-ARIA Design-Richtlinien.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Ist es gestylt?</AccordionTrigger>
                          <AccordionContent>
                            Ja. Es kommt mit Standard-Styling, das zu Ihrem Design passt.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                    <div className="component-group">
                        <h2 className="mb-2 text-lg font-semibold">Separator</h2>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium leading-none">Amigoal App</h4>
                            <p className="text-sm text-muted-foreground">Eine App für Fussballvereine.</p>
                        </div>
                        <Separator className="my-4" />
                         <div className="flex h-5 items-center space-x-4 text-sm">
                          <div>Blog</div>
                          <Separator orientation="vertical" />
                          <div>Docs</div>
                          <Separator orientation="vertical" />
                          <div>Source</div>
                        </div>
                    </div>
                 </div>
            </TabsContent>

            <TabsContent value="forms">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                     <div className="component-group space-y-4">
                         <h2 className="mb-2 text-lg font-semibold">Checkbox & Radio Group</h2>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="terms" />
                            <Label htmlFor="terms">AGB akzeptieren</Label>
                         </div>
                          <RadioGroup defaultValue="option-one">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-one" id="option-one" />
                                <Label htmlFor="option-one">Option Eins</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-two" id="option-two" />
                                <Label htmlFor="option-two">Option Zwei</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="component-group">
                        <h2 className="mb-2 text-lg font-semibold">Select</h2>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Ein Team wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="team-a">1. Mannschaft</SelectItem>
                                <SelectItem value="team-b">2. Mannschaft</SelectItem>
                                <SelectItem value="juniors">Junioren A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="component-group space-y-4">
                        <h2 className="mb-2 text-lg font-semibold">Switch & Slider</h2>
                         <div className="flex items-center space-x-2">
                            <Switch id="darkmode-switch" />
                            <Label htmlFor="darkmode-switch">Dark Mode</Label>
                        </div>
                        <Slider defaultValue={[50]} max={100} step={1} />
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h2 className="mb-2 text-lg font-semibold">Textarea</h2>
                        <Textarea placeholder="Schreiben Sie hier Ihre Nachricht." />
                    </div>
                </div>
            </TabsContent>
            
            <TabsContent value="notifications">
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <div className="component-group space-y-4">
                      <h2 className="mb-2 text-lg font-semibold">Alerts</h2>
                      <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Heads up!</AlertTitle>
                        <AlertDescription>
                          Sie können Komponenten zu Ihrer Whitelist hinzufügen.
                        </AlertDescription>
                      </Alert>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">Alert Dialog anzeigen</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction>Fortfahren</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                     <div className="component-group flex gap-4 items-center">
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Popover</h2>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline">Popover öffnen</Button></PopoverTrigger>
                                <PopoverContent className="w-80"><p>Dies ist der Inhalt des Popovers.</p></PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Tooltip</h2>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
                                    <TooltipContent><p>Dies ist ein Tooltip!</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                     <div className="component-group">
                      <h2 className="mb-2 text-lg font-semibold">Toast</h2>
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Geplantes Ereignis',
                            description: 'Freitag, 20. November um 17:00 Uhr',
                            action: <Button variant="secondary">Rückgängig</Button>
                          });
                        }}
                      >
                        Toast anzeigen
                      </Button>
                    </div>
                </div>
            </TabsContent>
            
            <TabsContent value="complex">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    <div className="component-group col-span-1 md:col-span-2">
                         <h2 className="mb-2 text-lg font-semibold">Table</h2>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Spieler</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead className="text-right">Beitrag</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Lionel Messi</TableCell>
                                    <TableCell>1. Mannschaft</TableCell>
                                    <TableCell className="text-right">CHF 300.00</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Cristiano Ronaldo</TableCell>
                                    <TableCell>Senioren</TableCell>
                                    <TableCell className="text-right">CHF 150.00</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                     <div className="component-group space-y-4">
                        <h2 className="mb-2 text-lg font-semibold">Progress</h2>
                        <Progress value={33} />
                    </div>
                     <div className="component-group">
                         <h3 className="mb-2 text-md font-semibold">Link Preview</h3>
                         <LinkPreview url="https://amigoal.app" className="font-bold underline">
                            amigoal.app
                        </LinkPreview>
                    </div>
                </div>
            </TabsContent>

             <TabsContent value="interactive">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Card Stack</h3>
                        <CardStack items={cardStackItems} />
                    </div>
                     <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Animated Testimonials</h3>
                        <Card>
                            <CardContent className="p-6">
                                <AnimatedTestimonials testimonials={testimonials}/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Animate Grid</h3>
                        <div className="flex items-center justify-center p-4">
                            <AnimateGrid
                              cards={animateGridCards}
                              logoSlot={(logo, index) => (
                                <Image
                                  key={index}
                                  className="logo mx-auto h-10 w-auto"
                                  src={logo}
                                  alt="Logo"
                                  width={40}
                                  height={40}
                                  data-ai-hint="company logo"
                                />
                              )}
                            />
                        </div>
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Interactive Image Accordion</h3>
                         <LandingAccordionItem />
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Orbit Animation</h3>
                         <FeatureSection />
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Fireworks</h3>
                        <Card className="h-96">
                            <FireworksBackground>
                                <div className="w-full h-full flex items-center justify-center">
                                    <h4 className="text-2xl font-bold text-white">Fireworks!</h4>
                                </div>
                            </FireworksBackground>
                        </Card>
                    </div>
                     <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Sparkles</h3>
                        <Card className="h-96 relative">
                             <SparklesCore
                                id="tsparticles-preview"
                                background="transparent"
                                minSize={0.6}
                                maxSize={1.4}
                                particleDensity={100}
                                className="w-full h-full"
                                particleColor="#FFFFFF"
                            />
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50">
                                <h4 className="text-2xl font-bold text-white">Sparkles!</h4>
                            </div>
                        </Card>
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Morphing Loader</h3>
                        <Card>
                            <CardContent className="p-6 flex justify-center">
                                <MorphingLoader />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="component-group col-span-1 md:col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Scratch To Reveal</h3>
                        <Card>
                             <CardContent className="p-6 flex flex-col items-center gap-4">
                                <ScratchToReveal
                                    ref={scratchRef}
                                    width={250}
                                    height={150}
                                    className="mx-auto flex items-center justify-center overflow-hidden rounded-2xl border-2 bg-muted"
                                    onComplete={() => toast({ title: "Freigerubbelt!", description: "Sie haben eine Prämie gewonnen." })}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Gem className="h-12 w-12 text-primary"/>
                                        <p className="text-lg font-bold">500 AMIGO</p>
                                    </div>
                                </ScratchToReveal>
                                <Button variant="outline" onClick={() => scratchRef.current?.reset()}>
                                    Nochmal rubbeln
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                 </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
