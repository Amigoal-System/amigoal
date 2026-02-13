
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icon } from '@iconify/react';
import { Bot, Code, Database, Globe, Layers, Wind } from 'lucide-react';

const iconConfigs = [
  { icon: <Code className="h-full w-full" />, color: "#61DAFB" },
  { icon: <Globe className="h-full w-full" />, color: "#FF9900" },
  { icon: <Layers className="h-full w-full" />, color: "#2496ED" },
  { icon: <Database className="h-full w-full" />, color: "#339933" },
  { icon: <Bot className="h-full w-full" />, color: "#000000" },
  { icon: <Wind className="h-full w-full" />, color: "#000000" },
];

export default function FeatureSection() {
  const orbitCount = 3;
  const orbitGap = 8; // rem between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount);

  return (
    <section className="relative max-w-6xl mx-auto my-32 pl-10 flex items-center justify-between h-[30rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-black overflow-hidden rounded-3xl">
      {/* Left side: Heading and Text */}
      <div className="w-1/2 z-10">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          Build your idea
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-lg">
          RUIXEN is a modern and responsive UI kit for React, Next.js, and Tailwind CSS.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="default">
            <Link href="https://ruixen.com" target="_blank"> Get Started</Link>
          </Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      {/* Right side: Orbit animation cropped to 1/4 */}
      <div className="relative w-1/2 h-full flex items-center justify-start overflow-hidden">
        <div className="relative w-[50rem] h-[50rem] translate-x-[50%] flex items-center justify-center">
          {/* Center Circle */}
          <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 shadow-lg flex items-center justify-center p-4">
            <Layers className="h-full w-full" />
          </div>

          {/* Generate Orbits */}
          {[...Array(orbitCount)].map((_, orbitIdx) => {
            const size = `${12 + orbitGap * (orbitIdx + 1)}rem`; // equal spacing
            const angleStep = (2 * Math.PI) / iconsPerOrbit;

            return (
              <div
                key={orbitIdx}
                className="absolute rounded-full border-2 border-dotted border-gray-300 dark:border-gray-600"
                style={{
                  animation: `spin ${12 + orbitIdx * 6}s linear infinite`,
                }}
              >
                {iconConfigs
                  .slice(orbitIdx * iconsPerOrbit, orbitIdx * iconsPerOrbit + iconsPerOrbit)
                  .map((cfg, iconIdx) => {
                    const angle = iconIdx * angleStep;
                    const x = 50 + 50 * Math.cos(angle);
                    const y = 50 + 50 * Math.sin(angle);

                    return (
                      <div
                        key={iconIdx}
                        className="absolute bg-white dark:bg-gray-800 rounded-full p-2 shadow-md"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                         <span className="h-8 w-8" style={{ color: cfg.color }}>{cfg.icon}</span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
