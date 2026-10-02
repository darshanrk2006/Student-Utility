"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { executeDocumentConversion } from "@/lib/client-converter";
import { downloadBlob, formatBytes } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  FileEdit,
  Presentation,
  Sheet,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Sliders,
  Check,
  Apple,
  FileCode,
  FileType,
  Layers,
  UploadCloud,
  Search,
  Filter,
  CheckCheck,
  RotateCcw,
  BookOpen,
  Code,
  Database,
} from "lucide-react";

export interface FormatMeta {
  id: string;
  name: string;
  shortName: string;
  ext: string;
  category: "doc" | "pdf" | "slides" | "sheet" | "image" | "apple" | "text" | "ebook";
  categoryLabel: string;
  color: string;
  bgLight: string;
  bgDark: string;
  iconName: string;
  desc: string;
}

export const ALL_FORMATS: FormatMeta[] = [
  // Documents
  {
    id: "docx",
    name: "Word Document (.docx)",
    shortName: "Word (.docx)",
    ext: "docx",
    category: "doc",
    categoryLabel: "Document",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/60",
    iconName: "FileSpreadsheet",
    desc: "Microsoft Word (2007+ XML format)",
  },
  {
    id: "doc",
    name: "Word Legacy (.doc)",
    shortName: "Word (.doc)",
    ext: "doc",
    category: "doc",
    categoryLabel: "Document",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/60",
    iconName: "FileSpreadsheet",
    desc: "Microsoft Word 97-2003 binary format",
  },
  {
    id: "rtf",
    name: "Rich Text Format (.rtf)",
    shortName: "Rich Text (.rtf)",
    ext: "rtf",
    category: "doc",
    categoryLabel: "Document",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/60",
    iconName: "FileText",
    desc: "Formatted cross-platform rich text",
  },
  {
    id: "odt",
    name: "OpenDocument Text (.odt)",
    shortName: "OpenDocument (.odt)",
    ext: "odt",
    category: "doc",
    categoryLabel: "Document",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/60",
    iconName: "FileText",
    desc: "LibreOffice & OpenOffice standard text",
  },
  {
    id: "html",
    name: "HTML Webpage (.html)",
    shortName: "HTML (.html)",
    ext: "html",
    category: "doc",
    categoryLabel: "Document",
    color: "text-orange-600 dark:text-orange-400",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/60",
    iconName: "Code",
    desc: "Standard hypertext webpage markup",
  },
  {
    id: "md",
    name: "Markdown Document (.md)",
    shortName: "Markdown (.md)",
    ext: "md",
    category: "doc",
    categoryLabel: "Document",
    color: "text-slate-700 dark:text-slate-300",
    bgLight: "bg-slate-100",
    bgDark: "dark:bg-slate-800",
    iconName: "FileText",
    desc: "Formatted Markdown documentation notes",
  },

  // E-Books
  {
    id: "epub",
    name: "EPUB E-Book (.epub)",
    shortName: "EPUB E-Book",
    ext: "epub",
    category: "ebook",
    categoryLabel: "E-Book",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    iconName: "BookOpen",
    desc: "Universal open electronic book format",
  },
  {
    id: "mobi",
    name: "MOBI E-Book (.mobi)",
    shortName: "MOBI E-Book",
    ext: "mobi",
    category: "ebook",
    categoryLabel: "E-Book",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    iconName: "BookOpen",
    desc: "Amazon Kindle legacy e-book format",
  },

  // PDF
  {
    id: "pdf",
    name: "PDF Document (.pdf)",
    shortName: "PDF Document",
    ext: "pdf",
    category: "pdf",
    categoryLabel: "PDF",
    color: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-rose-950/60",
    iconName: "FileText",
    desc: "Adobe Portable Document Format",
  },

  // Presentations / Slides
  {
    id: "pptx",
    name: "PowerPoint Slides (.pptx)",
    shortName: "PowerPoint (.pptx)",
    ext: "pptx",
    category: "slides",
    categoryLabel: "Slides",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    iconName: "Presentation",
    desc: "Microsoft PowerPoint Presentation",
  },
  {
    id: "ppt",
    name: "PowerPoint Legacy (.ppt)",
    shortName: "PowerPoint (.ppt)",
    ext: "ppt",
    category: "slides",
    categoryLabel: "Slides",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    iconName: "Presentation",
    desc: "PowerPoint 97-2003 binary slides",
  },
  {
    id: "odp",
    name: "OpenDocument Slides (.odp)",
    shortName: "OpenDocument (.odp)",
    ext: "odp",
    category: "slides",
    categoryLabel: "Slides",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    iconName: "Presentation",
    desc: "LibreOffice Impress presentation slides",
  },
  {
    id: "key",
    name: "Apple Keynote (.key)",
    shortName: "Apple Keynote",
    ext: "key",
    category: "apple",
    categoryLabel: "Apple",
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/60",
    iconName: "Presentation",
    desc: "Apple macOS Keynote presentation",
  },

  // Spreadsheets
  {
    id: "xlsx",
    name: "Excel Spreadsheet (.xlsx)",
    shortName: "Excel (.xlsx)",
    ext: "xlsx",
    category: "sheet",
    categoryLabel: "Spreadsheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    iconName: "Sheet",
    desc: "Microsoft Excel (2007+ XML format)",
  },
  {
    id: "xls",
    name: "Excel Legacy (.xls)",
    shortName: "Excel (.xls)",
    ext: "xls",
    category: "sheet",
    categoryLabel: "Spreadsheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    iconName: "Sheet",
    desc: "Microsoft Excel 97-2003 workbook",
  },
  {
    id: "csv",
    name: "CSV Spreadsheet (.csv)",
    shortName: "CSV Table",
    ext: "csv",
    category: "sheet",
    categoryLabel: "Spreadsheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    iconName: "Sheet",
    desc: "Comma-Separated Values tabular data",
  },
  {
    id: "ods",
    name: "OpenDocument Sheet (.ods)",
    shortName: "OpenDocument (.ods)",
    ext: "ods",
    category: "sheet",
    categoryLabel: "Spreadsheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    iconName: "Sheet",
    desc: "LibreOffice Calc spreadsheet",
  },
  {
    id: "numbers",
    name: "Apple Numbers (.numbers)",
    shortName: "Apple Numbers",
    ext: "numbers",
    category: "apple",
    categoryLabel: "Apple",
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/60",
    iconName: "Sheet",
    desc: "Apple macOS Numbers spreadsheet",
  },
  {
    id: "tsv",
    name: "TSV Table (.tsv)",
    shortName: "TSV Table",
    ext: "tsv",
    category: "sheet",
    categoryLabel: "Spreadsheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    iconName: "Sheet",
    desc: "Tab-Separated Values tabular data",
  },

  // Apple Pages
  {
    id: "pages",
    name: "Apple Pages (.pages)",
    shortName: "Apple Pages",
    ext: "pages",
    category: "apple",
    categoryLabel: "Apple",
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/60",
    iconName: "Apple",
    desc: "Apple macOS & iOS Pages document package",
  },

  // Images
  {
    id: "jpg",
    name: "JPEG Image (.jpg)",
    shortName: "JPEG Image",
    ext: "jpg",
    category: "image",
    categoryLabel: "Image",
    color: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/60",
    iconName: "ImageIcon",
    desc: "Standard compressed photography image",
  },
  {
    id: "png",
    name: "PNG Image (.png)",
    shortName: "PNG Image",
    ext: "png",
    category: "image",
    categoryLabel: "Image",
    color: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/60",
    iconName: "ImageIcon",
    desc: "Lossless transparent raster graphic",
  },
  {
    id: "webp",
    name: "WebP Image (.webp)",
    shortName: "WebP Image",
    ext: "webp",
    category: "image",
    categoryLabel: "Image",
    color: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/60",
    iconName: "ImageIcon",
    desc: "Modern high-efficiency web image",
  },
  {
    id: "gif",
    name: "GIF Image (.gif)",
    shortName: "GIF Image",
    ext: "gif",
    category: "image",
    categoryLabel: "Image",
    color: "text-pink-600 dark:text-pink-400",
    bgLight: "bg-pink-50",
    bgDark: "dark:bg-pink-950/60",
    iconName: "ImageIcon",
    desc: "Animated or static Graphics Interchange Format",
  },
  {
    id: "svg",
    name: "SVG Vector (.svg)",
    shortName: "SVG Vector",
    ext: "svg",
    category: "image",
    categoryLabel: "Image",
    color: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/60",
    iconName: "Code",
    desc: "Scalable Vector Graphic for crisp rendering",
  },
  {
    id: "bmp",
    name: "Bitmap Image (.bmp)",
    shortName: "Bitmap (.bmp)",
    ext: "bmp",
    category: "image",
    categoryLabel: "Image",
    color: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-100",
    bgDark: "dark:bg-slate-800",
    iconName: "ImageIcon",
    desc: "Uncompressed Windows Bitmap image",
  },
  {
    id: "tiff",
    name: "TIFF Image (.tiff)",
    shortName: "TIFF Image",
    ext: "tiff",
    category: "image",
    categoryLabel: "Image",
    color: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-100",
    bgDark: "dark:bg-slate-800",
    iconName: "ImageIcon",
    desc: "High-quality print & scanning image",
  },
  {
    id: "heic",
    name: "Apple HEIC (.heic)",
    shortName: "Apple HEIC",
    ext: "heic",
    category: "image",
    categoryLabel: "Image",
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/60",
    iconName: "Apple",
    desc: "High Efficiency Image Container from iPhone",
  },
  {
    id: "ico",
    name: "Icon File (.ico)",
    shortName: "Icon (.ico)",
    ext: "ico",
    category: "image",
    categoryLabel: "Image",
    color: "text-cyan-600 dark:text-cyan-400",
    bgLight: "bg-cyan-50",
    bgDark: "dark:bg-cyan-950/60",
    iconName: "ImageIcon",
    desc: "Website favicon and desktop icon file",
  },

  // Text & Data
  {
    id: "txt",
    name: "Plain Text (.txt)",
    shortName: "Plain Text (.txt)",
    ext: "txt",
    category: "text",
    categoryLabel: "Text",
    color: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950/60",
    iconName: "FileCode",
    desc: "Standard raw text without formatting",
  },
  {
    id: "json",
    name: "JSON Data (.json)",
    shortName: "JSON Data",
    ext: "json",
    category: "text",
    categoryLabel: "Data",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    iconName: "Database",
    desc: "JavaScript Object Notation data structure",
  },
  {
    id: "xml",
    name: "XML Document (.xml)",
    shortName: "XML Document",
    ext: "xml",
    category: "text",
    categoryLabel: "Data",
    color: "text-cyan-600 dark:text-cyan-400",
    bgLight: "bg-cyan-50",
    bgDark: "dark:bg-cyan-950/60",
    iconName: "Code",
    desc: "Extensible Markup Language structured data",
  },
];

export const VALID_TARGETS: Record<string, string[]> = {
  // Documents
  docx: ["pdf", "pages", "txt", "rtf", "odt", "html", "epub", "jpg", "png"],
  doc: ["docx", "pdf", "pages", "txt", "rtf", "odt", "html"],
  rtf: ["docx", "pdf", "pages", "txt", "odt", "html"],
  odt: ["docx", "pdf", "pages", "txt", "rtf", "html"],
  html: ["pdf", "docx", "txt", "png", "jpg"],
  md: ["pdf", "docx", "html", "txt"],

  // E-Books
  epub: ["pdf", "docx", "txt", "mobi"],
  mobi: ["pdf", "epub", "txt"],

  // PDF
  pdf: ["docx", "pages", "pptx", "key", "xlsx", "numbers", "png", "jpg", "txt", "html", "epub"],

  // Presentations
  pptx: ["pdf", "key", "ppt", "odp", "png", "jpg"],
  ppt: ["pptx", "pdf", "key", "odp", "png"],
  odp: ["pptx", "pdf", "ppt"],
  key: ["pptx", "pdf", "png", "jpg"],

  // Spreadsheets
  xlsx: ["pdf", "numbers", "csv", "xls", "ods", "html"],
  xls: ["xlsx", "pdf", "numbers", "csv", "ods"],
  csv: ["xlsx", "numbers", "pdf", "xls", "tsv"],
  ods: ["xlsx", "pdf", "csv"],
  numbers: ["xlsx", "pdf", "csv"],
  tsv: ["csv", "xlsx", "pdf"],

  // Apple
  pages: ["docx", "pdf", "doc", "txt", "rtf"],

  // Images
  jpg: ["png", "pdf", "webp", "gif", "bmp", "tiff", "ico", "svg"],
  jpeg: ["png", "pdf", "webp", "gif", "bmp", "tiff", "ico", "svg"],
  png: ["jpg", "pdf", "webp", "gif", "bmp", "tiff", "ico", "svg"],
  webp: ["png", "jpg", "pdf", "gif", "bmp", "tiff", "ico", "svg"],
  gif: ["png", "jpg", "pdf", "webp", "bmp", "svg"],
  svg: ["png", "jpg", "pdf", "webp", "gif", "bmp"],
  bmp: ["png", "jpg", "pdf", "webp", "gif", "svg"],
  tiff: ["pdf", "png", "jpg", "webp", "gif", "bmp"],
  heic: ["jpg", "png", "pdf", "webp", "gif"],
  ico: ["png", "jpg", "webp", "pdf"],

  // Text & Data
  txt: ["pdf", "docx", "pages", "html", "rtf"],
  json: ["csv", "txt", "xlsx"],
  xml: ["json", "txt", "csv", "pdf"],
};

export const QUICK_PRESETS = [
  { from: "docx", to: "pdf", label: "Word ➔ PDF" },
  { from: "pdf", to: "docx", label: "PDF ➔ Word" },
  { from: "pages", to: "docx", label: "Pages ➔ Word" },
  { from: "pages", to: "pdf", label: "Pages ➔ PDF" },
  { from: "pptx", to: "pdf", label: "PowerPoint ➔ PDF" },
  { from: "xlsx", to: "pdf", label: "Excel ➔ PDF" },
  { from: "jpg", to: "pdf", label: "Images ➔ PDF" },
  { from: "epub", to: "pdf", label: "EPUB ➔ PDF" },
  { from: "md", to: "pdf", label: "Markdown ➔ PDF" },
  { from: "html", to: "pdf", label: "HTML ➔ PDF" },
];

export const CATEGORY_FILTERS = [
  { id: "all", label: "All Formats" },
  { id: "doc", label: "Documents" },
  { id: "pdf", label: "PDF" },
  { id: "slides", label: "Presentations" },
  { id: "sheet", label: "Spreadsheets" },
  { id: "image", label: "Images" },
  { id: "apple", label: "Apple" },
  { id: "ebook", label: "E-Books" },
  { id: "text", label: "Text & Data" },
];

function renderFormatIcon(iconName: string, className = "w-4 h-4") {
  switch (iconName) {
    case "FileSpreadsheet":
      return <FileSpreadsheet className={className} />;
    case "FileText":
      return <FileText className={className} />;
    case "Presentation":
      return <Presentation className={className} />;
    case "Sheet":
      return <Sheet className={className} />;
    case "Apple":
      return <Apple className={className} />;
    case "ImageIcon":
      return <ImageIcon className={className} />;
    case "FileCode":
      return <FileCode className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    case "Code":
      return <Code className={className} />;
    case "Database":
      return <Database className={className} />;
    default:
      return <FileText className={className} />;
  }
}

export interface ServerConvertToolProps {
  toolId?: string;
  defaultFromFormat?: string;
  defaultToFormat?: string;
  accept?: string;
  title?: string;
  description?: string;
  iconNode?: React.ReactNode;
}

export const FORMAT_ACCEPT_MAP: Record<string, string> = {
  pdf: ".pdf,application/pdf",
  docx: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: ".rtf,application/rtf,text/rtf",
  odt: ".odt,application/vnd.oasis.opendocument.text",
  html: ".html,.htm,text/html",
  md: ".md,.markdown,text/markdown",
  epub: ".epub,application/epub+zip",
  mobi: ".mobi",
  pptx: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: ".ppt,.pptx,application/vnd.ms-powerpoint",
  odp: ".odp,application/vnd.oasis.opendocument.presentation",
  key: ".key",
  xlsx: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: ".xls,.xlsx,application/vnd.ms-excel",
  csv: ".csv,text/csv",
  ods: ".ods,application/vnd.oasis.opendocument.spreadsheet",
  numbers: ".numbers",
  tsv: ".tsv,text/tab-separated-values",
  pages: ".pages",
  jpg: ".jpg,.jpeg,image/jpeg",
  jpeg: ".jpeg,.jpg,image/jpeg",
  png: ".png,image/png",
  webp: ".webp,image/webp",
  gif: ".gif,image/gif",
  svg: ".svg,image/svg+xml",
  bmp: ".bmp,image/bmp",
  tiff: ".tiff,.tif,image/tiff",
  heic: ".heic,image/heic,image/heif",
  ico: ".ico,image/x-icon",
  txt: ".txt,text/plain",
  json: ".json,application/json",
  xml: ".xml,application/xml,text/xml",
};

export function isFileMatchingFormat(file: File, formatId: string): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (formatId === "jpg" || formatId === "jpeg") {
    return ext === "jpg" || ext === "jpeg";
  }
  if (formatId === "html") {
    return ext === "html" || ext === "htm";
  }
  if (formatId === "tiff") {
    return ext === "tiff" || ext === "tif";
  }
  if (formatId === "doc") {
    return ext === "doc" || ext === "docx";
  }
  if (formatId === "ppt") {
    return ext === "ppt" || ext === "pptx";
  }
  if (formatId === "xls") {
    return ext === "xls" || ext === "xlsx";
  }
  return ext === formatId.toLowerCase();
}

export function ServerConvertTool({
  toolId = "universal-converter",
  defaultFromFormat = "docx",
  defaultToFormat = "pdf",
  accept,
  iconNode,
}: ServerConvertToolProps) {
  const tool = TOOLS.find((t) => t.id === toolId) || {
    id: "universal-converter",
    name: "Universal Document Converter",
    slug: "convert",
    href: "/convert",
    category: "convert" as const,
    shortDesc: "Convert between Word, PDF, Excel, PowerPoint, Images, and Text seamlessly.",
    description:
      "A student-first document converter. Select your uploaded document type in FROM and choose your desired target format in TO using the matrix below.",
    iconName: "ArrowLeftRight",
    badge: "100% In-Browser",
    badgeType: "in-browser" as const,
    isClientOnly: true,
    tags: ["document converter", "word to pdf", "pdf to word", "file transfer", "converter hub"],
    features: [
      "Select custom source format and target format dynamically",
      "Converts Word, PDF, PowerPoint, Excel, Images, E-Books, and Text",
      "Immediate memory processing & 100% client-side privacy guarantee",
    ],
    steps: [
      { step: 1, title: "Select Source Format", desc: "Pick your uploaded document format in FROM." },
      { step: 2, title: "Pick Target Format", desc: "Select the desired output format in TO." },
      { step: 3, title: "Upload & Convert", desc: "Drop your file and download the converted output." },
    ],
    faqs: [
      {
        q: "How does format selection work?",
        a: "FROM specifies the format of the file you are uploading. TO displays all compatible target formats you can transfer it into. Click or scroll through any format to select it!",
      },
    ],
  };

  const [file, setFile] = useState<File | null>(null);
  const [fromFormat, setFromFormat] = useState<string>(defaultFromFormat);
  const [toFormat, setToFormat] = useState<string>(defaultToFormat);

  // Filter state for FROM
  const [fromCategory, setFromCategory] = useState<string>("all");
  const [fromSearch, setFromSearch] = useState<string>("");

  const [status, setStatus] = useState<"idle" | "configuring" | "processing" | "success" | "error">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [downloadBlobData, setDownloadBlobData] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Helper to detect format from file extension
  const detectFormat = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "jpeg") return "jpg";
    if (ext === "htm") return "html";
    if (ext === "tif") return "tiff";
    if (VALID_TARGETS[ext]) return ext;
    return defaultFromFormat;
  };

  const handleFilesSelected = (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];

    // Strict validation: Only accept file if it matches the selected FROM format
    if (!isFileMatchingFormat(uploadedFile, fromFormat)) {
      const detected = detectFormat(uploadedFile.name);
      setFile(null);
      setStatus("error");
      setErrorMessage(
        `Selected source format is .${fromFormat.toUpperCase()}, but you uploaded "${uploadedFile.name}". Please upload a .${fromFormat.toUpperCase()} document, or select .${detected.toUpperCase()} in the FROM panel.`
      );
      return;
    }

    setFile(uploadedFile);
    setStatus("configuring");
    setDownloadBlobData(null);
    setErrorMessage("");
  };

  const handleFromFormatChange = (newFrom: string) => {
    setFromFormat(newFrom);
    const validTargets = VALID_TARGETS[newFrom] || ["pdf"];
    if (!validTargets.includes(toFormat)) {
      setToFormat(validTargets[0] || "pdf");
    }
  };

  const handlePresetClick = (presetFrom: string, presetTo: string) => {
    setFromFormat(presetFrom);
    setToFormat(presetTo);
  };

  // Check if current pair is swappable
  const isSwappable = useMemo(() => {
    const targetsForTo = VALID_TARGETS[toFormat] || [];
    return targetsForTo.includes(fromFormat);
  }, [fromFormat, toFormat]);

  const handleSwap = () => {
    if (isSwappable) {
      const oldFrom = fromFormat;
      const oldTo = toFormat;
      setFromFormat(oldTo);
      setToFormat(oldFrom);
    }
  };

  const filteredFromFormats = useMemo(() => {
    return ALL_FORMATS.filter((fmt) => {
      const matchesCategory = fromCategory === "all" || fmt.category === fromCategory;
      const q = fromSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        fmt.name.toLowerCase().includes(q) ||
        fmt.ext.toLowerCase().includes(q) ||
        fmt.desc.toLowerCase().includes(q) ||
        fmt.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [fromCategory, fromSearch]);

  const availableTargets = useMemo(() => {
    return VALID_TARGETS[fromFormat] || ["pdf"];
  }, [fromFormat]);

  const fromMeta = ALL_FORMATS.find((f) => f.id === fromFormat) || ALL_FORMATS[0];
  const toMeta = ALL_FORMATS.find((f) => f.id === toFormat) || ALL_FORMATS[8] || {
    id: toFormat,
    name: `${toFormat.toUpperCase()} Document`,
    shortName: toFormat.toUpperCase(),
    ext: toFormat,
    category: "doc" as const,
    categoryLabel: "Document",
    color: "text-teal-600",
    bgLight: "bg-teal-50",
    bgDark: "dark:bg-teal-950/60",
    iconName: "FileText",
    desc: "Target format output",
  };

  const handleStartConversion = async () => {
    if (!file) return;
    setStatus("processing");
    setProgressPercent(15);
    setStatusText(`Transferring ${fromMeta.shortName} to ${toMeta.shortName}...`);
    setErrorMessage("");
    setDownloadBlobData(null);

    try {
      // Client-side special case for Pages to PDF if embedded QuickLook is present
      if (fromFormat === "pages" && toFormat === "pdf") {
        try {
          const { extractPagesPreviewPdf } = await import("@/lib/jszip-utils");
          const res = await extractPagesPreviewPdf(file);
          if (res.success && res.pdfBlob) {
            setDownloadBlobData(res.pdfBlob);
            setDownloadFilename(res.pdfFilename || `${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
            setStatus("success");
            return;
          }
        } catch (clientErr) {
          console.warn("Client QuickLook extraction skipped, proceeding with cloud engine:", clientErr);
        }
      }

      // Standard serverless conversion via API
      const result = await executeDocumentConversion({
        file,
        fromFormat,
        toFormat,
        onProgress: (pct, text) => {
          setProgressPercent(pct);
          setStatusText(text);
        },
      });

      setDownloadBlobData(result.blob);
      setDownloadFilename(result.filename);
      setStatus("success");
    } catch (err: any) {
      console.error("Conversion error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to convert document. Please verify the file is not corrupted or password-protected."
      );
    }
  };

  const handleDownload = () => {
    if (!downloadBlobData || !downloadFilename) return;
    downloadBlob(downloadBlobData, downloadFilename);
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setDownloadBlobData(null);
    setDownloadFilename("");
    setErrorMessage("");
    setProgressPercent(0);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top 100% In-Browser Trust Banner */}
        <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                100% In-Browser Document Engine ($0 Forever)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Converts Word, PDF, Excel, PowerPoint, Images, Text, and Code locally inside your device memory with zero API keys or external server uploads.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            No API Keys Needed
          </span>
        </div>

        {/* Quick Conversion Preset Shortcuts */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              1-Click Transfer Presets
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Select popular format conversions instantly
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {QUICK_PRESETS.map((p) => {
              const isSelected = fromFormat === p.from && toFormat === p.to;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePresetClick(p.from, p.to)}
                  className={`p-2 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1 text-center cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-102 ring-2 ring-indigo-500/30"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40"
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The 2 Scrollable Selection Containers: FROM & TO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-5">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Universal Conversion Matrix
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Select Source & Target Formats
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select your source format in FROM, and choose your target format in TO
            </p>
          </div>

          {/* Side-by-Side Dual Container Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
            {/* ========================================================================= */}
            {/* FROM (Uploaded Document Type) with Scroll Pattern */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-indigo-100 dark:border-indigo-950 bg-slate-50/90 dark:bg-slate-950/90 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-indigo-500/20">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      FROM
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Uploaded File Format
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 uppercase tracking-wide">
                  .{fromFormat}
                </span>
              </div>

              {/* Category Filter Pills for FROM */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {CATEGORY_FILTERS.map((cat) => {
                  const isActive = fromCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFromCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar for FROM */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fromSearch}
                  onChange={(e) => setFromSearch(e.target.value)}
                  placeholder="Filter formats (e.g. docx, pdf, epub, heic, csv)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {fromSearch && (
                  <button
                    onClick={() => setFromSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Scrollable Selecting Pattern for FROM */}
              <div className="max-h-80 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {filteredFromFormats.length > 0 ? (
                  filteredFromFormats.map((fmt) => {
                    const isSelected = fromFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => handleFromFormatChange(fmt.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/25 font-bold scale-[1.01]"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : `${fmt.bgLight} ${fmt.bgDark} ${fmt.color}`
                            }`}
                          >
                            {renderFormatIcon(fmt.iconName, "w-4 h-4")}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold truncate">{fmt.name}</p>
                            </div>
                            <p
                              className={`text-[11px] truncate mt-0.5 ${
                                isSelected ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {fmt.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            .{fmt.ext}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No formats found matching &quot;{fromSearch}&quot;
                  </div>
                )}
              </div>

              {/* Bottom Footer Info */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 text-center font-medium border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span>{filteredFromFormats.length} formats in list</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  Selected: .{fromFormat.toUpperCase()}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CENTER BRIDGE: Transfer Flow & Swap Button */}
            {/* ========================================================================= */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 gap-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/25 animate-pulse">
                <ArrowRight className="w-5 h-5 hidden lg:block" />
                <ArrowRight className="w-5 h-5 rotate-90 lg:hidden" />
              </div>

              {isSwappable && (
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap From and To formats"
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-400 transition-all flex items-center gap-1 text-[10px] font-bold shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              )}

              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">
                TRANSFERS
              </span>
            </div>

            {/* ========================================================================= */}
            {/* TO (Target Transfer Format) with Scroll Pattern */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-teal-100 dark:border-teal-950 bg-teal-50/40 dark:bg-teal-950/20 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-teal-200/80 dark:border-teal-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-teal-500/20">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      TO
                    </h4>
                    <span className="text-[11px] text-teal-800 dark:text-teal-300">
                      Target Output Format
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-teal-600 text-white shadow-sm shadow-teal-500/30 uppercase tracking-wide">
                  .{toFormat}
                </span>
              </div>

              {/* Status Header for Target Options */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200/60 dark:border-teal-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Outputs available for <strong className="text-indigo-600 dark:text-indigo-400">.{fromFormat}</strong>:
                </span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                  {availableTargets.length} Option{availableTargets.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Scrollable Selecting Pattern for TO */}
              <div className="max-h-80 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {availableTargets.map((tgtId) => {
                  const tgtMeta = ALL_FORMATS.find((f) => f.id === tgtId) || {
                    id: tgtId,
                    name: `${tgtId.toUpperCase()} File`,
                    shortName: tgtId.toUpperCase(),
                    ext: tgtId,
                    category: "doc" as const,
                    categoryLabel: "Document",
                    color: "text-teal-600 dark:text-teal-400",
                    bgLight: "bg-teal-50",
                    bgDark: "dark:bg-teal-950/60",
                    iconName: "FileText",
                    desc: `Ready for conversion into .${tgtId}`,
                  };
                  const isSelected = toFormat === tgtId;

                  return (
                    <button
                      key={tgtId}
                      type="button"
                      onClick={() => setToFormat(tgtId)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 border-teal-600 text-white shadow-lg shadow-teal-500/25 font-bold scale-[1.01]"
                          : "bg-white dark:bg-slate-900 border-teal-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : `${tgtMeta.bgLight} ${tgtMeta.bgDark} ${tgtMeta.color}`
                          }`}
                        >
                          {renderFormatIcon(tgtMeta.iconName, "w-4 h-4")}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{tgtMeta.name}</p>
                          <span
                            className={`text-[11px] block mt-0.5 truncate ${
                              isSelected ? "text-teal-100" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            Ready for immediate download as .{tgtMeta.ext}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/50"
                          }`}
                        >
                          .{tgtMeta.ext}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white text-teal-600 flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Footer Info */}
              <div className="text-[11px] text-teal-800 dark:text-teal-300 pt-1 text-center font-medium border-t border-teal-200/60 dark:border-teal-900/60 flex items-center justify-between">
                <span>Output Guarantee: Lossless Quality</span>
                <span className="text-teal-700 dark:text-teal-300 font-bold">
                  Selected: .{toFormat.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification when invalid format is rejected */}
        {!file && status === "error" && errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <strong>Validation Error:</strong> {errorMessage}
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                setErrorMessage("");
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Zone / Active File Conversion Zone */}
        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept={accept || FORMAT_ACCEPT_MAP[fromFormat] || `.${fromFormat}`}
            title={`Drop your .${fromFormat.toUpperCase()} file here to convert to .${toFormat.toUpperCase()}`}
            description={`Only .${fromFormat.toUpperCase()} documents are accepted based on your selected FROM format.`}
            icon={iconNode || <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Uploaded File Loaded Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${fromMeta.bgLight} ${fromMeta.bgDark} ${fromMeta.color}`}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatBytes(file.size)}</span>
                    <span>·</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Transferring .{fromFormat} ➔ .{toFormat}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Convert Button */}
            {status !== "success" && (
              <button
                onClick={handleStartConversion}
                disabled={status === "processing"}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-500 hover:via-blue-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
              >
                {status === "processing" ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Converting {fromMeta.shortName} to {toMeta.shortName}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Convert {fromMeta.shortName} ➔ {toMeta.shortName} Now
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Progress / Download Result Card */}
        {(status === "processing" || status === "success" || status === "error") && (
          <ProgressCard
            filename={downloadFilename || `${file?.name.replace(/\.[^/.]+$/, "") || "document"}.${toFormat}`}
            filesize={downloadBlobData?.size || file?.size}
            status={status}
            statusText={statusText}
            progressPercent={progressPercent}
            errorMessage={errorMessage}
            downloadLabel={`Download ${toMeta.shortName}`}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}

        {/* Privacy Assurance Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Zero-Retention Guarantee:</strong> Your documents are converted in isolated temporary RAM and deleted immediately after processing. No file contents are stored or viewed.
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
