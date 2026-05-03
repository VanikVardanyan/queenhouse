import manifest from "./images-manifest.json";

export type ImageAsset = {
  slug: string;
  width: number;
  height: number;
  blurDataURL: string;
  src: string;
  srcSet: { avif: string; webp: string };
};

const WIDTHS = [400, 1200, 2400];
const LOGO_SLUG = "image-14-02-25-01-51";

function buildAsset(entry: (typeof manifest)[number]): ImageAsset {
  const base = `/images/optimized/${entry.slug}`;
  // The convert script only generates a width if the source is at least that big
  // (400 is always generated). Pick available widths so URLs never 404.
  const availableWidths = WIDTHS.filter((w) => w === 400 || entry.width >= w);
  const srcWidth = availableWidths.includes(1200) ? 1200 : 400;
  return {
    slug: entry.slug,
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blurDataURL,
    src: `${base}-${srcWidth}.webp`,
    srcSet: {
      avif: availableWidths.map((w) => `${base}-${w}.avif ${w}w`).join(", "),
      webp: availableWidths.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
    },
  };
}

const all: ImageAsset[] = manifest.map(buildAsset);

export const images: ImageAsset[] = all.filter((i) => i.slug !== LOGO_SLUG);

export function getImage(slug: string): ImageAsset {
  const found = all.find((i) => i.slug === slug);
  if (!found) {
    throw new Error(`Image not found: ${slug}`);
  }
  return found;
}

const fallback = images[0]!;

export const heroImage: ImageAsset = images[0] ?? fallback;
export const aboutImage: ImageAsset = getImage("img-5209");

// Curated order for the Houses carousel.
// IMG_4858.DNG is in /media but not yet converted (export manually, then re-run pnpm convert-media).
export const housesPhotos: ImageAsset[] = [
  "img-5209",
  "img-6729",
  "img-6755",
  "img-5389",
  "img-5384",
  "img-5380",
  "img-6769",
  "img-5379",
  "img-5357",
  "img-5069",
  "img-9415",
  "img-5057",
  "img-4861",
  "img-5020",
].map(getImage);

export const galleryImages: ImageAsset[] = images;
