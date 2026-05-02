import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";
import heicConvert from "heic-convert";

const SRC = "media";
const OUT = "public/images/optimized";
const WIDTHS = [400, 1200, 2400] as const;

type ManifestEntry = {
  slug: string;
  width: number;
  height: number;
  blurDataURL: string;
};

async function toJpegBuffer(srcPath: string): Promise<Buffer> {
  const ext = parse(srcPath).ext.toLowerCase();
  const raw = await readFile(srcPath);
  if (ext === ".heic") {
    const out = await heicConvert({
      buffer: raw as unknown as ArrayBufferLike,
      format: "JPEG",
      quality: 0.92,
    });
    return Buffer.from(out);
  }
  return raw;
}

async function processFile(filename: string): Promise<ManifestEntry | null> {
  const ext = parse(filename).ext.toLowerCase();
  if (![".heic", ".jpg", ".jpeg"].includes(ext)) {
    if (ext === ".dng") {
      console.warn(`[skip] ${filename}: DNG must be exported manually to JPEG.`);
    }
    return null;
  }

  const slug = parse(filename).name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const srcPath = join(SRC, filename);
  const buffer = await toJpegBuffer(srcPath);
  const baseImage = sharp(buffer).rotate();
  const metadata = await baseImage.metadata();
  const origWidth = metadata.width ?? 2400;
  const origHeight = metadata.height ?? 1600;

  for (const w of WIDTHS) {
    if (origWidth < w && w !== WIDTHS[0]) continue;
    const target = sharp(buffer)
      .rotate()
      .resize({ width: w, withoutEnlargement: true });
    await target.clone().avif({ quality: 60 }).toFile(join(OUT, `${slug}-${w}.avif`));
    await target.clone().webp({ quality: 75 }).toFile(join(OUT, `${slug}-${w}.webp`));
  }

  const blurBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 16 })
    .jpeg({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

  console.log(`[ok] ${filename} → ${slug}`);
  return { slug, width: origWidth, height: origHeight, blurDataURL };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = await readdir(SRC);
  const entries: ManifestEntry[] = [];
  for (const f of files) {
    if (f.startsWith(".")) continue;
    try {
      const entry = await processFile(f);
      if (entry) entries.push(entry);
    } catch (err) {
      console.error(`[fail] ${f}:`, err);
    }
  }
  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  await writeFile(
    "lib/images-manifest.json",
    JSON.stringify(entries, null, 2),
    "utf8",
  );
  console.log(`\nDone: ${entries.length} images. Manifest at lib/images-manifest.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
