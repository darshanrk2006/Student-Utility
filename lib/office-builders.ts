import JSZip from "jszip";

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Converts a 0-indexed column number to Excel column letters (0 -> A, 27 -> AB)
 */
function colToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Generates an official, 100% ECMA-376 compliant Microsoft Excel (.xlsx) file
 * directly in browser RAM from 2D row data.
 * Opens seamlessly in Microsoft Excel, Apple Numbers, Google Sheets, and LibreOffice.
 */
export async function generateXlsxBlob(
  rows: (string | number)[][],
  sheetName = "Sheet1"
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
  zip.file("[Content_Types].xml", contentTypesXml);

  // 2. _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  zip.file("_rels/.rels", rootRelsXml);

  // 3. xl/_rels/workbook.xml.rels
  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  zip.file("xl/_rels/workbook.xml.rels", workbookRelsXml);

  // 4. xl/workbook.xml
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
  zip.file("xl/workbook.xml", workbookXml);

  // 5. xl/styles.xml
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FF1E293B"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;
  zip.file("xl/styles.xml", stylesXml);

  // 6. xl/worksheets/sheet1.xml
  let sheetDataXml = "";
  rows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 1;
    let rowXml = `<row r="${rowNum}">`;

    row.forEach((cellVal, colIdx) => {
      const cellRef = `${colToLetter(colIdx)}${rowNum}`;
      const isHeader = rowIdx === 0;
      const styleAttr = isHeader ? ' s="1"' : "";

      if (typeof cellVal === "number" && !isNaN(cellVal)) {
        rowXml += `<c r="${cellRef}"${styleAttr}><v>${cellVal}</v></c>`;
      } else {
        const text = String(cellVal || "");
        rowXml += `<c r="${cellRef}" t="inlineStr"${styleAttr}><is><t>${escapeXml(text)}</t></is></c>`;
      }
    });

    rowXml += "</row>";
    sheetDataXml += rowXml;
  });

  const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetDataXml}</sheetData>
</worksheet>`;
  zip.file("xl/worksheets/sheet1.xml", worksheetXml);

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Generates standard RFC 4180 CSV Blob
 */
export function generateCsvBlob(rows: (string | number)[][]): Blob {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? "");
          if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\r\n");

  return new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
}

/**
 * Generates standard TSV Blob
 */
export function generateTsvBlob(rows: (string | number)[][]): Blob {
  const tsvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? "");
          return str.replace(/\t/g, " ").replace(/\r?\n/g, " ");
        })
        .join("\t")
    )
    .join("\r\n");

  return new Blob(["\ufeff" + tsvContent], { type: "text/tab-separated-values;charset=utf-8" });
}

/**
 * Generates a valid Rich Text Format (.rtf) Blob
 */
export function generateRtfBlob(text: string, title?: string): Blob {
  const safeTitle = title || "Document";
  const rtfHeader = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}{\\f1\\froman\\fcharset0 Times New Roman;}}
{\\colortbl ;\\red0\\green0\\blue0;\\red30\\green58\\blue138;}
\\viewkind4\\uc1\\pard\\f0\\fs28\\b ${safeTitle.replace(/[\\{}]/g, "")}\\b0\\fs22\\par\\par\n`;

  const paragraphs = text
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/\\/g, "\\\\")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/[^\x20-\x7E]/g, (char) => {
          const code = char.charCodeAt(0);
          return code < 256 ? `\\\'${code.toString(16).padStart(2, "0")}` : `\\u${code}?`;
        });
      return escaped + "\\par";
    })
    .join("\n");

  const rtfContent = rtfHeader + paragraphs + "\n}";
  return new Blob([rtfContent], { type: "application/rtf;charset=utf-8" });
}

/**
 * Generates a valid OpenDocument Text (.odt) package
 */
export async function generateOdtBlob(text: string, title?: string): Promise<Blob> {
  const zip = new JSZip();
  const safeTitle = escapeXml(title || "Document");

  // mimetype must be uncompressed and first entry
  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });

  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
  zip.file("META-INF/manifest.xml", manifestXml);

  const paragraphsXml = text
    .split("\n")
    .map((line) => `<text:p>${escapeXml(line)}</text:p>`)
    .join("");

  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
  <office:body>
    <office:text>
      <text:h text:outline-level="1">${safeTitle}</text:h>
      ${paragraphsXml}
    </office:text>
  </office:body>
</office:document-content>`;
  zip.file("content.xml", contentXml);

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.oasis.opendocument.text",
  });
}

/**
 * Generates an official EPUB 3.0 electronic book
 */
export async function generateEpubBlob(text: string, title: string): Promise<Blob> {
  const zip = new JSZip();
  const safeTitle = escapeXml(title || "E-Book");
  const dateStr = new Date().toISOString().split("T")[0];

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file("META-INF/container.xml", containerXml);

  const paragraphsHtml = text
    .split("\n")
    .map((line) => `<p>${escapeXml(line)}</p>`)
    .join("\n");

  const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${safeTitle}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; margin: 2em; color: #222; }
    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    p { margin: 0.8em 0; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  ${paragraphsHtml}
</body>
</html>`;
  zip.file("OEBPS/chapter1.xhtml", chapterXhtml);

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:uuid:${Date.now()}</dc:identifier>
    <dc:title>${safeTitle}</dc:title>
    <dc:language>en</dc:language>
    <dc:date>${dateStr}</dc:date>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
  </spine>
</package>`;
  zip.file("OEBPS/content.opf", contentOpf);

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
  });
}

/**
 * Formats 2D table or text into a clean standalone HTML5 webpage
 */
export function generateHtmlTableBlob(rows: (string | number)[][], title?: string): Blob {
  const safeTitle = escapeXml(title || "Spreadsheet Table");

  let tableRows = "";
  rows.forEach((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    const tag = isHeader ? "th" : "td";
    const cells = row.map((c) => `<${tag}>${escapeXml(String(c ?? ""))}</${tag}>`).join("");
    tableRows += `<tr>${cells}</tr>\n`;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${safeTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #f8fafc; color: #0f172a; }
    h1 { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; max-width: 1200px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    th { background: #4f46e5; color: #ffffff; font-weight: 700; text-align: left; padding: 12px 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:hover td { background: #e0e7ff; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  <table>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;

  return new Blob([html], { type: "text/html;charset=utf-8" });
}
