"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { galleryImages } from "@/lib/images";

export function Gallery() {
  const t = useTranslations("gallery");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  return (
    <section
      id="gallery"
      className="border-b border-border bg-muted/30 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">
            {t("title")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {galleryImages.map((img, i) => (
            <button
              key={img.slug}
              type="button"
              onClick={() => {
                setIdx(i);
                setOpen(true);
              }}
              className={`group relative overflow-hidden rounded-lg ${
                i % 5 === 0 ? "aspect-[4/5] md:row-span-2" : "aspect-square"
              }`}
              aria-label={t("openImage")}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                placeholder="blur"
                blurDataURL={img.blurDataURL}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
      <GalleryLightbox
        photos={galleryImages}
        open={open}
        index={idx}
        onIndexChange={setIdx}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}
