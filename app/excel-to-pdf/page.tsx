import { ServerConvertTool } from "@/components/ServerConvertTool";
import { Sheet } from "lucide-react";

export default function ExcelToPdfPage() {
  return (
    <ServerConvertTool
      toolId="excel-to-pdf"
      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
      defaultFromFormat="xlsx"
      defaultToFormat="pdf"
      iconNode={<Sheet className="w-8 h-8" />}
    />
  );
}
