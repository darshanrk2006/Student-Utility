"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PagesGuideRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pages-to-pdf");
  }, [router]);

  return (
    <div className="py-20 text-center">
      <p className="text-sm text-slate-500">Redirecting to Apple Pages to PDF...</p>
    </div>
  );
}
