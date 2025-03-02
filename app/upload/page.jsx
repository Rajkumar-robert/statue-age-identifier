
import React from "react";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[90vh] bg-gray-50">
      
      <h1 className="text-2xl font-semibold mb-6 text-black">Upload a Stone Statue Image</h1>
      <UploadForm />
    </div>
  );
}
