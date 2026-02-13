
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './use-toast';

export interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
    dataAiHint?: string;
    description: string;
    category: string;
    stock: number;
}

interface CartContextType {
    items: Product[];
    addItem: (item: Product) => void;
    removeItem: (itemId: number) => void;
    clearCart: () => void;
    wishlist: Product[];
    addToWishlist: (item: Product) => void;
    removeFromWishlist: (itemId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<Product[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const { toast } = useToast();

    // Load cart and wishlist from localStorage on initial render
    useEffect(() => {
        const storedCart = localStorage.getItem('amigoal_cart');
        const storedWishlist = localStorage.getItem('amigoal_wishlist');
        if (storedCart) {
            setItems(JSON.parse(storedCart));
        }
        if (storedWishlist) {
            setWishlist(JSON.parse(storedWishlist));
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('amigoal_cart', JSON.stringify(items));
    }, [items]);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('amigoal_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);


    const addItem = (item: Product) => {
        setItems((prevItems) => [...prevItems, item]);
    };

    const removeItem = (itemId: number) => {
        setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setItems([]);
    };
    
    const addToWishlist = (item: Product) => {
        setWishlist((prev) => {
            if (prev.find(i => i.id === item.id)) {
                return prev; // Already in wishlist
            }
            return [...prev, item];
        });
    };

    const removeFromWishlist = (itemId: number) => {
        setWishlist((prev) => prev.filter(item => item.id !== itemId));
    };

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, wishlist, addToWishlist, removeFromWishlist }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
