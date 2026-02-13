
'use client';
import { useState } from "react";
import { Button } from "./button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

export const WishlistButton = ({ product }) => {
    const { wishlist, addToWishlist, removeFromWishlist } = useCart();
    const isWishlisted = wishlist.some(item => item.id === product.id);
    const { toast } = useToast();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (isWishlisted) {
            removeFromWishlist(product.id);
            toast({
                title: "Von Wunschliste entfernt!",
            });
        } else {
            addToWishlist(product);
            toast({
                title: "Zur Wunschliste hinzugefügt!",
            });
        }
    };

    return (
        <Button 
            variant={isWishlisted ? "default" : "outline"} 
            className={cn("w-full", isWishlisted && 'bg-green-500 hover:bg-green-600')}
            onClick={handleClick}
        >
            <Heart className={cn("mr-2 h-4 w-4", isWishlisted && 'fill-current')}/> 
            Wunschliste
        </Button>
    )
}
