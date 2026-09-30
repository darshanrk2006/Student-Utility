import { ServerConvertTool } from "@/components/ServerConvertTool";
import { FileEdit } from "lucide-react";

export default function PdfToWordPage() {
  return (
    <ServerConvertTool
      toolId="pdf-to-word"
      accept=".pdf,application/pdf"
      fromFormat="pdf"
      toFormat="docx"
      iconNode={<FileEdit className="w-8 h-8" />}
    />
  );
}
