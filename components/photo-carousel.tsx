"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ImageAsset } from "@/lib/images";

export function PhotoCarousel({
  photos,
  alt,
}: {
  photos: ImageAsset[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) return null;
  const photo = photos[idx]!;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
      <Image
        key={photo.src}
        src={photo.src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className="object-cover transition-opacity duration-300"
      />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIdx((idx + 1) % photos.length)}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
