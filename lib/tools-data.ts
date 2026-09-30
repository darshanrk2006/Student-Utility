export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  category: "pdf" | "qr" | "convert" | "apple" | "academic";
  description: string;
  shortDesc: string;
  iconName: string;
  badge?: string;
  badgeType?: "in-browser" | "cloud" | "guide" | "popular";
  isClientOnly: boolean;
  tags: string[];
  features: string[];
  steps: { step: number; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const TOOL_CATEGORIES = [
  { id: "all", label: "All Tools", icon: "LayoutGrid" },
  { id: "pdf", label: "PDF Suite", icon: "FileText" },
  { id: "qr", label: "QR Generator", icon: "QrCode" },
  { id: "convert", label: "Document Converters", icon: "ArrowLeftRight" },
  { id: "apple", label: "Apple Pages", icon: "Apple" },
  { id: "academic", label: "Student Utilities", icon: "GraduationCap" },
] as const;

export const TOOLS: ToolItem[] = [
  // --- QR Code Suite ---
  {
    id: "qr-generator",
    name: "QR Code Generator",
    slug: "qr",
    href: "/qr",
    category: "qr",
    shortDesc: "Generate single or bulk QR codes in PNG and SVG with color customization.",
    description:
      "Create high-resolution QR codes in real-time with custom foreground/background colors, adjustable size, margin, and error-correction levels. Supports bulk generation with batch ZIP download.",
    iconName: "QrCode",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["qr", "barcode", "generator", "link to qr", "bulk qr", "svg", "png", "wifi qr"],
    features: [
      "Custom foreground and background color pickers",
      "Adjustable error correction level (L, M, Q, H)",
      "Instant SVG vector & high-res PNG download",
      "Bulk generator mode: batch create and download as ZIP",
      "No file uploads: generated 100% on your device",
    ],
    steps: [
      { step: 1, title: "Enter Text or URLs", desc: "Paste any link, text, or multiple lines for bulk mode." },
      { step: 2, title: "Customize Appearance", desc: "Choose your favorite colors, error correction, and padding." },
      { step: 3, title: "Download", desc: "Save as crisp SVG, crystal clear PNG, or bundled ZIP." },
    ],
    faqs: [
      {
        q: "Do generated QR codes ever expire?",
        a: "No! These are standard static QR codes encoded directly with your data. They will work forever without relying on any external server or redirect.",
      },
      {
        q: "What is Error Correction Level?",
        a: "Error correction allows a QR code to remain readable even if it gets partially damaged, smudged, or covered by a logo. 'High' can restore up to 30% damaged data.",
      },
    ],
  },

  // --- PDF Suite ---
  {
    id: "pdf-merge",
    name: "Merge PDF",
    slug: "pdf-merge",
    href: "/pdf-merge",
    category: "pdf",
    shortDesc: "Combine multiple PDF documents into a single file with custom ordering.",
    description:
      "Combine assignments, lecture notes, syllabus pages, and scans into a single cohesive PDF document. Reorder pages and files seamlessly inside your browser.",
    iconName: "Layers",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["merge pdf", "combine pdf", "join pdf", "concat pdf", "multi pdf"],
    features: [
      "Drag-and-drop multiple PDF files at once",
      "Visual re-ordering before combining",
      "Blazing fast client-side merging via pdf-lib",
      "Zero file size limit & complete privacy",
    ],
    steps: [
      { step: 1, title: "Select Files", desc: "Drop or choose two or more PDF files from your computer or phone." },
      { step: 2, title: "Arrange Order", desc: "Drag files up or down to set the desired page sequence." },
      { step: 3, title: "Merge & Download", desc: "Click Merge and get your combined PDF instantly." },
    ],
    faqs: [
      {
        q: "Are my PDF files uploaded to any server?",
        a: "No! All merging is done 100% locally in your browser memory using WebAssembly & JavaScript. Your confidential homework and documents never leave your computer.",
      },
    ],
  },
  {
    id: "pdf-split",
    name: "Split PDF",
    slug: "pdf-split",
    href: "/pdf-split",
    category: "pdf",
    shortDesc: "Extract specific pages, page ranges, or split every page into a ZIP.",
    description:
      "Split large lecture slides, book chapters, or multi-page documents into individual pages or custom ranges (e.g., 1-5, 8, 11-14).",
    iconName: "Scissors",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["split pdf", "extract pages", "separate pdf", "cut pdf", "slice pdf"],
    features: [
      "Visual page grid preview",
      "Custom page range selection (e.g. 1-3, 5, 7-10)",
      "One-click 'Extract All Pages' to ZIP archive",
      "Instant client-side extraction",
    ],
    steps: [
      { step: 1, title: "Upload PDF", desc: "Drop your PDF file into the splitter." },
      { step: 2, title: "Select Pages", desc: "Click individual pages or type a custom range expression." },
      { step: 3, title: "Download", desc: "Export the selected pages as a new PDF or ZIP archive." },
    ],
    faqs: [
      {
        q: "Can I split encrypted or password-protected PDFs?",
        a: "If the PDF is password-protected, please remove the password first before uploading for client-side processing.",
      },
    ],
  },
  {
    id: "pdf-organize",
    name: "Organize & Rotate PDF",
    slug: "pdf-organize",
    href: "/pdf-organize",
    category: "pdf",
    shortDesc: "Reorder, rotate (90°/180°/270°), and delete pages visually.",
    description:
      "Fix upside-down scanned homework, delete blank pages, and arrange slides in chronological order with an interactive visual page manager.",
    iconName: "RotateCw",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["rotate pdf", "reorder pdf", "delete pdf pages", "organize pdf", "rearrange pdf"],
    features: [
      "Interactive visual thumbnail cards for every page",
      "Rotate individual pages or all pages at once",
      "Delete unwanted or blank pages with 1 click",
      "Drag-and-drop or use quick arrows to reorder pages",
    ],
    steps: [
      { step: 1, title: "Upload Document", desc: "Drop any PDF to generate visual thumbnails." },
      { step: 2, title: "Rearrange & Rotate", desc: "Drag cards, click rotate icons, or delete unwanted pages." },
      { step: 3, title: "Save New PDF", desc: "Download your perfected PDF layout immediately." },
    ],
    faqs: [
      {
        q: "Does rotating degrade document or text quality?",
        a: "No! PDF page rotation modifies the orientation metadata matrix lossless-ly without re-rasterizing text or vector artwork.",
      },
    ],
  },
  {
    id: "image-to-pdf",
    name: "Images to PDF",
    slug: "image-to-pdf",
    href: "/image-to-pdf",
    category: "pdf",
    shortDesc: "Convert JPG, PNG, and WebP images or homework photos into a clean PDF.",
    description:
      "Transform photos of handwritten notes, textbook pages, whiteboard sketches, or receipts into a clean, submission-ready PDF file.",
    iconName: "Image",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["jpg to pdf", "png to pdf", "photos to pdf", "image to pdf", "convert images"],
    features: [
      "Supports JPG, JPEG, PNG, and WebP formats",
      "Auto-fit, portrait, landscape, or custom page orientations",
      "Configurable margins: None, Small, or Standard",
      "Visual drag-and-drop re-ordering of image pages",
    ],
    steps: [
      { step: 1, title: "Select Images", desc: "Choose all image files from your computer or phone library." },
      { step: 2, title: "Set Layout Options", desc: "Arrange image order, page size, and margins." },
      { step: 3, title: "Generate PDF", desc: "Click Convert and download your compiled PDF." },
    ],
    faqs: [
      {
        q: "Is there a limit on how many images I can convert at once?",
        a: "Because processing happens directly in your browser RAM, you can comfortably convert dozens of high-res images at once.",
      },
    ],
  },
  {
    id: "pdf-to-image",
    name: "PDF to Images",
    slug: "pdf-to-image",
    href: "/pdf-to-image",
    category: "pdf",
    shortDesc: "Render and export PDF pages as high-resolution PNG or JPG images.",
    description:
      "Convert lecture slides, posters, or PDF pages into standalone image files for presentation slides, notes apps, or study guides.",
    iconName: "FileImage",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["pdf to image", "pdf to png", "pdf to jpg", "export pdf pages", "pdf render"],
    features: [
      "Render every page at crisp 2x retina DPI",
      "Download individual pages as PNG/JPG or all pages as a ZIP",
      "Live preview gallery of rendered pages",
      "Pure in-browser canvas rendering",
    ],
    steps: [
      { step: 1, title: "Select PDF", desc: "Upload the PDF document you want to extract images from." },
      { step: 2, title: "Preview Pages", desc: "View the rendered high-resolution thumbnails." },
      { step: 3, title: "Download", desc: "Save specific pages or download everything in a ZIP." },
    ],
    faqs: [
      {
        q: "What format are the extracted images?",
        a: "You can download images as high-fidelity PNG (lossless) or JPEG format.",
      },
    ],
  },
  {
    id: "pdf-compress",
    name: "Compress PDF",
    slug: "pdf-compress",
    href: "/pdf-compress",
    category: "pdf",
    shortDesc: "Reduce PDF file size to meet strict LMS and portal upload limits.",
    description:
      "Shrink hefty PDF documents, scanned textbook chapters, and project submissions while preserving legibility for Blackboard, Canvas, and Moodle upload limits.",
    iconName: "Minimize2",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf optimizer", "lms upload"],
    features: [
      "Client-side optimization removing redundant metadata and compressing streams",
      "Multiple compression presets: High Quality, Balanced, and Maximum Compression",
      "Displays exact file size before and after compression",
      "Zero server uploads: 100% private",
    ],
    steps: [
      { step: 1, title: "Drop PDF", desc: "Select your large PDF file." },
      { step: 2, title: "Choose Level", desc: "Select Balanced or High compression depending on quality needs." },
      { step: 3, title: "Download", desc: "Inspect size reduction and save your optimized file." },
    ],
    faqs: [
      {
        q: "Why do college portals have file size limits?",
        a: "Learning management systems like Canvas or Turnitin often cap uploads at 10MB or 20MB. This tool helps you compress your submission instantly.",
      },
    ],
  },
  {
    id: "pdf-page-numbers",
    name: "Add Page Numbers",
    slug: "pdf-page-numbers",
    href: "/pdf-page-numbers",
    category: "pdf",
    shortDesc: "Insert custom page numbers, headers, and footers into any PDF.",
    description:
      "Number lab reports, theses, dissertations, and project documentation with customizable formats ('Page X of Y', 'X', or Roman numerals), positions, and font sizes.",
    iconName: "Hash",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["page numbers", "number pdf", "header footer", "pdf pagination", "numbering"],
    features: [
      "Multiple formats: 'Page X of Y', 'Page X', 'X', '- X -'",
      "6 position choices: Top / Bottom × Left / Center / Right",
      "Option to skip cover page (start numbering on page 2)",
      "Adjustable font size and margin padding",
    ],
    steps: [
      { step: 1, title: "Upload PDF", desc: "Select the PDF that needs pagination." },
      { step: 2, title: "Configure Numbers", desc: "Choose numbering format, placement, and starting page." },
      { step: 3, title: "Download", desc: "Get your numbered document ready for submission." },
    ],
    faqs: [
      {
        q: "Can I skip the title / cover page?",
        a: "Yes! Simply check the 'Skip Cover Page' option so the first page remains unnumbered.",
      },
    ],
  },
  {
    id: "pdf-to-text",
    name: "PDF to Text",
    slug: "pdf-to-text",
    href: "/pdf-to-text",
    category: "pdf",
    shortDesc: "Extract all selectable text and transcripts from PDF files client-side.",
    description:
      "Quickly extract text from research papers, slides, syllabus docs, and articles. Copy to clipboard or download as clean Plain Text (.txt) or Markdown.",
    iconName: "FileCode",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["pdf to text", "extract text", "pdf ocr", "pdf transcript", "txt export"],
    features: [
      "Extracts full text page-by-page directly in the browser",
      "One-click copy to clipboard",
      "Download as formatted .txt or .md file",
      "Character and word count breakdown per page",
    ],
    steps: [
      { step: 1, title: "Upload PDF", desc: "Select any PDF containing digital text." },
      { step: 2, title: "Review Extracted Text", desc: "Read, search, or edit extracted contents in real-time." },
      { step: 3, title: "Copy or Download", desc: "Copy directly or save as a .txt file." },
    ],
    faqs: [
      {
        q: "Does this work on scanned image-only PDFs?",
        a: "This tool extracts embedded digital text. If a PDF is purely a flat scanned photo without an OCR layer, no text stream will be found.",
      },
    ],
  },

  // --- Server-Side Document Converters ---
  {
    id: "universal-converter",
    name: "Universal Document Converter",
    slug: "convert",
    href: "/convert",
    category: "convert",
    shortDesc: "All-in-one converter: select uploaded document type and desired target format.",
    description:
      "Universal file converter dashboard. Specify your uploaded document and desired target format with high-fidelity output.",
    iconName: "ArrowLeftRight",
    badge: "Fast Cloud Convert",
    badgeType: "cloud",
    isClientOnly: false,
    tags: ["document converter", "universal converter", "convert files", "file transfer", "converter dashboard"],
    features: [
      "Select custom source format and target format dynamically",
      "Converts Word, PDF, PowerPoint, Excel, Images, and Text",
      "Immediate memory processing & auto-deletion guarantee",
    ],
    steps: [
      { step: 1, title: "Upload Document", desc: "Select or drop any file." },
      { step: 2, title: "Configure Transfer", desc: "Confirm uploaded document type and target format." },
      { step: 3, title: "Convert & Download", desc: "Download your converted file immediately." },
    ],
    faqs: [
      {
        q: "How does the converter identify my file?",
        a: "The dashboard automatically detects your document type from its header and extension, and lets you choose from all compatible target formats.",
      },
    ],
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    slug: "word-to-pdf",
    href: "/word-to-pdf",
    category: "convert",
    shortDesc: "Convert Word documents (.doc, .docx) into pristine PDF files.",
    description:
      "Convert Word essays, resumes, and report drafts into standardized PDF files with preserved typography, tables, and formatting.",
    iconName: "FileSpreadsheet",
    badge: "Fast Cloud Convert",
    badgeType: "cloud",
    isClientOnly: false,
    tags: ["word to pdf", "docx to pdf", "doc to pdf", "microsoft word", "word converter"],
    features: [
      "Supports both modern .docx and legacy .doc files",
      "Accurate rendering of fonts, tables, margins, and headers",
      "Temporary secure processing: files are purged immediately after conversion",
      "Direct large-file upload support via Vercel Blob",
    ],
    steps: [
      { step: 1, title: "Upload Word File", desc: "Drop your .docx or .doc file." },
      { step: 2, title: "Secure Processing", desc: "Document is converted via our high-fidelity converter engine." },
      { step: 3, title: "Download PDF", desc: "Download your PDF file instantly." },
    ],
    faqs: [
      {
        q: "How long is my uploaded file stored?",
        a: "Files are converted on-the-fly in memory or temporary isolated storage and deleted immediately after download. Our automated hourly cron job cleans up any leftover temp files.",
      },
    ],
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    slug: "pdf-to-word",
    href: "/pdf-to-word",
    category: "convert",
    shortDesc: "Convert PDF documents into editable Word (.docx) documents.",
    description:
      "Turn read-only PDF worksheets, assignments, and study materials into fully editable Microsoft Word (.docx) files.",
    iconName: "FileEdit",
    badge: "Fast Cloud Convert",
    badgeType: "cloud",
    isClientOnly: false,
    tags: ["pdf to word", "pdf to docx", "edit pdf", "convert to docx"],
    features: [
      "Converts PDF text, paragraphs, and tables into native Word format",
      "Clean editable output compatible with MS Word, Google Docs, and LibreOffice",
      "Privacy-first: immediate auto-deletion",
    ],
    steps: [
      { step: 1, title: "Select PDF", desc: "Drop your PDF file to convert." },
      { step: 2, title: "Convert to Docx", desc: "The engine reconstructs paragraphs and layouts into Word format." },
      { step: 3, title: "Download .docx", desc: "Save and open in Microsoft Word or Google Docs." },
    ],
    faqs: [
      {
        q: "Will formulas and tables be editable?",
        a: "Yes! Standard tables and text will convert into editable Word tables and typography.",
      },
    ],
  },
  {
    id: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    slug: "powerpoint-to-pdf",
    href: "/powerpoint-to-pdf",
    category: "convert",
    shortDesc: "Convert PowerPoint presentations (.ppt, .pptx) to PDF slides.",
    description:
      "Convert lecture decks and group presentation slides into universal PDF handouts ready for printing or study.",
    iconName: "Presentation",
    badge: "Fast Cloud Convert",
    badgeType: "cloud",
    isClientOnly: false,
    tags: ["ppt to pdf", "pptx to pdf", "powerpoint", "slides to pdf", "lecture slides"],
    features: [
      "Supports .pptx and .ppt formats",
      "Preserves slide graphics, vector shapes, and typography",
      "Fast, high-fidelity serverless conversion",
    ],
    steps: [
      { step: 1, title: "Upload Slides", desc: "Drop your PowerPoint .pptx or .ppt file." },
      { step: 2, title: "Convert", desc: "Our engine renders every slide into vector PDF pages." },
      { step: 3, title: "Download", desc: "Save your PDF presentation." },
    ],
    faqs: [
      {
        q: "Are animations included?",
        a: "PDF is a static document format, so slides are rendered in their final static state without transition animations.",
      },
    ],
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    href: "/excel-to-pdf",
    category: "convert",
    shortDesc: "Convert Excel spreadsheets (.xls, .xlsx) to PDF sheets.",
    description:
      "Convert budgets, lab data tables, and spreadsheets into formatted PDF documents without messy page cutoffs.",
    iconName: "Sheet",
    badge: "Fast Cloud Convert",
    badgeType: "cloud",
    isClientOnly: false,
    tags: ["excel to pdf", "xlsx to pdf", "xls to pdf", "spreadsheet to pdf", "table to pdf"],
    features: [
      "Supports .xlsx, .xls, and .csv formats",
      "Proper table pagination and column fitting",
      "High resolution typography and gridlines",
    ],
    steps: [
      { step: 1, title: "Upload Spreadsheet", desc: "Drop your .xlsx or .xls file." },
      { step: 2, title: "Format to PDF", desc: "Grid sheets are automatically fitted to printable pages." },
      { step: 3, title: "Download", desc: "Save your PDF spreadsheet." },
    ],
    faqs: [
      {
        q: "Will multi-sheet workbooks be converted?",
        a: "Yes, all active worksheets in the workbook are rendered sequentially into the PDF.",
      },
    ],
  },

  // --- Apple Pages Suite ---
  {
    id: "pages-to-pdf",
    name: "Pages (.pages) to PDF",
    slug: "pages-to-pdf",
    href: "/pages-to-pdf",
    category: "apple",
    shortDesc: "Extract the embedded preview PDF from Apple .pages files directly in browser.",
    description:
      "Apple Pages documents are packaged ZIP bundles that contain an embedded high-resolution QuickLook preview PDF. This tool extracts it instantly in your browser without uploading to any server.",
    iconName: "Apple",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["pages to pdf", "apple pages", ".pages file", "open pages on windows", "quicklook"],
    features: [
      "Pure client-side extraction using JSZip: instant & private",
      "Works on Windows, Android, Chromebooks, and Linux without Apple software",
      "Clear diagnostics if a .pages file is missing an embedded QuickLook preview",
    ],
    steps: [
      { step: 1, title: "Select .pages Document", desc: "Drop your Apple Pages (.pages) file." },
      { step: 2, title: "Instant Extraction", desc: "The embedded QuickLook PDF is located and extracted in milliseconds." },
      { step: 3, title: "Download PDF", desc: "Save and view your PDF on any device." },
    ],
    faqs: [
      {
        q: "Why does this work so quickly?",
        a: "Apple Pages packages modern documents with a built-in QuickLook/Preview.pdf file. We inspect the ZIP structure in your browser and deliver that exact PDF without expensive conversion delays.",
      },
      {
        q: "What if my .pages file doesn't have an embedded PDF?",
        a: "Some older files or documents saved without previews may lack it. If so, our tool explains exactly how to open and export it on iCloud.com or macOS for free.",
      },
    ],
  },
  {
    id: "pages-guide",
    name: "Apple Pages Conversion Guide",
    slug: "pages-guide",
    href: "/pages-guide",
    category: "apple",
    shortDesc: "Honest, step-by-step guides for Pages to Word, PDF to Pages, and Windows workflows.",
    description:
      "Learn the genuine, official ways to convert between Apple Pages and Microsoft Word or PDF on Mac, Windows, and iPad without scam converters.",
    iconName: "BookOpen",
    badge: "Official Guide",
    badgeType: "guide",
    isClientOnly: true,
    tags: ["pages to word", "pdf to pages", "word to pages", "pages guide", "icloud pages"],
    features: [
      "Verified workflows for Mac, Windows, Linux, and Chromebook users",
      "How to use iCloud.com for free full editing and exporting to Word .docx",
      "Explanation of native file format compatibility",
    ],
    steps: [
      { step: 1, title: "Choose Your OS", desc: "Select whether you are on Mac, Windows, iPad, or Chromebook." },
      { step: 2, title: "Follow Native Steps", desc: "Use built-in export or free iCloud.com tools." },
      { step: 3, title: "Export Format", desc: "Save as true Word .docx or vector PDF." },
    ],
    faqs: [
      {
        q: "Can Apple Pages open Microsoft Word (.docx) directly?",
        a: "Yes! Apple Pages opens .docx files natively without any conversion needed. Just double click or open in Pages.",
      },
    ],
  },

  // --- Academic Student Utilities ---
  {
    id: "word-counter",
    name: "Word & Character Counter",
    slug: "word-counter",
    href: "/word-counter",
    category: "academic",
    shortDesc: "Real-time word, character, sentence, reading time, and keyword analysis.",
    description:
      "Check essay length requirements, character limits with/without spaces, paragraph counts, estimated reading time, and keyword repetition for academic papers.",
    iconName: "FileText",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["word counter", "character count", "essay length", "reading time", "keyword density"],
    features: [
      "Live real-time count for words, characters (with & without spaces), sentences, and paragraphs",
      "Estimated reading time (225 WPM) and speaking presentation time (130 WPM)",
      "Top keyword frequency analysis to spot repetitive phrasing",
      "One-click copy, clear, and sample text loader",
    ],
    steps: [
      { step: 1, title: "Type or Paste", desc: "Paste your essay, abstract, or assignment text." },
      { step: 2, title: "Check Metrics", desc: "Review real-time stats, character counts, and reading durations." },
      { step: 3, title: "Refine", desc: "Adjust your word count to meet professor guidelines." },
    ],
    faqs: [
      {
        q: "Is my essay text saved anywhere?",
        a: "Never! All calculations run exclusively in your browser memory.",
      },
    ],
  },
  {
    id: "citation-generator",
    name: "Citation Generator",
    slug: "citation-generator",
    href: "/citation-generator",
    category: "academic",
    shortDesc: "Generate accurate citations in APA 7, MLA 9, Chicago, Harvard, and BibTeX.",
    description:
      "Format references for websites, books, academic journal articles, and lecture notes. Copy formatted citations or export your bibliography in one click.",
    iconName: "Quote",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["citation generator", "apa citation", "mla citation", "chicago citation", "bibtex", "bibliography"],
    features: [
      "Covers APA 7th ed., MLA 9th ed., Chicago 17th ed., Harvard, and BibTeX",
      "Supports Websites, Books, and Journal Articles",
      "Includes both in-text citations and full bibliography entries",
      "Instant copy formatted text or export all references",
    ],
    steps: [
      { step: 1, title: "Select Format & Source", desc: "Pick APA, MLA, Chicago, etc., and source type (Book, Web, Journal)." },
      { step: 2, title: "Fill Details", desc: "Enter authors, title, year, URL, or publication info." },
      { step: 3, title: "Copy Citation", desc: "Copy the formatted bibliography entry and in-text citation." },
    ],
    faqs: [
      {
        q: "Are these updated to the latest style editions?",
        a: "Yes! Configured for APA 7th edition and MLA 9th edition standards.",
      },
    ],
  },
  {
    id: "gpa-calculator",
    name: "GPA / CGPA Calculator",
    slug: "gpa-calculator",
    href: "/gpa-calculator",
    category: "academic",
    shortDesc: "Calculate semester GPA and cumulative CGPA with credit weighting.",
    description:
      "Plan your semester grades, calculate honors eligibility, and project your cumulative CGPA with customizable credit hours and letter grade scales.",
    iconName: "Calculator",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["gpa calculator", "cgpa calculator", "college gpa", "semester gpa", "grade point average"],
    features: [
      "Standard 4.0 scale with support for A+, A, A-, B+, B, B-, C+, C, C-, D, F",
      "Weighted credit hours per course",
      "Cumulative CGPA projector: input prior credits and target GPA",
      "Save semesters locally in your browser storage",
    ],
    steps: [
      { step: 1, title: "Add Courses", desc: "Enter course names, letter grades, and credit hours." },
      { step: 2, title: "Add Prior GPA", desc: "Optionally add prior cumulative GPA and total completed credits." },
      { step: 3, title: "View Results", desc: "Instant GPA score, honors standing, and credit tally." },
    ],
    faqs: [
      {
        q: "What scale is used?",
        a: "Standard American 4.0 scale (A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, D=1.0, F=0.0).",
      },
    ],
  },
  {
    id: "unit-converter",
    name: "Engineering & Science Unit Converter",
    slug: "unit-converter",
    href: "/unit-converter",
    category: "academic",
    shortDesc: "Fast unit conversions for physics, engineering, chemistry, and CS students.",
    description:
      "Convert length, mass/weight, temperature, data storage, speed, pressure, energy, and area units with precision.",
    iconName: "Scale",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["unit converter", "physics converter", "engineering units", "bytes to gb", "metric to imperial"],
    features: [
      "Categories: Length, Mass, Temperature, Data (Bytes/KB/MB/GB/TB), Speed, Area, Volume",
      "Simultaneous conversion table showing all related units at once",
      "High precision formula calculations without rounding glitches",
    ],
    steps: [
      { step: 1, title: "Select Category", desc: "Choose Length, Weight, Data, Temperature, etc." },
      { step: 2, title: "Input Value", desc: "Type your number and select your source unit." },
      { step: 3, title: "View All Conversions", desc: "Instant calculated equivalents across all units." },
    ],
    faqs: [
      {
        q: "Does data conversion use decimal (1000) or binary (1024) multipliers?",
        a: "Binary (1024) standard for RAM/Storage (1 KB = 1024 Bytes) with standard engineering definitions.",
      },
    ],
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    slug: "image-compressor",
    href: "/image-compressor",
    category: "academic",
    shortDesc: "Compress and resize JPG, PNG, and WebP images client-side without quality loss.",
    description:
      "Compress presentation slides, project photos, and avatar images directly in your browser. Adjust quality and dimension scaling with instant before/after preview.",
    iconName: "Minimize",
    badge: "100% In-Browser",
    badgeType: "in-browser",
    isClientOnly: true,
    tags: ["image compressor", "shrink image", "compress jpg", "compress png", "resize photo"],
    features: [
      "Adjustable quality slider (10% to 100%)",
      "Optional max dimension resizing (e.g. 1920px, 1280px, 800px)",
      "Displays exact original size vs compressed size and % saved",
      "Batch mode with ZIP download",
    ],
    steps: [
      { step: 1, title: "Upload Images", desc: "Drop one or multiple image files." },
      { step: 2, title: "Adjust Quality", desc: "Slide quality bar and preview file size reduction." },
      { step: 3, title: "Download", desc: "Download individual compressed images or all in a ZIP." },
    ],
    faqs: [
      {
        q: "Does compression happen on a server?",
        a: "No! Compression uses the HTML5 Canvas API in your browser. No image data is ever uploaded.",
      },
    ],
  },
];
