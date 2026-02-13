
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Monitor, Soup, Printer, X, Plus, Minus, DollarSign, ExternalLink, Lock, PieChart, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

const POS_PRODUCTS_KEY = 'amigoal-pos-products';

const initialProducts = [
  { id: 1, name: 'Bratwurst', price: 5.00, category: 'Essen', image: 'https://placehold.co/100x100.png?text=Wurst' },
  { id: 2, name: 'Pommes', price: 4.50, category: 'Essen', image: 'https://placehold.co/100x100.png?text=Pommes' },
  { id: 3, name: 'Schnitzelbrot', price: 7.00, category: 'Essen', image: 'https://placehold.co/100x100.png?text=Schnitzel' },
  { id: 4, name: 'Wasser', price: 3.00, category: 'Getränke', image: 'https://placehold.co/100x100.png?text=H2O' },
  { id: 5, name: 'Cola', price: 3.50, category: 'Getränke', image: 'https://placehold.co/100x100.png?text=Cola' },
  { id: 6, name: 'Bier', price: 5.00, category: 'Getränke', image: 'https://placehold.co/100x100.png?text=Bier' },
];

const SalesReportModal = ({ isOpen, onOpenChange, salesData, tournamentId, lang }) => {
    const totalRevenue = salesData.reduce((sum, item) => sum + item.total, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Verkaufsbericht (Aktuelle Sitzung)</DialogTitle>
                    <DialogDescription>Übersicht der verkauften Artikel.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Artikel</TableHead>
                                <TableHead className="text-center">Menge</TableHead>
                                <TableHead className="text-right">Umsatz</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesData.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">CHF {item.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <DialogFooter className="flex-col gap-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Gesamtumsatz:</span>
                        <span>CHF {totalRevenue.toFixed(2)}</span>
                    </div>
                    <Button asChild variant="outline"><Link href={`/${lang}/dashboard/tournaments/${tournamentId}/finances`}>Zum detaillierten Finanzbericht</Link></Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const LockScreen = ({ onUnlock }) => {
    const [pin, setPin] = useState('');
    const correctPin = '1234'; // In a real app, this would be configurable

    const handlePinInput = (digit) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleUnlock = () => {
        if (pin === correctPin) {
            onUnlock();
        } else {
            alert('Falscher PIN');
            setPin('');
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
            <Card className="w-80">
                <CardHeader>
                    <CardTitle className="text-center">Kasse gesperrt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-12 w-full bg-muted rounded-md flex items-center justify-center text-2xl tracking-[1rem]">
                        {'*'.repeat(pin.length)}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {'123456789'.split('').map(digit => (
                            <Button key={digit} className="h-16 text-xl" variant="outline" onClick={() => handlePinInput(digit)}>{digit}</Button>
                        ))}
                        <Button className="h-16 text-xl" variant="outline" onClick={handleDelete}>C</Button>
                        <Button className="h-16 text-xl" variant="outline" onClick={() => handlePinInput('0')}>0</Button>
                        <Button className="h-16 text-xl" onClick={handleUnlock}>OK</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


export default function PointOfSalePage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    const { toast } = useToast();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['Alle']);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Alle');
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [orderNumber, setOrderNumber] = useState(101);
    const [salesData, setSalesData] = useState([]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(true);


    const broadcastOrder = useCallback((order) => {
        try {
             localStorage.setItem(`amigoal-pos-customer-display-${tournamentId}`, JSON.stringify(order));
        } catch (error) {
            console.error("Could not write to localStorage", error);
        }
    }, [tournamentId]);
    
     useEffect(() => {
        try {
            const storedProducts = localStorage.getItem(`${POS_PRODUCTS_KEY}-${tournamentId}`);
            if (storedProducts) {
                const parsedProducts = JSON.parse(storedProducts);
                setProducts(parsedProducts);
                const uniqueCategories = ['Alle', ...new Set(parsedProducts.map(p => p.category))];
                setCategories(uniqueCategories);
            } else {
                setProducts(initialProducts);
                const uniqueCategories = ['Alle', ...new Set(initialProducts.map(p => p.category))];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Error reading products from localStorage", error);
            setProducts(initialProducts);
        }
    }, [tournamentId]);


    useEffect(() => {
        const lastOrderNumber = localStorage.getItem(`amigoal-pos-last-order-${tournamentId}`);
        if(lastOrderNumber) {
            setOrderNumber(parseInt(lastOrderNumber, 10) + 1);
        }
        
        const storedSales = localStorage.getItem(`amigoal-pos-sales-${tournamentId}`);
        if(storedSales) {
            setSalesData(JSON.parse(storedSales));
        }

        broadcastOrder({ items: [], total: 0 }); // Clear display on load
    }, [broadcastOrder, tournamentId]);


    const addToOrder = (product) => {
        const existingItem = currentOrder.find(item => item.name === product.name);
        let newOrder;
        if (existingItem) {
            newOrder = currentOrder.map(item =>
                item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            newOrder = [...currentOrder, { ...product, quantity: 1 }];
        }
        setCurrentOrder(newOrder);
        broadcastOrder({items: newOrder, total: calculateTotal(newOrder) });
    };

    const updateQuantity = (productName, change) => {
        const newOrder = currentOrder.map(item => {
            if (item.name === productName) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean); // Remove items with quantity 0
        setCurrentOrder(newOrder);
        broadcastOrder({items: newOrder, total: calculateTotal(newOrder) });
    };

    const calculateTotal = (order) => order.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = calculateTotal(currentOrder);

    const completeOrder = (method) => {
        if (currentOrder.length === 0) return;
        setPaymentMethod(method);

        const newOrderForKitchen = {
            id: orderNumber,
            items: currentOrder,
            timestamp: new Date().toISOString(),
            status: 'new'
        };

        try {
            // Update Sales Data
            const updatedSales = [...salesData];
            currentOrder.forEach(orderItem => {
                const existingSale = updatedSales.find(sale => sale.name === orderItem.name);
                if (existingSale) {
                    existingSale.quantity += orderItem.quantity;
                    existingSale.total += orderItem.price * orderItem.quantity;
                } else {
                    updatedSales.push({
                        name: orderItem.name,
                        quantity: orderItem.quantity,
                        total: orderItem.price * orderItem.quantity
                    });
                }
            });
            setSalesData(updatedSales);
            localStorage.setItem(`amigoal-pos-sales-${tournamentId}`, JSON.stringify(updatedSales));

            // Update Kitchen Display
            const kitchenOrders = JSON.parse(localStorage.getItem(`amigoal-pos-kitchen-display-${tournamentId}`) || '[]');
            kitchenOrders.push(newOrderForKitchen);
            localStorage.setItem(`amigoal-pos-kitchen-display-${tournamentId}`, JSON.stringify(kitchenOrders));
        } catch (error) {
            console.error("Could not write to localStorage", error);
        }

        toast({
            title: `Bestellung #${orderNumber} abgeschlossen`,
            description: `Zahlungsmethode: ${method}. Total: CHF ${total.toFixed(2)}`,
        });

        localStorage.setItem(`amigoal-pos-last-order-${tournamentId}`, orderNumber.toString());
        setOrderNumber(n => n + 1);
        setCurrentOrder([]);
        broadcastOrder({ items: [], total: 0 });
    };

    const filteredProducts = products.filter(p => activeCategory === 'Alle' || p.category === activeCategory);

    return (
        <div className="h-screen bg-muted flex flex-col p-4 gap-4 relative">
             {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center bg-card p-2 rounded-lg shadow-sm">
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/${lang}/dashboard/tournaments/${tournamentId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Zum Cockpit
                    </Link>
                </Button>
                <h1 className="text-xl font-bold font-headline">Kassensystem</h1>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm"><Link href={`/${lang}/dashboard/tournaments/${tournamentId}/pos/settings`}><Settings className="mr-2 h-4 w-4"/>Einstellungen</Link></Button>
                    <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(true)}><PieChart className="mr-2 h-4 w-4"/>Bericht</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsLocked(true)}><Lock className="mr-2 h-4 w-4"/>Sperren</Button>
                    <Button asChild variant="outline" size="sm"><Link href={`/${lang}/dashboard/tournaments/${tournamentId}/pos/customer-display`} target="_blank"><Monitor className="mr-2 h-4 w-4"/>Kunden-Display</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href={`/${lang}/dashboard/tournaments/${tournamentId}/pos/kitchen-display`} target="_blank"><Soup className="mr-2 h-4 w-4"/>Küchen-Display</Link></Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow grid grid-cols-3 gap-4 min-h-0">
                {/* Product Grid */}
                <div className="col-span-2 flex flex-col gap-4">
                    <Card className="flex-shrink-0">
                        <CardContent className="p-2">
                             <div className="flex gap-2">
                                {categories.map(cat => (
                                    <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} onClick={() => setActiveCategory(cat)}>
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="flex-grow">
                        <CardContent className="p-4 h-full">
                             <ScrollArea className="h-full pr-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredProducts.map(product => (
                                        <Button key={product.id} className="h-28 text-base flex-col gap-1" variant="outline" onClick={() => addToOrder(product)}>
                                            <Image src={product.image || 'https://placehold.co/100x100.png?text=?'} alt={product.name} width={60} height={60} className="rounded-md object-cover"/>
                                            <span>{product.name}</span>
                                            <span className="text-xs text-muted-foreground">CHF {product.price.toFixed(2)}</span>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <Card className="col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Bestellung #{orderNumber}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                         <ScrollArea className="flex-grow pr-4 -mr-4">
                            {currentOrder.length > 0 ? (
                                <div className="space-y-2">
                                    {currentOrder.map(item => (
                                        <div key={item.name} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">CHF {item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.name, -1)}><Minus className="h-3 w-3"/></Button>
                                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.name, 1)}><Plus className="h-3 w-3"/></Button>
                                            </div>
                                            <p className="font-semibold w-20 text-right">CHF {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-muted-foreground">Keine Artikel ausgewählt.</p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 border-t pt-4">
                        <div className="flex justify-between items-baseline w-full text-2xl font-bold">
                            <span>Total</span>
                            <span>CHF {total.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full pt-2">
                            <Button size="lg" className="h-16 text-lg" onClick={() => completeOrder('Bar')}>Bar</Button>
                            <Button size="lg" className="h-16 text-lg" onClick={() => completeOrder('Karte/TWINT')}>Karte/TWINT</Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <SalesReportModal isOpen={isReportModalOpen} onOpenChange={setIsReportModalOpen} salesData={salesData} tournamentId={tournamentId} lang={lang} />
        </div>
    );
}
