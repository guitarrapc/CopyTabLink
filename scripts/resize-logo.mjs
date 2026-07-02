import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const inputPath = resolve("assets/logo.png");
const outputPath = resolve("assets/logo-128x128.png");

await mkdir(dirname(outputPath), { recursive: true });

await sharp(inputPath)
  .resize(128, 128, { fit: "cover" })
  .png()
  .toFile(outputPath);

console.log(`Resized image written to: ${outputPath}`);
