
"use client";
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import Image from "next/image";
import { encode } from "qss";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "lucide-react";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
};

export const LinkPreview = ({
  children,
  url,
  className,
  width = 200,
  height = 125,
  quality = 50,
  layout = "fixed",
}: LinkPreviewProps) => {
  const [isOpen, setOpen] = React.useState(false);

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);

  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = eventOffsetX - targetRect.width / 2;
    x.set(offsetFromCenter);
  };

  const src = `https://api.microlink.io/?${encode({
    url,
    screenshot: true,
    meta: false,
    embed: "screenshot.url",
    colorScheme: "dark",
    "viewport.isMobile": true,
    "viewport.deviceScaleFactor": 1,
    "viewport.width": width * 3,
    "viewport.height": height * 3,
  })}`;

  return (
    <>
      {isMounted ? (
        <HoverCardPrimitive.Root
          open={isOpen}
          onOpenChange={(open) => {
            setOpen(open);
          }}
        >
          <HoverCardPrimitive.Trigger
            onMouseMove={handleMouseMove}
            className={cn("text-black dark:text-white", className)}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </HoverCardPrimitive.Trigger>

          <HoverCardPrimitive.Content
            className="[transform-origin:var(--radix-hover-card-content-transform-origin)]"
            side="top"
            align="center"
            sideOffset={10}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.6 }}
                  className="shadow-xl rounded-xl"
                  style={{
                    x: translateX,
                  }}
                >
                  <a
                    href={url}
                    className="block p-1 bg-white border-2 border-transparent shadow rounded-xl hover:border-neutral-200 dark:hover:border-neutral-800"
                    style={{ fontSize: 0 }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={isMounted ? src : "/placeholder.png"}
                      width={width}
                      height={height}
                      quality={quality}
                      layout={layout}
                      priority={true}
                      className="rounded-lg"
                      alt="preview image"
                    />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Root>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("text-black dark:text-white", className)}
        >
          {children}
        </a>
      )}
    </>
  );
};
