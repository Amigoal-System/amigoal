'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { DatePicker } from './ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Camera, Image as ImageIcon, ArrowRight, CheckCircle, GripVertical, Trash2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useMembers } from '@/hooks/useMembers';
import { useTeam } from '@/hooks/use-team';
import { Textarea } from './ui/textarea';

export const ExpenseDetailModal = ({ expense, isOpen, onOpenChange, onUpdate }) => {
    const [status, setStatus] = useState(expense?.status);

    useEffect(() => {
        if(expense) setStatus(expense.status);
    }, [expense]);

    if (!expense) return null;

    const handleStatusChange = () => {
        onUpdate({ id: expense.id, status });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Spesendetail</DialogTitle>
                    <DialogDescription>
                        Details zur Ausgabe: {expense.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p><strong>Typ:</strong> {expense.type}</p>
                    <p><strong>Beschreibung:</strong> {expense.description}</p>
                    <p><strong>Datum:</strong> {new Date(expense.date).toLocaleDateString('de-CH')}</p>
                    <p><strong>Betrag:</strong> CHF {expense.sum.toFixed(2)}</p>
                    <p><strong>Eingereicht von:</strong> {expense.submittedBy}</p>
                    <div className="flex items-center gap-2">
                        <Label>Status:</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Offen">Offen</SelectItem>
                                <SelectItem value="Genehmigt">Genehmigt</SelectItem>
                                <SelectItem value="Abgelehnt">Abgelehnt</SelectItem>
                                <SelectItem value="Ausbezahlt">Ausbezahlt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                    <Button onClick={handleStatusChange}>Status speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const CreateExpenseModal = ({ isOpen, onOpenChange, onSave }) => {
    const [step, setStep] = useState(1);
    const [expenseItems, setExpenseItems] = useState([{ id: Date.now(), type: 'Schiedsrichter', details: '', amount: '', date: new Date(), receipts: [] }]);
    const [isForSelf, setIsForSelf] = useState<boolean | null>(null);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    const [isCapturing, setIsCapturing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();
    const { club } = useTeam();
    const { members } = useMembers(club?.id);

    const handleAddItem = () => {
        setExpenseItems([...expenseItems, { id: Date.now(), type: 'Spesen', details: '', amount: '', date: new Date(), receipts: [] }]);
    };

    const handleRemoveItem = (id) => {
        setExpenseItems(expenseItems.filter(item => item.id !== id));
    };
    
    const handleItemChange = (id, field, value) => {
        setExpenseItems(expenseItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, itemId) => {
        const files = e.target.files;
        if (files) {
            const newReceipts: string[] = [];
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newReceipts.push(reader.result as string);
                    if (newReceipts.length === files.length) {
                        setExpenseItems(prevItems => prevItems.map(item => 
                            item.id === itemId ? { ...item, receipts: [...item.receipts, ...newReceipts] } : item
                        ));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleStartCamera = async () => {
        setIsCapturing(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast({
                variant: 'destructive',
                title: 'Kamerafehler',
                description: 'Kamerazugriff wurde verweigert. Bitte Berechtigung erteilen.',
            });
            setIsCapturing(false);
        }
    };

    const handleCapturePhoto = (itemId) => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setExpenseItems(prevItems => prevItems.map(item => 
                item.id === itemId ? { ...item, receipts: [...item.receipts, dataUrl] } : item
            ));
            handleStopCamera();
        }
    };

    const handleStopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
    };
    
    const removeReceipt = (itemId, indexToRemove: number) => {
        setExpenseItems(prevItems => prevItems.map(item =>
            item.id === itemId ? {...item, receipts: item.receipts.filter((_, index) => index !== indexToRemove)} : item
        ));
    };
    
    const handleNextStep = () => {
        if (step === 1 && isForSelf) {
            setStep(3); // Skip member selection for self
        } else {
            setStep(s => s + 1);
        }
    }

    const handleBackStep = () => {
        if(step === 3 && isForSelf) {
            setStep(1); // Go back to first step from details if it's for self
        } else {
            setStep(s => s - 1);
        }
    }

    const resetState = () => {
        setStep(1);
        setExpenseItems([{ id: Date.now(), type: 'Schiedsrichter', details: '', amount: '90', date: new Date(), receipts: [] }]);
        setIsForSelf(null);
        setSelectedMember(null);
        setIsCapturing(false);
    }
    
    const handleClose = (open) => {
        if(!open) {
            handleStopCamera();
            setTimeout(resetState, 300);
        }
        onOpenChange(open);
    }

    const handleSaveExpense = () => {
        const newExpenses = expenseItems.map(item => ({
            ...item,
            submittedBy: isForSelf ? 'self' : selectedMember?.name || 'Unbekannt',
            submittedById: isForSelf ? 'self' : selectedMember?.id,
            status: 'Offen'
        }));
        onSave(newExpenses);
        setStep(4);
    }

    const Step1 = () => (
        <div className="text-center space-y-6 py-8">
            <h3 className="font-bold text-lg">Für wen ist diese Ausgabe?</h3>
            <div className="flex justify-center gap-4">
                <Button className="h-24 w-32" variant={isForSelf === true ? 'default' : 'outline'} onClick={() => setIsForSelf(true)}>Für mich selbst</Button>
                <Button className="h-24 w-32" variant={isForSelf === false ? 'default' : 'outline'} onClick={() => setIsForSelf(false)}>Für jemand<br/>anderen</Button>
            </div>
        </div>
    );
    
    const Step2 = () => (
        <div>
            <h3 className="font-bold text-lg mb-4">Mitglied auswählen</h3>
            <div className="grid grid-cols-3 gap-4">
                {members.filter(m => m.roles.includes('Trainer') || m.roles.includes('Vorstand')).map(member => (
                     <div key={member.id} className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer hover:bg-muted ${selectedMember?.id === member.id ? 'border-primary' : 'border-transparent'}`} onClick={() => setSelectedMember(member)}>
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={member.avatar} data-ai-hint="person portrait" />
                            <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold">{member.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const Step3 = () => (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Details erfassen</h3>
            {expenseItems.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1"><GripVertical className="h-5 w-5 text-muted-foreground cursor-grab"/></div>
                        <div className="col-span-3">
                            <Label className="text-xs">Typ</Label>
                            <Select defaultValue={item.type} onValueChange={(v) => handleItemChange(item.id, 'type', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Schiedsrichter">Schiedsrichter</SelectItem>
                                    <SelectItem value="Material">Material</SelectItem>
                                    <SelectItem value="Spesen">Spesen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-3">
                            <Label className="text-xs">Details</Label>
                            <Input value={item.details} onChange={(e) => handleItemChange(item.id, 'details', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Summe</Label>
                            <Input type="number" value={item.amount} onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Datum</Label>
                            <DatePicker date={item.date} onDateChange={(d) => handleItemChange(item.id, 'date', d)}/>
                        </div>
                         <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Quittungen</Label>
                         <div className="flex gap-2 mt-1">
                            <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer">
                                <Label htmlFor={`receipt-upload-${item.id}`}>
                                    <ImageIcon className="h-4 w-4" /> Hochladen
                                    <input id={`receipt-upload-${item.id}`} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, item.id)} />
                                </Label>
                            </Button>
                             <Button variant="outline" size="sm" className="gap-2" onClick={handleStartCamera}>
                                <Camera className="h-4 w-4" /> Foto
                            </Button>
                        </div>
                         {item.receipts.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2 border p-2 rounded-md">
                                {item.receipts.map((receipt, index) => (
                                    <div key={index} className="relative">
                                        <Image src={receipt} alt={`Beleg ${index + 1}`} width={60} height={60} className="rounded-md object-cover h-16 w-16"/>
                                        <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => removeReceipt(item.id, index)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
             <Button variant="outline" onClick={handleAddItem} className="w-full">Zeile hinzufügen</Button>
        </div>
    );
    
    const Step4 = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-16">
            <CheckCircle className="w-24 h-24 text-green-500" />
            <h3 className="text-2xl font-bold">Spesen eingereicht</h3>
             <p className="text-muted-foreground">Die Ausgaben wurden zur Genehmigung weitergeleitet.</p>
        </div>
    );
    
    const totalSteps = isForSelf ? 2 : 3;
    const currentStepValue = isForSelf && step === 3 ? 2 : step;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl">
                 <DialogHeader>
                    <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
                </DialogHeader>
                <div className="py-4 min-h-[400px]">
                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                    {step === 4 && <Step4 />}
                </div>
                 <DialogFooter className="flex flex-col gap-4">
                    {step < 4 && <Progress value={((currentStepValue-1) / totalSteps) * 100} className="w-full" />}
                    <div className="flex justify-between w-full">
                        {step > 1 && step < 4 && <Button variant="outline" onClick={handleBackStep}>Zurück</Button>}
                        {step === 4 && <div></div>}
                        <div className="flex-grow"></div>
                        {step < 3 && <Button onClick={handleNextStep} disabled={(step === 1 && isForSelf === null) || (step === 2 && !selectedMember)}>Weiter <ArrowRight className="ml-2 h-4 w-4"/></Button>}
                        {step === 3 && <Button onClick={handleSaveExpense} className="bg-green-600 hover:bg-green-700">Spesen einreichen</Button>}
                        {step === 4 && <Button onClick={() => handleClose(false)}>Schliessen</Button>}
                    </div>
                </DialogFooter>
                 {isCapturing && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                        <video ref={videoRef} className="w-full h-auto" autoPlay playsInline />
                        <div className="flex gap-4 mt-4">
                            <Button onClick={() => handleCapturePhoto(expenseItems[expenseItems.length - 1].id)}>Foto aufnehmen</Button>
                            <Button variant="destructive" onClick={handleStopCamera}>Abbrechen</Button>
                        </div>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
