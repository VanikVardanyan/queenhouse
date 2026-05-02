"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/lib/images";

const SWIPE_THRESHOLD = 60;
const SWIPE_VELOCITY = 400;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export function GalleryLightbox({
  photos,
  open,
  index,
  onIndexChange,
  onClose,
}: {
  photos: ImageAsset[];
  open: boolean;
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState(0);

  const go = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);

  // Preload adjacent images so swipes feel instant
  useEffect(() => {
    if (!open) return;
    const adjacent = [
      photos[(index + 1) % photos.length],
      photos[(index - 1 + photos.length) % photos.length],
    ];
    adjacent.forEach((p) => {
      if (!p) return;
      const img = new window.Image();
      img.src = p.src;
    });
  }, [open, index, photos]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;
    if (info.offset.x < -SWIPE_THRESHOLD || swipePower < -SWIPE_VELOCITY) {
      go(1);
    } else if (info.offset.x > SWIPE_THRESHOLD || swipePower > SWIPE_VELOCITY) {
      go(-1);
    }
  }

  const photo = photos[index];

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/95"
        >
          <div className="relative h-full w-full overflow-hidden">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:block"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:block"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={photo.src}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 280, damping: 30 },
                  opacity: { duration: 0.15 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 flex cursor-grab items-center justify-center px-4 py-14 active:cursor-grabbing md:px-20 md:py-16"
              >
                <div className="relative h-full w-full max-w-6xl">
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes="100vw"
                    priority
                    draggable={false}
                    className="select-none object-contain"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-xs tabular-nums text-white/70">
              {index + 1} / {photos.length}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
