"use client";

import { useState } from "react";
import { parseYouTube } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  /** Show a play button over the thumbnail. Defaults to true. */
  playButton?: boolean;
};

/**
 * Shows a YouTube thumbnail as a still image, and only loads the actual player
 * when the visitor clicks. Keeps pages light and storage use at zero.
 */
export function MediaThumb({ url, alt, className, imageClassName, playButton = true }: Props) {
  const [playing, setPlaying] = useState(false);
  const video = parseYouTube(url);

  if (!video) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    );
  }

  if (playing) {
    return (
      <iframe
        src={`${video.embed}&autoplay=1`}
        title={alt}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={cn("h-full w-full", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${alt}`}
      className={cn("group/media relative block h-full w-full cursor-pointer", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={video.thumb}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover transition-transform duration-700 group-hover/media:scale-105", imageClassName)}
      />
      {playButton ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm transition-all duration-300 group-hover/media:scale-110 group-hover/media:bg-vermilion">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      ) : null}
    </button>
  );
}
