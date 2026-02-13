
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  const handleNext = () => {
    setCards((prevCards) => {
      const newArray = [...prevCards];
      const firstCard = newArray.shift();
      if (firstCard) {
        newArray.push(firstCard);
      }
      return newArray;
    });
  };

  const handlePrev = () => {
    setCards((prevCards) => {
      const newArray = [...prevCards];
      const lastCard = newArray.pop();
      if (lastCard) {
        newArray.unshift(lastCard);
      }
      return newArray;
    });
  };


  return (
    <div className="relative w-full flex flex-col items-center justify-center">
        <div className="relative min-h-80 w-full">
        {cards.map((card, index) => {
            return (
            <motion.div
                key={card.id}
                className="absolute dark:bg-black bg-white w-full rounded-3xl p-4 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-start"
                style={{
                  transformOrigin: "top center",
                }}
                animate={{
                  top: index * -CARD_OFFSET,
                  scale: 1 - index * SCALE_FACTOR,
                  zIndex: cards.length - index,
                }}
            >
                <div className="font-semibold text-2xl font-headline mb-4">
                  {card.name}
                </div>
                <div className="font-normal text-neutral-700 dark:text-neutral-200 h-full">
                  {card.content}
                </div>
            </motion.div>
            );
        })}
        </div>
         <div className="flex gap-4 mt-8">
            <Button onClick={handlePrev} variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button onClick={handleNext} variant="outline" size="icon">
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
};
