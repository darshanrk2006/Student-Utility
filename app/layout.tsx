import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://studenttoolkit.vercel.app"),
  title: {
    default: "StudentToolkit — Free, No-Login Utility Hub for Students",
    template: "%s | StudentToolkit",
  },
  description:
    "Free, 100% no-login utility tools for college students. Merge/split PDFs, generate QR codes, convert Word/PPT/Excel to PDF, extract Apple Pages, calculate GPA, format citations, and compress files securely.",
  keywords: [
    "student tools",
    "pdf merge free",
    "pdf split",
    "qr code generator bulk",
    "word to pdf",
    "apple pages to pdf",
    "gpa calculator college",
    "citation generator apa mla",
    "no login tools",
    "privacy pdf tools",
  ],
  authors: [{ name: "StudentToolkit Team" }],
  creator: "StudentToolkit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studenttoolkit.vercel.app",
    title: "StudentToolkit — Free, No-Login Utility Hub for Students",
    description:
      "All-in-one free student utilities: PDF tools, QR generator, Word converters, Apple Pages preview extractor, GPA calculator & citations. Fast, mobile-first, and private.",
    siteName: "StudentToolkit",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentToolkit — Free No-Login Utility Hub for Students",
    description: "Free in-browser PDF tools, QR generator, Word converters, Apple Pages extractor, and GPA calculator.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "StudentToolkit",
              url: "https://studenttoolkit.vercel.app",
              description:
                "Free, privacy-friendly online utility tools for college students including PDF manipulation, QR codes, document conversion, GPA calculation, and citations.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
