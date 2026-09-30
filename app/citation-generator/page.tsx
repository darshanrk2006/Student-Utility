"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import { Quote, Copy, Check, Sparkles, Book, Globe, FileText, Plus, Trash2 } from "lucide-react";

type StyleType = "apa" | "mla" | "chicago" | "harvard" | "bibtex";
type SourceType = "website" | "book" | "journal";

interface CitationFields {
  authors: { firstName: string; lastName: string }[];
  title: string;
  containerTitle: string; // Website name, Book title, or Journal name
  year: string;
  publisher: string;
  volume: string;
  issue: string;
  pages: string;
  url: string;
  doi: string;
  accessDate: string;
}

export default function CitationGeneratorPage() {
  const tool = TOOLS.find((t) => t.id === "citation-generator")!;
  const [style, setStyle] = useState<StyleType>("apa");
  const [sourceType, setSourceType] = useState<SourceType>("website");
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);

  const [fields, setFields] = useState<CitationFields>({
    authors: [{ firstName: "John", lastName: "Smith" }],
    title: "Understanding Modern Machine Learning in Higher Education",
    containerTitle: "Journal of Educational Technology",
    year: "2024",
    publisher: "Academic Press",
    volume: "18",
    issue: "3",
    pages: "145-160",
    url: "https://example.edu/articles/ml-edu",
    doi: "10.1016/j.cedpsych.2024.102290",
    accessDate: new Date().toISOString().split("T")[0],
  });

  const handleAuthorChange = (index: number, key: "firstName" | "lastName", val: string) => {
    setFields((prev) => {
      const copy = [...prev.authors];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, authors: copy };
    });
  };

  const handleAddAuthor = () => {
    setFields((prev) => ({
      ...prev,
      authors: [...prev.authors, { firstName: "", lastName: "" }],
    }));
  };

  const handleRemoveAuthor = (index: number) => {
    if (fields.authors.length <= 1) return;
    setFields((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  // Generate formatted full citation and in-text citation
  const { fullCitation, inTextCitation } = useMemo(() => {
    const validAuthors = fields.authors.filter((a) => a.lastName.trim());
    const year = fields.year.trim() || "n.d.";
    const title = fields.title.trim() || "Untitled Document";

    let authorStr = "";
    let inTextStr = "";

    // Author string formatting
    if (validAuthors.length === 0) {
      authorStr = title;
      inTextStr = `("${title.slice(0, 20)}...", ${year})`;
    } else if (validAuthors.length === 1) {
      const a = validAuthors[0];
      const initial = a.firstName.trim() ? `${a.firstName.trim()[0]}.` : "";
      if (style === "apa" || style === "harvard") {
        authorStr = `${a.lastName}, ${initial}`.trim();
        inTextStr = `(${a.lastName}, ${year})`;
      } else if (style === "mla") {
        authorStr = `${a.lastName}, ${a.firstName}`.trim();
        inTextStr = `(${a.lastName} ${fields.pages ? fields.pages.split("-")[0] : ""})`.trim();
      } else {
        authorStr = `${a.lastName}, ${a.firstName}`.trim();
        inTextStr = `(${a.lastName} ${year})`;
      }
    } else if (validAuthors.length === 2) {
      const a1 = validAuthors[0];
      const a2 = validAuthors[1];
      if (style === "apa") {
        authorStr = `${a1.lastName}, ${a1.firstName[0] || ""}., & ${a2.lastName}, ${a2.firstName[0] || ""}.`;
        inTextStr = `(${a1.lastName} & ${a2.lastName}, ${year})`;
      } else if (style === "mla") {
        authorStr = `${a1.lastName}, ${a1.firstName}, and ${a2.firstName} ${a2.lastName}`;
        inTextStr = `(${a1.lastName} and ${a2.lastName})`;
      } else {
        authorStr = `${a1.lastName}, ${a1.firstName}, & ${a2.lastName}, ${a2.firstName}`;
        inTextStr = `(${a1.lastName} & ${a2.lastName}, ${year})`;
      }
    } else {
      const a1 = validAuthors[0];
      authorStr = `${a1.lastName} et al.`;
      inTextStr = `(${a1.lastName} et al., ${year})`;
    }

    let full = "";

    if (style === "apa") {
      // APA 7th Edition
      if (sourceType === "website") {
        full = `${authorStr} (${year}). ${title}. ${fields.containerTitle ? fields.containerTitle + ". " : ""}${fields.url}`;
      } else if (sourceType === "book") {
        full = `${authorStr} (${year}). ${title}. ${fields.publisher}.`;
      } else {
        const vol = fields.volume ? `${fields.volume}` : "";
        const iss = fields.issue ? `(${fields.issue})` : "";
        const pg = fields.pages ? `, ${fields.pages}` : "";
        full = `${authorStr} (${year}). ${title}. ${fields.containerTitle}, ${vol}${iss}${pg}. ${fields.doi ? `https://doi.org/${fields.doi}` : fields.url}`;
      }
    } else if (style === "mla") {
      // MLA 9th Edition
      if (sourceType === "website") {
        full = `${authorStr}. "${title}." ${fields.containerTitle ? fields.containerTitle + ", " : ""}${year}, ${fields.url}. Accessed ${fields.accessDate}.`;
      } else if (sourceType === "book") {
        full = `${authorStr}. ${title}. ${fields.publisher}, ${year}.`;
      } else {
        const vol = fields.volume ? `vol. ${fields.volume}, ` : "";
        const iss = fields.issue ? `no. ${fields.issue}, ` : "";
        const pg = fields.pages ? `pp. ${fields.pages}.` : "";
        full = `${authorStr}. "${title}." ${fields.containerTitle}, ${vol}${iss}${year}, ${pg} ${fields.doi ? `doi:${fields.doi}` : fields.url}`;
      }
    } else if (style === "chicago") {
      // Chicago 17th
      if (sourceType === "website") {
        full = `${authorStr}. "${title}." ${fields.containerTitle}. Last modified ${year}. ${fields.url}.`;
      } else if (sourceType === "book") {
        full = `${authorStr}. ${title}. ${fields.publisher}, ${year}.`;
      } else {
        full = `${authorStr}. "${title}." ${fields.containerTitle} ${fields.volume}, no. ${fields.issue} (${year}): ${fields.pages}. ${fields.doi ? `https://doi.org/${fields.doi}` : fields.url}`;
      }
    } else if (style === "harvard") {
      // Harvard
      if (sourceType === "website") {
        full = `${authorStr} (${year}) '${title}', ${fields.containerTitle}. Available at: ${fields.url} (Accessed: ${fields.accessDate}).`;
      } else if (sourceType === "book") {
        full = `${authorStr} (${year}) ${title}. ${fields.publisher}.`;
      } else {
        full = `${authorStr} (${year}) '${title}', ${fields.containerTitle}, ${fields.volume}(${fields.issue}), pp. ${fields.pages}.`;
      }
    } else if (style === "bibtex") {
      // BibTeX
      const tag = `${(validAuthors[0]?.lastName || "source").toLowerCase()}${year}`;
      const entryType = sourceType === "book" ? "book" : sourceType === "journal" ? "article" : "misc";
      full = `@${entryType}{${tag},
  author = {${validAuthors.map((a) => `${a.lastName}, ${a.firstName}`).join(" and ")}},
  title = {${title}},
  ${sourceType === "journal" ? `journal = {${fields.containerTitle}},\n  volume = {${fields.volume}},\n  number = {${fields.issue}},\n  pages = {${fields.pages}},` : ""}
  ${sourceType === "book" ? `publisher = {${fields.publisher}},` : ""}
  ${sourceType === "website" ? `howpublished = {\\url{${fields.url}}},` : ""}
  year = {${year}}
}`;
    }

    return { fullCitation: full, inTextCitation: inTextStr };
  }, [fields, style, sourceType]);

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullCitation);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCopyInText = () => {
    navigator.clipboard.writeText(inTextCitation);
    setCopiedInText(true);
    setTimeout(() => setCopiedInText(false), 2000);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Style & Source Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Citation Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "apa", label: "APA 7th" },
                  { id: "mla", label: "MLA 9th" },
                  { id: "chicago", label: "Chicago" },
                  { id: "harvard", label: "Harvard" },
                  { id: "bibtex", label: "BibTeX" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      style === s.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Source Format
              </label>
              <div className="flex gap-1.5">
                {[
                  { id: "website", label: "Website", icon: <Globe className="w-3.5 h-3.5" /> },
                  { id: "book", label: "Book", icon: <Book className="w-3.5 h-3.5" /> },
                  { id: "journal", label: "Journal", icon: <FileText className="w-3.5 h-3.5" /> },
                ].map((src) => (
                  <button
                    key={src.id}
                    onClick={() => setSourceType(src.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      sourceType === src.id
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {src.icon}
                    {src.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Fields Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          {/* Authors List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Authors
              </label>
              <button
                type="button"
                onClick={handleAddAuthor}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Author
              </button>
            </div>

            <div className="space-y-2">
              {fields.authors.map((auth, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="First / Middle Name"
                    value={auth.firstName}
                    onChange={(e) => handleAuthorChange(idx, "firstName", e.target.value)}
                    className="w-1/2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Last / Family Name"
                    value={auth.lastName}
                    onChange={(e) => handleAuthorChange(idx, "lastName", e.target.value)}
                    className="w-1/2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {fields.authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500"
                      title="Remove author"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Title & Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {sourceType === "book" ? "Book Title" : "Article / Page Title"}
              </label>
              <input
                type="text"
                value={fields.title}
                onChange={(e) => setFields({ ...fields, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {sourceType === "website"
                  ? "Website / Organization Name"
                  : sourceType === "journal"
                  ? "Journal Title"
                  : "Series / Subtitle"}
              </label>
              <input
                type="text"
                value={fields.containerTitle}
                onChange={(e) => setFields({ ...fields, containerTitle: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <input
                type="text"
                value={fields.year}
                onChange={(e) => setFields({ ...fields, year: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {sourceType === "journal" && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={fields.volume}
                    onChange={(e) => setFields({ ...fields, volume: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Issue / No.
                  </label>
                  <input
                    type="text"
                    value={fields.issue}
                    onChange={(e) => setFields({ ...fields, issue: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={fields.pages}
                    onChange={(e) => setFields({ ...fields, pages: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </>
            )}

            {sourceType === "book" && (
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  value={fields.publisher}
                  onChange={(e) => setFields({ ...fields, publisher: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* URL / DOI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                URL
              </label>
              <input
                type="text"
                value={fields.url}
                onChange={(e) => setFields({ ...fields, url: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                DOI (Digital Object Identifier)
              </label>
              <input
                type="text"
                placeholder="10.1000/182"
                value={fields.doi}
                onChange={(e) => setFields({ ...fields, doi: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Formatted Citation Output Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Bibliography Reference ({style.toUpperCase()})
              </span>
              <button
                onClick={handleCopyFull}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102"
              >
                {copiedFull ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFull ? "Copied Reference!" : "Copy Reference"}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-serif whitespace-pre-wrap select-all">
              {fullCitation}
            </div>
          </div>

          {/* In-text citation */}
          {style !== "bibtex" && (
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  In-Text Parenthetical Citation
                </span>
                <button
                  onClick={handleCopyInText}
                  className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                >
                  {copiedInText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInText ? "Copied In-Text!" : "Copy In-Text"}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                {inTextCitation}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
