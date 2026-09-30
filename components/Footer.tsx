import Link from "next/link";
import { GraduationCap, ShieldCheck, Zap, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">StudentToolkit</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The free, student-first utility hub. No sign-ups, no tracking, and no paywalls. Built to empower students across the globe.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Privacy</span>
            </div>
          </div>

          {/* Column 1: PDF Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              PDF Utilities
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/pdf-merge" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-split" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-organize" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Organize & Rotate PDF
                </Link>
              </li>
              <li>
                <Link href="/image-to-pdf" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Images to PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-compress" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-page-numbers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Add Page Numbers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Document Converters & QR */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Converters & QR
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/qr" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  QR Code Generator (Bulk ZIP)
                </Link>
              </li>
              <li>
                <Link href="/word-to-pdf" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Word to PDF (.docx)
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-word" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link href="/pages-to-pdf" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Apple Pages to PDF
                </Link>
              </li>
              <li>
                <Link href="/pages-guide" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Apple Pages Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Tools & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Student Tools & Trust
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/citation-generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Citation Generator (APA/MLA)
                </Link>
              </li>
              <li>
                <Link href="/gpa-calculator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  GPA / CGPA Calculator
                </Link>
              </li>
              <li>
                <Link href="/word-counter" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Word & Character Counter
                </Link>
              </li>
              <li>
                <Link href="/unit-converter" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Engineering Unit Converter
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy & Ethics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for college & university students worldwide.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy First
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span>·</span>
            <span>Deploy target: Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
