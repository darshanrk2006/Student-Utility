import { ServerConvertTool } from "@/components/ServerConvertTool";
import { FileSpreadsheet } from "lucide-react";

export default function WordToPdfPage() {
  return (
    <ServerConvertTool
      toolId="word-to-pdf"
      accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
      defaultFromFormat="docx"
      defaultToFormat="pdf"
      iconNode={<FileSpreadsheet className="w-8 h-8" />}
    />
  );
}
