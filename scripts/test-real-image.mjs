import fs from "fs";
import { encodeImageDataToGif, encodeImageDataToBmp, encodeImageDataToTiff } from "../lib/image-encoders.ts";

// Create a 100x100 RGB gradient test image
const width = 100;
const height = 100;
const data = new Uint8ClampedArray(width * height * 4);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    data[idx] = Math.floor((x / width) * 255); // R
    data[idx + 1] = Math.floor((y / height) * 255); // G
    data[idx + 2] = 128; // B
    data[idx + 3] = 255; // A
  }
}

const imageData = { width, height, data };

const gifBytes = encodeImageDataToGif(imageData);
fs.writeFileSync("test_output.gif", Buffer.from(gifBytes));

const bmpBytes = encodeImageDataToBmp(imageData);
fs.writeFileSync("test_output.bmp", Buffer.from(bmpBytes));

const tiffBytes = encodeImageDataToTiff(imageData);
fs.writeFileSync("test_output.tiff", Buffer.from(tiffBytes));

console.log("Saved test_output.gif, test_output.bmp, test_output.tiff");
