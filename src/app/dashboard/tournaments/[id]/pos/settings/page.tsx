
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, PlusCircle, Edit, Trash2, Save, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { AmigoalLogo } from '@/components/icons';

const POS_PRODUCTS_KEY = 'amigoal-pos-products';
const POS_LOGO_KEY = 'amigoal-pos-logo';

const initialProducts = [
  { id: 1, name: 'Bratwurst', price: 5.00, category: 'Essen', image: 'https://placehold.co/100x100.png?text=Wurst' },
  { id: 2, name: 'Pommes', price: 4.50, category: 'Essen', image: 'https://placehold.co/100x100.png?text=Pommes' },
  { id: 3, name: 'Schnitzelbrot', price: 7.00, category: 'Essen', image: 'https://placehold.co/100x100.png?text=Schnitzel' },
  { id: 4, name: 'Wasser', price: 3.00, category: 'Getränke', image: 'https://placehold.co/100x100.png?text=H2O' },
  { id: 5, name: 'Cola', price: 3.50, category: 'Getränke', image: 'https://placehold.co/100x100.png?text=Cola' },
  { id: 6, name: 'Bier', price: 5.00, category: 'Getränke', image: 'https://placehold.co/100x100.png?text=Bier' },
];

const ProductModal = ({ isOpen, onOpenChange, product, onSave }) => {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        setFormData(product || { name: '', price: 0, category: 'Essen', image: '' });
    }, [product]);

    if (!formData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>{formData.id ? 'Produkt bearbeiten' : 'Neues Produkt'}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preis (CHF)</Label>
                            <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(p => ({...p, price: parseFloat(e.target.value) || 0}))} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="category">Kategorie</Label>
                            <Select value={formData.category} onValueChange={(val) => setFormData(p => ({...p, category: val}))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Essen">Essen</SelectItem>
                                    <SelectItem value="Getränke">Getränke</SelectItem>
                                    <SelectItem value="Heissgetränke">Heissgetränke</SelectItem>
                                    <SelectItem value="Dessert">Dessert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Bild URL</Label>
                        <Input id="image" value={formData.image} onChange={(e) => setFormData(p => ({...p, image: e.target.value}))} placeholder="https://beispiel.com/bild.png"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function TournamentPosSettingsPage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    const { toast } = useToast();
    
    const [products, setProducts] = useState([]);
    const [logoUrl, setLogoUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        try {
            const storedProducts = localStorage.getItem(`${POS_PRODUCTS_KEY}-${tournamentId}`);
            const storedLogo = localStorage.getItem(`${POS_LOGO_KEY}-${tournamentId}`);
            
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(initialProducts); // Set initial if none found
            }
            if (storedLogo) {
                setLogoUrl(storedLogo);
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
            setProducts(initialProducts);
        }
    }, [tournamentId]);

    const handleSave = () => {
        try {
            localStorage.setItem(`${POS_PRODUCTS_KEY}-${tournamentId}`, JSON.stringify(products));
            localStorage.setItem(`${POS_LOGO_KEY}-${tournamentId}`, logoUrl);
            toast({ title: "Gespeichert!", description: "Ihre Kassen-Einstellungen wurden aktualisiert." });
        } catch (error) {
            console.error("Error writing to localStorage", error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = (productData) => {
        if (productData.id) {
            setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
        } else {
            setProducts(prev => [...prev, { ...productData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteProduct = (productId) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    return (
        <>
            <div className="space-y-6">
                <Button asChild variant="ghost">
                    <Link href={`/${lang}/dashboard/tournaments/${tournamentId}/pos`}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Zurück zum Kassensystem
                    </Link>
                </Button>
                 <Card>
                    <CardHeader>
                        <CardTitle>Allgemeine Einstellungen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo-URL für Kunden-Display</Label>
                            <Input id="logoUrl" placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">Vorschau:</p>
                             {logoUrl ? <Image src={logoUrl} alt="Logo Vorschau" width={100} height={40} className="object-contain border rounded-md p-1" /> : <AmigoalLogo className="h-10 w-10"/>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Produktverwaltung</CardTitle>
                                <CardDescription>Verwalten Sie die Artikel für Ihr Kassensystem.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => handleOpenModal()}>
                                <PlusCircle className="mr-2 h-4 w-4"/>Produkt hinzufügen
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produkt</TableHead>
                                    <TableHead>Kategorie</TableHead>
                                    <TableHead>Preis</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Image src={product.image || 'https://placehold.co/40x40.png?text=?'} alt={product.name} width={40} height={40} className="rounded-md object-cover"/>
                                            {product.name}
                                        </TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>CHF {product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <div className="flex justify-end">
                    <Button size="lg" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Alle Einstellungen speichern</Button>
                </div>
            </div>
             <ProductModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                product={editingProduct}
                onSave={handleSaveProduct}
            />
        </>
    );
}
