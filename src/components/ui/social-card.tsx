
// components/ui/social-card.tsx
"use client";

import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Link as LinkIcon,
  Star,
} from "lucide-react";
import { useState } from "react";

interface SocialCardProps {
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
    timeAgo?: string;
  };
  content?: {
    text?: string;
    media?: React.ReactNode; // Changed from link to media to support video
  };
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  className?: string;
  showRating?: boolean; // New prop to control rating visibility
}

const StarRating = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        key={starValue}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(rating)}
                    >
                        <Star className={cn(
                            "w-5 h-5 transition-all",
                            starValue <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-400"
                        )}/>
                    </button>
                )
            })}
        </div>
    )
}

export function SocialCard({
  author,
  content,
  engagement,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMore,
  className,
  showRating = false,
}: SocialCardProps) {
  const [isLiked, setIsLiked] = useState(engagement?.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(engagement?.isBookmarked ?? false);
  const [likes, setLikes] = useState(engagement?.likes ?? 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-2xl shadow-sm",
        "flex flex-col", // Added for flex layout
        className
      )}
    >
      <div className="p-4">
        {/* Author section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={author?.avatar}
              alt={author?.name ?? 'author'}
              className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-zinc-800"
            />
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {author?.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                @{author?.username} · {author?.timeAgo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onMore}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content section */}
        {content?.text && (
            <p className="text-zinc-600 dark:text-zinc-300 mb-3 text-sm">
                {content.text}
            </p>
        )}
      </div>

      {/* Media (Video) section */}
      {content?.media && (
        <div className="w-full aspect-video bg-muted overflow-hidden">
          {content.media}
        </div>
      )}

      {/* Engagement section */}
      <div className="flex items-center justify-between p-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              isLiked
                ? "text-rose-600"
                : "text-zinc-500 dark:text-zinc-400 hover:text-rose-600"
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-all",
                isLiked && "fill-current scale-110"
              )}
            />
            <span className="font-medium">{likes}</span>
          </button>
          <button
            type="button"
            onClick={onComment}
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{engagement?.comments}</span>
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">{engagement?.shares}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
            {showRating && <StarRating />}
            <button
            type="button"
            onClick={handleBookmark}
            className={cn(
                "p-2 rounded-full transition-all",
                isBookmarked
                ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            >
            <Bookmark className={cn(
                "w-5 h-5 transition-transform",
                isBookmarked && "fill-current scale-110"
            )} />
            </button>
        </div>
      </div>
    </div>
  );
}
