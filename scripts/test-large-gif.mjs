import fs from "fs";
import { encodeImageDataToGif, encodeImageDataToBmp } from "../lib/image-encoders.ts";

console.log("Testing 1600x1200 high-res image with thousands of color gradients...");
const width = 1600;
const height = 1200;
const totalPixels = width * height;
const data = new Uint8ClampedArray(totalPixels * 4);

// Generate complex photograph-like color data with gradients, noise and shapes
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    data[idx] = (Math.sin(x / 50) * 127 + 128) ^ (y % 256); // R
    data[idx + 1] = (Math.cos(y / 60) * 127 + 128) ^ (x % 256); // G
    data[idx + 2] = ((x + y) / (width + height)) * 255; // B
    data[idx + 3] = 255; // A
  }
}

const imageData = { width, height, data };

console.time("GIF Encoding");
const gifBytes = encodeImageDataToGif(imageData);
console.timeEnd("GIF Encoding");

fs.writeFileSync("test_large.gif", Buffer.from(gifBytes));
console.log(`Saved test_large.gif (${gifBytes.length} bytes)`);

console.time("BMP Encoding");
const bmpBytes = encodeImageDataToBmp(imageData);
console.timeEnd("BMP Encoding");
fs.writeFileSync("test_large.bmp", Buffer.from(bmpBytes));
console.log(`Saved test_large.bmp (${bmpBytes.length} bytes)`);
