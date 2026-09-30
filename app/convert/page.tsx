import { ServerConvertTool } from "@/components/ServerConvertTool";
import { ArrowRightLeft } from "lucide-react";

export const metadata = {
  title: "Universal Document Converter Dashboard",
  description:
    "Universal document and file converter. Select your uploaded file type and desired target format for instant high-fidelity conversion.",
};

export default function UniversalConvertPage() {
  return (
    <ServerConvertTool
      defaultFromFormat="docx"
      defaultToFormat="pdf"
      iconNode={<ArrowRightLeft className="w-8 h-8" />}
    />
  );
}
