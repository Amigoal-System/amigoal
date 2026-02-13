'use client'
import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, PanInfo } from 'framer-motion';
import { ReviewStars } from '@/components/blocks/animated-cards-stack';

interface Player {
  id: string;
  name: string;
  profession: string;
  avatarUrl: string;
  rating: number;
}

interface Card extends Player {
  zIndex: number;
}

interface ImgStackProps {
  players: Player[];
  onCardClick: (player: Player) => void;
}

export default function ImgStack({ players, onCardClick }: ImgStackProps) {
    const [cards, setCards] = useState<Card[]>(
        players.map((player, index) => ({
            ...player,
            zIndex: 50 - (index * 10)
        }))
    );
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const minDragDistance: number = 50;

    const getCardStyles = (index: number) => {
        const baseRotation = 2; 
        const rotationIncrement = 3;
        const offsetIncrement = -12;
        const verticalOffset = -8;

        return {
            x: index * offsetIncrement,
            y: index * verticalOffset,
            rotate: index === 0 ? 0 : -(baseRotation + (index * rotationIncrement)),
            scale: 1,
            transition: { duration: 0.5 }
        };
    };

    const handleDragStart = (_: any, info: PanInfo) => {
        dragStartPos.current = { x: info.point.x, y: info.point.y };
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        const dragDistance = Math.sqrt(
            Math.pow(info.point.x - dragStartPos.current.x, 2) +
            Math.pow(info.point.y - dragStartPos.current.y, 2)
        );

        if (isAnimating) return;

        if (dragDistance < minDragDistance) {
            onCardClick(cards[0]);
            return;
        }

        setIsAnimating(true);

        setCards(prevCards => {
            const newCards = [...prevCards];
            const cardToMove = newCards.shift()!;
            newCards.push(cardToMove);

            return newCards.map((card, index) => ({
                ...card,
                zIndex: 50 - (index * 10)
            }));
        });

        setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className="relative flex items-center justify-center w-96 h-96 my-12">
            {cards.map((card: Card, index: number) => {
                const isTopCard = index === 0;
                const cardStyles = getCardStyles(index);
                const canDrag = isTopCard && !isAnimating;

                return (
                    <motion.div
                        key={card.id}
                        className="absolute w-64 origin-bottom-center overflow-hidden rounded-xl shadow-xl bg-white cursor-grab active:cursor-grabbing border border-gray-100"
                        style={{
                            zIndex: card.zIndex,
                            aspectRatio: '5/7'
                        }}
                        animate={cardStyles}
                        drag={canDrag}
                        dragElastic={0.2}
                        dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
                        dragSnapToOrigin={true}
                        dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        whileHover={isTopCard ? {
                            scale: 1.05,
                            transition: { duration: 0.2 }
                        } : {}}
                        whileDrag={{
                            scale: 1.1,
                            rotate: 0,
                            zIndex: 100,
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            transition: { duration: 0.1 }
                        }}
                    >
                        <Image
                            src={card.avatarUrl}
                            alt={`Card ${card.id}`}
                            fill
                            className="object-cover rounded-lg pointer-events-none"
                            sizes="(max-width: 768px) 100vw, 200px"
                            draggable={false}
                        />
                         {isTopCard && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                    <h3 className="font-bold text-xl">{card.name}</h3>
                                    <p className="text-sm opacity-80">{card.profession}</p>
                                    <div className="mt-2">
                                        <ReviewStars rating={card.rating} className="text-yellow-400" />
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}