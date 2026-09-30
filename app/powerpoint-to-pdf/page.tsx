import { ServerConvertTool } from "@/components/ServerConvertTool";
import { Presentation } from "lucide-react";

export default function PowerPointToPdfPage() {
  return (
    <ServerConvertTool
      toolId="powerpoint-to-pdf"
      accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
      fromFormat="pptx"
      toFormat="pdf"
      iconNode={<Presentation className="w-8 h-8" />}
    />
  );
}
