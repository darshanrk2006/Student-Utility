# StudentToolkit 🎓⚡

> **Free, No-Login, Privacy-First Utility Suite for College Students.**  
> Built with Next.js (App Router), TypeScript, Tailwind CSS, and `pdf-lib`. Ready for 1-click deployment on **Vercel**.

---

## 🌟 Overview & Highlights

- **100% Free Forever**: No login, no sign-up, no subscriptions, and zero paywalls.
- **Privacy-First Architecture**: Client-side processing via WebAssembly and JavaScript. Sensitive files (homework, research papers, resumes) **never leave the user's computer or phone**.
- **Mobile-First & Responsive**: Engineered for touchscreens, mobile safari, Chrome, MacBooks, Windows, and Chromebooks.
- **Dark / Light / System Mode**: Instant toggle with theme persistence.
- **Instant Search & Command Palette**: Press <kbd>Cmd</kbd>+<kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> to jump to any tool instantly.

---

## 🧰 Tools Included

### A) QR Code Generator (`/qr`)
- **Single Mode**: Custom foreground/background colors, error correction levels (L, M, Q, H), margins, live preview.
- **Download**: Vector SVG & high-resolution PNG.
- **Bulk Mode**: Paste multiple links (one per line), generate all in parallel, and download as a bundled `.zip` archive.

### B) In-Browser PDF & Image Suite (Zero Server Upload)
- **Merge PDF (`/pdf-merge`)**: Drag & drop multiple files, re-order sequence, merge with `pdf-lib`.
- **Split PDF (`/pdf-split`)**: Custom range extraction (e.g. `1-3, 5, 8`), visual page selection, or extract all pages into a `.zip`.
- **Organize & Rotate PDF (`/pdf-organize`)**: Visual thumbnail grid, rotate pages (90°/180°/270°), drag/reorder, delete blank pages.
- **Images to PDF (`/image-to-pdf`)**: Combine JPG, PNG, WebP photos into a PDF with A4/Letter sizing, orientation, and margin options.
- **PDF to Images (`/pdf-to-image`)**: Render pages at 2x retina DPI into PNG/JPG, download individual pages or batch ZIP.
- **Compress PDF (`/pdf-compress`)**: Client-side stream optimization and metadata stripping for Canvas/LMS file upload caps.
- **Add Page Numbers (`/pdf-page-numbers`)**: Multiple formats (`Page X of Y`, `Page X`, `X`, Roman numerals), 6 positions, cover page skip.
- **PDF to Text (`/pdf-to-text`)**: Extract selectable text transcripts, copy to clipboard, or export as `.txt` / `.md`.

### C) High-Fidelity Document Converters (`/word-to-pdf`, `/pdf-to-word`, `/powerpoint-to-pdf`, `/excel-to-pdf`)
- **Adapter Architecture (`lib/converter.ts`)**: Provider-agnostic abstraction supporting **ConvertAPI**, CloudConvert, Adobe PDF Services, or sandbox mock fallback.
- **Vercel Blob Direct Client Upload**: Files over Vercel's serverless body cap (> 4.5MB) stream directly to Vercel Blob storage, convert from the blob URL, and delete immediately.
- **Rate Limiting (`lib/ratelimit.ts`)**: IP-based rate limiting via Upstash Redis (10 conversions / hr / IP) with graceful in-memory fallback.
- **Auto-Cleanup Cron (`/api/cron/cleanup`)**: Configured in `vercel.json` to purge orphaned temporary files every hour.

### D) Apple Pages Suite (`/pages-to-pdf`, `/pages-guide`)
- **Pages (.pages) to PDF Extractor**: Modern `.pages` files are ZIP bundles containing `QuickLook/Preview.pdf`. Extracts it client-side in milliseconds using `JSZip`.
- **Honest Guides**: Clear explanations and step-by-step instructions for Windows/Linux users using iCloud.com Pages and Mac native export. **No deceptive/fake converters.**

### E) Student Academic Utilities
- **Word & Character Counter (`/word-counter`)**: Live count for words, characters (with/without spaces), reading duration (225 WPM), speaking duration (130 WPM), and top keyword density.
- **Citation Generator (`/citation-generator`)**: Accurate citations in APA 7th, MLA 9th, Chicago 17th, Harvard, and BibTeX for Websites, Books, and Journal Articles with in-text parenthetical citations.
- **GPA / CGPA Calculator (`/gpa-calculator`)**: Semester GPA and cumulative CGPA calculator with 4.0 grade weights, custom credit hours, and academic honors standings (Summa/Magna Cum Laude, Dean's List).
- **Engineering & Science Unit Converter (`/unit-converter`)**: Length, Mass, Temperature, Data Storage (Bytes, KB, MB, GB, TB, PB), Speed, Area, Time.
- **Image Compressor (`/image-compressor`)**: In-browser canvas image compression with quality slider, max dimension scaling, and batch ZIP export.

---

## 🏗️ Architecture & Folder Structure

```
qr and conv/
├── app/
│   ├── layout.tsx                    # Root layout with Navbar, Footer, SEO Schema & Fonts
│   ├── page.tsx                      # Home page: Hero, search bar, category pills, tool grid
│   ├── globals.css                   # Tailwind CSS styling, dark/light theme variables
│   │
│   ├── (tools)/                      # Dedicated routes for each tool
│   │   ├── qr/page.tsx
│   │   ├── pdf-merge/page.tsx
│   │   ├── pdf-split/page.tsx
│   │   ├── pdf-organize/page.tsx
│   │   ├── image-to-pdf/page.tsx
│   │   ├── pdf-to-image/page.tsx
│   │   ├── pdf-compress/page.tsx
│   │   ├── pdf-page-numbers/page.tsx
│   │   ├── pdf-to-text/page.tsx
│   │   ├── word-to-pdf/page.tsx
│   │   ├── pdf-to-word/page.tsx
│   │   ├── powerpoint-to-pdf/page.tsx
│   │   ├── excel-to-pdf/page.tsx
│   │   ├── pages-to-pdf/page.tsx
│   │   ├── pages-guide/page.tsx
│   │   ├── word-counter/page.tsx
│   │   ├── citation-generator/page.tsx
│   │   ├── gpa-calculator/page.tsx
│   │   ├── unit-converter/page.tsx
│   │   └── image-compressor/page.tsx
│   │
│   ├── privacy/page.tsx              # Detailed transparent privacy breakdown
│   ├── about/page.tsx                # About StudentToolkit story & mission
│   ├── sitemap.ts                    # Dynamic XML sitemap for SEO
│   ├── robots.ts                     # Search engine crawler directives
│   │
│   └── api/
│       ├── convert/route.ts          # Server-side conversion endpoint with rate limit & auto-del
│       ├── upload-blob/route.ts      # Vercel Blob client upload handler for > 4.5MB files
│       └── cron/cleanup/route.ts     # Hourly cron task to purge expired blobs
│
├── components/
│   ├── Navbar.tsx                    # Top navigation with live search modal (Cmd+K)
│   ├── Footer.tsx                    # Responsive footer with privacy & tool links
│   ├── ToolLayout.tsx                # Standard tool layout with steps, FAQs, and breadcrumbs
│   ├── Dropzone.tsx                  # Drag-and-drop file upload with validation
│   ├── ProgressCard.tsx              # Processing bar & download button with confetti
│   ├── ServerConvertTool.tsx         # Generic handler for cloud document conversions
│   └── ThemeToggle.tsx               # Light / Dark / System mode switch
│
├── lib/
│   ├── converter.ts                  # Provider adapter (ConvertAPI / CloudConvert / Mock)
│   ├── ratelimit.ts                  # Upstash Redis rate limiter with in-memory fallback
│   ├── pdf-utils.ts                  # Client-side PDF manipulation & rendering
│   ├── jszip-utils.ts                # ZIP generation & Apple Pages preview extractor
│   ├── qr-utils.ts                   # QR code generation & bulk ZIP packaging
│   ├── client-converter.ts           # Frontend conversion client with large-file blob upload
│   ├── tools-data.ts                 # Central registry of tools, categories, and metadata
│   └── utils.ts                      # Tailwind merge, byte formatting, blob download helpers
│
├── vercel.json                       # Cron schedules & serverless function duration config
├── .env.example                      # Environment variables documentation
└── README.md                         # Complete project documentation
```

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm** or **pnpm** or **yarn**

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd "qr and conv"
npm install
```

### 2. Configure Environment (Optional for local dev)
Copy the example environment file:
```bash
cp .env.example .env.local
```
*(All client-side PDF, QR, Apple Pages, and Academic tools work 100% locally with zero environment variables configured. If `CONVERT_API_KEY` is omitted, server document conversions run in a sandbox demonstration mode).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Description | Required? | Where to obtain |
| :--- | :--- | :--- | :--- |
| `CONVERT_API_KEY` | API Secret for ConvertAPI (Word/PPT/Excel to PDF & PDF to Word) | Optional (Required for live cloud conversions) | [ConvertAPI](https://www.convertapi.com) |
| `BLOB_READ_WRITE_TOKEN` | Token for large file uploads (> 4.5MB) via Vercel Blob | Optional (Required for files > 4.5MB) | Vercel Dashboard &rarr; Storage &rarr; Blob |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for serverless rate limiting | Optional (In-memory fallback used if unset) | [Upstash Console](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Optional | Upstash Console |
| `CRON_SECRET` | Secret token to secure `/api/cron/cleanup` | Optional | Random string of your choice |

---

## 🚀 Step-by-Step Vercel Deployment Instructions

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: complete production StudentToolkit"
git branch -M main
git remote add origin https://github.com/<your-username>/studenttoolkit.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** &gt; **Project**.
3. Select your `studenttoolkit` GitHub repository and click **Import**.
4. Framework Preset will automatically detect **Next.js**.

### Step 3: Add Environment Variables in Vercel
In the Vercel project configuration screen, expand **Environment Variables** and add:
- `CONVERT_API_KEY` = your ConvertAPI secret
- `CRON_SECRET` = a secure random string

### Step 4: Add Vercel Blob & Upstash Redis (1-Click Integrations)
1. **Vercel Blob** (For direct large file client uploads):
   - In your project in Vercel, go to the **Storage** tab.
   - Click **Create Database** &gt; **Blob** &gt; **Create**.
   - Vercel automatically attaches `BLOB_READ_WRITE_TOKEN` to your project!
2. **Upstash Redis** (For rate limiting without login):
   - In the **Storage** or **Marketplace** tab in Vercel, click **Upstash Redis**.
   - Create a free database. Vercel automatically populates `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### Step 5: Deploy!
Click **Deploy**. Your production application will be live at `https://your-project.vercel.app` in under 60 seconds!

---

## 📋 Post-Deploy Verification Checklist

- [ ] **QR Code Generator (`/qr`)**:
  - Test single link generation, change foreground/background colors.
  - Download PNG and SVG.
  - Switch to **Bulk Generator**, paste 4 URLs, click **Download (ZIP)** and extract.
- [ ] **Merge PDF (`/pdf-merge`)**:
  - Upload 2 or 3 PDF documents, drag/reorder them, click **Merge PDFs Now**, and download.
- [ ] **Split PDF (`/pdf-split`)**:
  - Upload a multi-page PDF, select page range `1-2`, and download. Test **Extract All Pages (ZIP)**.
- [ ] **Organize & Rotate PDF (`/pdf-organize`)**:
  - Upload PDF, rotate page 1 by 90°, delete page 2, and save organized PDF.
- [ ] **Images to PDF (`/image-to-pdf`)**:
  - Upload 2 JPG/PNG photos, choose A4 size, and generate PDF.
- [ ] **PDF to Images (`/pdf-to-image`)**:
  - Upload PDF, verify high-resolution canvas thumbnails, and download page images or ZIP.
- [ ] **Compress PDF (`/pdf-compress`)**:
  - Upload PDF, compress with Balanced preset, verify % reduction and download.
- [ ] **Apple Pages Extractor (`/pages-to-pdf`)**:
  - Upload a `.pages` file. Verify instant extraction of embedded QuickLook preview.
- [ ] **Word to PDF (`/word-to-pdf`)**:
  - Upload `.docx` file. Verify conversion and auto-deletion response.
- [ ] **Word Counter & Citation Generator (`/word-counter`, `/citation-generator`)**:
  - Paste essay text, test live word count and reading time.
  - Generate APA 7th and MLA 9th citations, copy in-text and full bibliography entries.
- [ ] **GPA Calculator (`/gpa-calculator`)**:
  - Add 4 courses, assign grades and credits, verify 4.0 calculation and honors standing confetti.
- [ ] **Dark / Light Mode**:
  - Click theme toggle in header, verify clean dark/light mode across mobile and desktop.
- [ ] **Mobile & Cross-Browser Verification**:
  - Test on Chrome (Windows/Mac), Safari (iOS/macOS), Firefox, and Android.

---

## ⚖️ Limitations & Architectural Transparency Report

1. **Scanned Image-Only PDFs (OCR)**:
   - The `/pdf-to-text` tool extracts digital selectable text streams embedded in PDFs client-side. Pure bitmap scans without an OCR layer cannot be decoded without heavy server-side neural network models (Tesseract / Google Vision OCR). A clear notice is displayed to users.
2. **Older Apple Pages Files without Embedded QuickLook**:
   - Modern Pages documents include `QuickLook/Preview.pdf`. If a user unchecks &quot;Include Preview&quot; in Pages Preferences or uploads a legacy single-file Pages XML file, the browser cannot decompress a preview that does not exist. We handle this honestly by guiding the user to free native export in Pages or `iCloud.com/pages`.
3. **Password-Protected / Encrypted PDFs**:
   - For client-side tools (`pdf-lib`), encrypted/password-locked PDFs cannot be modified without first removing the password in the client's PDF reader.
4. **Cloud Document Conversions**:
   - Pure client-side conversion of proprietary Microsoft formats (`.docx`, `.pptx`, `.xlsx`) to vector PDF requires a rendering engine (LibreOffice / MS Office APIs). We route these through a secure serverless adapter (`lib/converter.ts`) with immediate in-memory streaming and auto-purge to preserve student privacy.
