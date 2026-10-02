/**
 * In-Browser Image Encoding Suite
 * Provides native binary encoders for GIF (GIF89a with LZW), Windows BMP (24-bit DIB),
 * Windows ICO (PNG/DIB Directory), TIFF 6.0 (Baseline RGB), and SVG vector wrappers.
 *
 * Ensures all exported image files strictly conform to binary specifications
 * and open smoothly in macOS Preview, Windows Photo Viewer, Photoshop, and web browsers.
 */

/**
 * Fast & High-Fidelity GIF89a Encoder
 * Converts Canvas ImageData into a 100% valid GIF89a binary byte array
 */
export function encodeImageDataToGif(imageData: ImageData): Uint8Array {
  const width = Math.max(1, imageData.width);
  const height = Math.max(1, imageData.height);
  const data = imageData.data;
  const totalPixels = width * height;

  // 1. Build an adaptive 256-color palette
  const palette: [number, number, number][] = [];
  const histogram = new Map<number, { count: number; r: number; g: number; b: number }>();

  // Sample colors (quantize 5 bits per channel for palette binning)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Blend transparency over white background
    const alpha = a / 255;
    const finalR = Math.round(r * alpha + 255 * (1 - alpha));
    const finalG = Math.round(g * alpha + 255 * (1 - alpha));
    const finalB = Math.round(b * alpha + 255 * (1 - alpha));

    const key = ((finalR >> 3) << 10) | ((finalG >> 3) << 5) | (finalB >> 3);
    const existing = histogram.get(key);
    if (existing) {
      existing.count++;
      existing.r += finalR;
      existing.g += finalG;
      existing.b += finalB;
    } else {
      histogram.set(key, { count: 1, r: finalR, g: finalG, b: finalB });
    }
  }

  // Sort candidate buckets by frequency
  const sortedCandidates = Array.from(histogram.values()).sort((a, b) => b.count - a.count);
  const maxColors = Math.min(256, sortedCandidates.length);

  for (let i = 0; i < maxColors; i++) {
    const c = sortedCandidates[i];
    palette.push([
      Math.round(c.r / c.count),
      Math.round(c.g / c.count),
      Math.round(c.b / c.count),
    ]);
  }

  // Pad palette to 256 colors
  while (palette.length < 256) {
    palette.push([0, 0, 0]);
  }

  // Fast nearest-color cache using 15-bit RGB index
  const paletteCache = new Uint8Array(32768);
  const cacheFilled = new Uint8Array(32768);

  function getNearestPaletteIndex(r: number, g: number, b: number): number {
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    if (cacheFilled[key]) {
      return paletteCache[key];
    }
    let minDist = Infinity;
    let bestIdx = 0;
    for (let i = 0; i < maxColors; i++) {
      const pr = palette[i][0];
      const pg = palette[i][1];
      const pb = palette[i][2];
      // Perceptually weighted Euclidean color distance
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
      if (dist < minDist) {
        minDist = dist;
        bestIdx = i;
        if (dist === 0) break;
      }
    }
    paletteCache[key] = bestIdx;
    cacheFilled[key] = 1;
    return bestIdx;
  }

  // 2. Map all image pixels to palette indices
  const indexedPixels = new Uint8Array(totalPixels);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const a = data[i + 3];
    const alpha = a / 255;
    const r = Math.round(data[i] * alpha + 255 * (1 - alpha));
    const g = Math.round(data[i + 1] * alpha + 255 * (1 - alpha));
    const b = Math.round(data[i + 2] * alpha + 255 * (1 - alpha));
    indexedPixels[p] = getNearestPaletteIndex(r, g, b);
  }

  // 3. Assemble GIF89a Binary Stream
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize; // 256
  const eoiCode = clearCode + 1; // 257
  let codeSize = minCodeSize + 1; // 9
  let nextCode = eoiCode + 1; // 258

  const outBytes: number[] = [];

  // Header: "GIF89a"
  outBytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // Logical Screen Descriptor (7 bytes)
  outBytes.push(width & 0xff, (width >> 8) & 0xff);
  outBytes.push(height & 0xff, (height >> 8) & 0xff);
  outBytes.push(0xf7); // GCT present, 8 bits/pixel, 256 colors
  outBytes.push(0x00); // BG color index
  outBytes.push(0x00); // Pixel aspect ratio

  // Global Color Table (256 * 3 = 768 bytes)
  for (let i = 0; i < 256; i++) {
    outBytes.push(palette[i][0], palette[i][1], palette[i][2]);
  }

  // Graphic Control Extension (8 bytes)
  outBytes.push(0x21, 0xf9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00);

  // Image Descriptor (10 bytes)
  outBytes.push(0x2c); // Separator
  outBytes.push(0x00, 0x00); // Left 0
  outBytes.push(0x00, 0x00); // Top 0
  outBytes.push(width & 0xff, (width >> 8) & 0xff);
  outBytes.push(height & 0xff, (height >> 8) & 0xff);
  outBytes.push(0x00); // No local table, non-interlaced

  // Image Data
  outBytes.push(minCodeSize); // LZW min code size = 8

  // Bit accumulator for variable-bit codes
  let curAccum = 0;
  let curBits = 0;
  const subBlock: number[] = [];

  function flushSubBlock() {
    if (subBlock.length > 0) {
      outBytes.push(subBlock.length);
      for (let b = 0; b < subBlock.length; b++) {
        outBytes.push(subBlock[b]);
      }
      subBlock.length = 0;
    }
  }

  function emitCode(code: number) {
    curAccum |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) {
      subBlock.push(curAccum & 0xff);
      if (subBlock.length === 254) {
        flushSubBlock();
      }
      curAccum >>= 8;
      curBits -= 8;
    }
  }

  function flushBits() {
    if (curBits > 0) {
      subBlock.push(curAccum & 0xff);
      curAccum = 0;
      curBits = 0;
    }
    flushSubBlock();
  }

  // LZW Dictionary Map: (prefix << 8) | nextChar -> newCode
  const dict = new Map<number, number>();

  function resetDict() {
    dict.clear();
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  // Output Clear Code at start
  emitCode(clearCode);
  resetDict();

  if (indexedPixels.length > 0) {
    let prefix = indexedPixels[0];

    for (let i = 1; i < indexedPixels.length; i++) {
      const c = indexedPixels[i];
      const key = (prefix << 8) | c;
      const entry = dict.get(key);

      if (entry !== undefined) {
        prefix = entry;
      } else {
        emitCode(prefix);

        if (nextCode < 4096) {
          dict.set(key, nextCode++);
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          // Table full, emit clear code
          emitCode(clearCode);
          resetDict();
        }

        prefix = c;
      }
    }

    emitCode(prefix);
  }

  // Emit End of Information code
  emitCode(eoiCode);
  flushBits();

  // Block terminator
  outBytes.push(0x00);

  // Trailer: ';'
  outBytes.push(0x3b);

  return new Uint8Array(outBytes);
}

/**
 * 24-bit uncompressed Windows DIB BMP Encoder
 * Generates 100% valid BMP file readable in macOS Preview, Windows Paint, Linux
 */
export function encodeImageDataToBmp(imageData: ImageData): Uint8Array {
  const width = Math.max(1, imageData.width);
  const height = Math.max(1, imageData.height);
  const data = imageData.data;

  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true); // Reserved 1
  view.setUint16(8, 0, true); // Reserved 2
  view.setUint32(10, 54, true); // Offset to pixel data (14 + 40)

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height (positive = bottom-up)
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel (24-bit RGB)
  view.setUint32(30, 0, true); // Compression (0 = BI_RGB)
  view.setUint32(34, pixelDataSize, true); // Image data size
  view.setInt32(38, 2835, true); // X pixels per meter (72 DPI)
  view.setInt32(42, 2835, true); // Y pixels per meter (72 DPI)
  view.setUint32(46, 0, true); // Colors used
  view.setUint32(50, 0, true); // Important colors

  // Pixel Data (BGR, bottom-to-top)
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    let rowOffset = offset;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const a = data[srcIdx + 3];

      const alpha = a / 255;
      const finalR = Math.round(r * alpha + 255 * (1 - alpha));
      const finalG = Math.round(g * alpha + 255 * (1 - alpha));
      const finalB = Math.round(b * alpha + 255 * (1 - alpha));

      uint8[rowOffset++] = finalB; // Blue
      uint8[rowOffset++] = finalG; // Green
      uint8[rowOffset++] = finalR; // Red
    }
    // Pad remaining row bytes with 0
    while (rowOffset < offset + rowSize) {
      uint8[rowOffset++] = 0;
    }
    offset += rowSize;
  }

  return uint8;
}

/**
 * Windows ICO File Builder
 * Wraps PNG image data in a valid Windows Icon Directory
 */
export async function encodePngToIco(pngBlob: Blob, width: number, height: number): Promise<Uint8Array> {
  const pngArrayBuffer = await pngBlob.arrayBuffer();
  const pngBytes = new Uint8Array(pngArrayBuffer);
  const pngSize = pngBytes.length;

  const icoSize = 6 + 16 + pngSize;
  const buffer = new ArrayBuffer(icoSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // ICONDIR (6 bytes)
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type (1 = ICO)
  view.setUint16(4, 1, true); // Number of images (1)

  // ICONDIRENTRY (16 bytes)
  view.setUint8(6, width >= 256 ? 0 : width); // Width
  view.setUint8(7, height >= 256 ? 0 : height); // Height
  view.setUint8(8, 0); // Color count
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngSize, true); // Size of PNG data
  view.setUint32(18, 22, true); // Offset to PNG data (6 + 16)

  // Copy PNG bytes into ICO
  uint8.set(pngBytes, 22);

  return uint8;
}

/**
 * Uncompressed Baseline RGB TIFF 6.0 Encoder
 * Generates 100% valid Little-Endian TIFF image file
 */
export function encodeImageDataToTiff(imageData: ImageData): Uint8Array {
  const width = Math.max(1, imageData.width);
  const height = Math.max(1, imageData.height);
  const data = imageData.data;

  const pixelByteCount = width * height * 3;
  // TIFF Header (8) + IFD (2 + 12*12 + 4 = 150) + Extra fields (6 + 8 + 8 = 22) + Pixels
  const extraFieldsOffset = 8 + 150;
  const pixelsOffset = extraFieldsOffset + 24;
  const totalFileSize = pixelsOffset + pixelByteCount;

  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // 1. TIFF Header (8 bytes)
  view.setUint8(0, 0x49); // 'I' (Little-Endian)
  view.setUint8(1, 0x49); // 'I'
  view.setUint16(2, 42, true); // Magic 42
  view.setUint32(4, 8, true); // Offset to first IFD

  // 2. IFD (Image File Directory)
  let ifdPos = 8;
  const numTags = 12;
  view.setUint16(ifdPos, numTags, true);
  ifdPos += 2;

  function writeTag(tag: number, type: number, count: number, valueOrOffset: number) {
    view.setUint16(ifdPos, tag, true);
    view.setUint16(ifdPos + 2, type, true); // 3=SHORT, 4=LONG, 5=RATIONAL
    view.setUint32(ifdPos + 4, count, true);
    view.setUint32(ifdPos + 8, valueOrOffset, true);
    ifdPos += 12;
  }

  const bitsPerSampleOffset = extraFieldsOffset;
  const xResOffset = extraFieldsOffset + 6;
  const yResOffset = extraFieldsOffset + 14;

  writeTag(256, 4, 1, width); // ImageWidth
  writeTag(257, 4, 1, height); // ImageLength
  writeTag(258, 3, 3, bitsPerSampleOffset); // BitsPerSample [8, 8, 8]
  writeTag(259, 3, 1, 1); // Compression (1 = uncompressed)
  writeTag(262, 3, 1, 2); // PhotometricInterpretation (2 = RGB)
  writeTag(273, 4, 1, pixelsOffset); // StripOffsets
  writeTag(277, 3, 1, 3); // SamplesPerPixel (3 for RGB)
  writeTag(278, 4, 1, height); // RowsPerStrip
  writeTag(279, 4, 1, pixelByteCount); // StripByteCounts
  writeTag(282, 5, 1, xResOffset); // XResolution (72/1)
  writeTag(283, 5, 1, yResOffset); // YResolution (72/1)
  writeTag(296, 3, 1, 2); // ResolutionUnit (2 = inch)

  view.setUint32(ifdPos, 0, true); // Next IFD = 0

  // 3. Extra Fields
  // BitsPerSample values (3 * SHORT = 6 bytes): 8, 8, 8
  view.setUint16(bitsPerSampleOffset, 8, true);
  view.setUint16(bitsPerSampleOffset + 2, 8, true);
  view.setUint16(bitsPerSampleOffset + 4, 8, true);

  // XResolution (72 / 1 = 8 bytes)
  view.setUint32(xResOffset, 72, true);
  view.setUint32(xResOffset + 4, 1, true);

  // YResolution (72 / 1 = 8 bytes)
  view.setUint32(yResOffset, 72, true);
  view.setUint32(yResOffset + 4, 1, true);

  // 4. Pixel Data (RGB)
  let pOffset = pixelsOffset;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const alpha = a / 255;
    uint8[pOffset++] = Math.round(r * alpha + 255 * (1 - alpha));
    uint8[pOffset++] = Math.round(g * alpha + 255 * (1 - alpha));
    uint8[pOffset++] = Math.round(b * alpha + 255 * (1 - alpha));
  }

  return uint8;
}

/**
 * Wraps raster image data URL into a clean SVG vector container
 */
export function encodeImageToSvg(dataUrl: string, width: number, height: number): string {
  const safeWidth = Math.max(1, width || 800);
  const safeHeight = Math.max(1, height || 600);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${safeWidth} ${safeHeight}" width="${safeWidth}" height="${safeHeight}">
  <image width="${safeWidth}" height="${safeHeight}" xlink:href="${dataUrl}" href="${dataUrl}"/>
</svg>`;
}
