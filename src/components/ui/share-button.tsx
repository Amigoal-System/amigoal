
"use client"

import React, { useState } from "react"
import { Facebook, Link as LinkIcon, Linkedin, Twitter, LucideIcon, Share } from "lucide-react"
import { clsx, ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useToast } from "@/hooks/use-toast"

// local cn utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ShareLink {
  icon: LucideIcon
  href?: string
  onClick?: () => void
  label?: string
}

interface ShareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  links: ShareLink[]
  children: React.ReactNode
}

const ShareButtonInternal = ({
  className,
  links,
  children,
  ...props
}: ShareButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative inline-flex justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Button */}
      <button
        className={cn(
          "relative w-40 h-10 rounded-3xl px-4 py-2 flex items-center justify-center",
          "bg-white dark:bg-black",
          "hover:bg-gray-50 dark:hover:bg-gray-950",
          "text-black dark:text-white",
          "border border-black/10 dark:border-white/10",
          "transition-all duration-300",
          isHovered ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">{children}</span>
      </button>

      {/* Hover Links */}
      <div className="absolute inset-0 flex h-10 w-40 justify-center">
        {links.map((link, index) => {
          const Icon = link.icon
          return (
            <button
              type="button"
              key={index}
              onClick={link.onClick}
              className={cn(
                "h-10 w-10 flex items-center justify-center",
                "bg-black dark:bg-white",
                "text-white dark:text-black",
                "transition-all duration-300",
                index === 0 && "rounded-l-3xl",
                index === links.length - 1 && "rounded-r-3xl",
                "border-r border-white/10 last:border-r-0 dark:border-black/10",
                "hover:bg-gray-900 dark:hover:bg-gray-100",
                isHovered
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0",
                index === 0 && "transition-all duration-200",
                index === 1 && "delay-50 transition-all duration-200",
                index === 2 && "delay-100 transition-all duration-200",
                index === 3 && "delay-150 transition-all duration-200"
              )}
            >
              <Icon className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}


export default function ShareButton(): JSX.Element {
  const { toast } = useToast();
  const shareUrl = "https://amigoal.app";
  const shareText = "Entdecke Amigoal, die All-in-One-Plattform für deinen Fussballverein!";

  const shareLinks = [
    {
      icon: Twitter,
      onClick: () => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(shareText)}`, "_blank"),
      label: "Auf Twitter teilen",
    },
    {
      icon: Facebook,
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank"),
      label: "Auf Facebook teilen",
    },
    {
      icon: Linkedin,
      onClick: () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(shareText)}`, "_blank"),
      label: "Auf LinkedIn teilen",
    },
    {
      icon: LinkIcon,
      onClick: () => {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link kopiert!",
          description: "Der Link zur Amigoal-Webseite wurde in die Zwischenablage kopiert.",
        });
      },
      label: "Link kopieren",
    },
  ]

  return (
    <ShareButtonInternal links={shareLinks} className="text-lg font-medium">
      <Share size={15} />
      Teilen
    </ShareButtonInternal>
  )
}
