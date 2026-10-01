import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  PageBreak,
  HeadingLevel,
  AlignmentType,
} from "docx";

/**
 * Generates an official, 100% ECMA-376 compliant Microsoft Word (.docx) file
 * directly in the browser RAM from extracted PDF pages and paragraphs.
 * Fully compatible with Microsoft Word (Mac & Windows), Google Docs, and Apple Pages.
 */
export async function generateDocxBlobFromPages(
  pages: { pageNumber: number; text: string }[]
): Promise<Blob> {
  const docParagraphs: Paragraph[] = [];

  pages.forEach((page, pageIdx) => {
    // Add page break between pages
    if (pageIdx > 0) {
      docParagraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }

    const lines = page.text.split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        // Empty line spacer
        docParagraphs.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [],
          })
        );
        return;
      }

      // Detect if line is likely a code snippet (contains keywords, indentation, or symbols)
      const isCodeLine =
        /^(import |from |def |class |function |const |let |var |if |for |while |return |print\(|console\.|#include|<div|<\?php|public |private |int |float )/.test(
          trimmed
        ) ||
        /[{};]$/.test(trimmed) ||
        /^[0-9]+\s+[a-zA-Z]/.test(line);

      // Detect if line is a major section title / heading
      const isHeading =
        !isCodeLine &&
        trimmed.length < 70 &&
        !trimmed.endsWith(".") &&
        !trimmed.includes(";") &&
        (/^([0-9]+\.|\b(EXPERIMENT|CHAPTER|SECTION|EXERCISE|LAB|ASSIGNMENT|ABSTRACT|INTRODUCTION|CONCLUSION|RESULTS)\b)/i.test(
          trimmed
        ) ||
          trimmed === trimmed.toUpperCase());

      if (isHeading) {
        docParagraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: trimmed,
                bold: true,
                size: 26, // 13pt
                font: "Calibri",
                color: "1E293B",
              }),
            ],
          })
        );
      } else if (isCodeLine) {
        docParagraphs.push(
          new Paragraph({
            spacing: { before: 40, after: 40, line: 240 },
            children: [
              new TextRun({
                text: line, // Preserve indentation for code
                font: "Consolas",
                size: 19, // 9.5pt
                color: "0F172A",
              }),
            ],
          })
        );
      } else {
        docParagraphs.push(
          new Paragraph({
            spacing: { after: 120, line: 276 },
            children: [
              new TextRun({
                text: trimmed,
                font: "Calibri",
                size: 22, // 11pt
                color: "222222",
              }),
            ],
          })
        );
      }
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children:
          docParagraphs.length > 0
            ? docParagraphs
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Document converted successfully via StudentToolkit.",
                      font: "Calibri",
                      size: 22,
                    }),
                  ],
                }),
              ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
