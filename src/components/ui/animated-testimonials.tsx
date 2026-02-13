
"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const AnimatedTestimonials = ({
  testimonials,
  className,
}: {
  testimonials: {
    quote: string;
    name: string;
    designation: string;
    src: string;
  }[];
  className?: string;
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const slideVariants = {
    hidden: {
      opacity: 0,
      x: "100%",
      transition: { duration: 0.5 },
    },
    visible: {
      opacity: 1,
      x: "0%",
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      x: "-100%",
      transition: { duration: 0.5 },
    },
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-2xl mx-auto h-60 overflow-hidden",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute h-full w-full flex flex-col justify-center items-center"
        >
          <div className="text-center space-y-4">
            <p className="text-lg md:text-xl font-medium text-foreground px-8">
              &ldquo;{testimonials[current].quote}&rdquo;
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Image
                src={testimonials[current].src}
                alt={testimonials[current].name}
                width={40}
                height={40}
                className="rounded-full"
                data-ai-hint="person portrait"
              />
              <div>
                <p className="font-semibold text-foreground">
                  {testimonials[current].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current].designation}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
