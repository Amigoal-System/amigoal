
      
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LayoutGrid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useCart, type Product } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import Link from 'next/link';

const mockProducts: Product[] = [
    { id: 1, name: 'Heimtrikot 24/25', price: 'CHF 89.90', image: 'https://placehold.co/600x400.png', dataAiHint: "soccer jersey", description: 'Offizielles Heimtrikot der Saison 24/25.', category: 'Trikots', stock: 50 },
    { id: 2, name: 'Auswärtstrikot 24/25', price: 'CHF 89.90', image: 'https://placehold.co/600x400.png', dataAiHint: "soccer jersey away", description: 'Offizielles Auswärtstrikot der Saison 24/25.', category: 'Trikots', stock: 45 },
    { id: 3, name: 'Trainings-Shirt', price: 'CHF 45.00', image: 'https://placehold.co/600x400.png', dataAiHint: "training shirt", description: 'Atmungsaktives Shirt für das Training.', category: 'Trainingsbekleidung', stock: 120 },
    { id: 4, name: 'Trainings-Hose', price: 'CHF 39.90', image: 'https://placehold.co/600x400.png', dataAiHint: "training shorts", description: 'Bequeme Hose für das Training.', category: 'Trainingsbekleidung', stock: 110 },
    { id: 5, name: 'Fanschal', price: 'CHF 25.00', image: 'https://placehold.co/600x400.png', dataAiHint: "soccer scarf", description: 'Klassischer Fanschal in Vereinsfarben.', category: 'Fanartikel', stock: 200 },
    { id: 6, name: 'Cap', price: 'CHF 29.90', image: 'https://placehold.co/600x400.png', dataAiHint: "baseball cap", description: 'Stylische Cap mit Vereinslogo.', category: 'Fanartikel', stock: 80 },
];

const ProductCard = ({ product }: { product: Product }) => {
    return (
        <Card className="overflow-hidden flex flex-col">
            <CardHeader className="p-0">
                <Image src={product.image} alt={product.name} width={600} height={400} className="object-cover" data-ai-hint={product.dataAiHint} />
            </CardHeader>
            <CardContent className="p-4 flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <p className="font-bold mt-2">{product.price}</p>
            </CardContent>
            <CardFooter className="p-2 border-t flex flex-col gap-2">
                <AddToCartButton product={product} />
                <WishlistButton product={product} />
            </CardFooter>
        </Card>
    );
}

export default function ShopPage() {
    const [view, setView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const { items } = useCart();
    
    const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

    const filteredProducts = useMemo(() => {
        return mockProducts.filter(p => {
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, categoryFilter]);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Vereinsshop</h1>
                    <p className="text-muted-foreground">Stöbern Sie durch unsere offiziellen Vereinsartikel.</p>
                </div>
                 <Button asChild>
                    <Link href="/de/dashboard/checkout">
                        <ShoppingCart className="mr-2 h-4 w-4"/> Warenkorb ({items.length})
                    </Link>
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Produkte</CardTitle>
                         <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input 
                                    placeholder="Produkte suchen..." 
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'Alle Kategorien' : c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-muted' : ''}><LayoutGrid className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => setView('list')} className={view === 'list' ? 'bg-muted' : ''}><List className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(product => <ProductCard key={product.id} product={product}/>)}
                        </div>
                    ) : (
                        <p>Listenansicht kommt bald...</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
      
    
