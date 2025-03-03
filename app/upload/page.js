import React from "react";
import UploadForm from "@/components/UploadForm";
import Image from "next/image";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[90vh] bg-gray-50 overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6 text-black z-40">
        Upload a Statue Image
      </h1>
      <UploadForm />
      <div className="absolute w-full h-[90%] z-0 transform -translate-x-50 -bottom-20 scale-75 overflow-hidden">
      <Image src="/sisyphus-bg.png"
      alt="Sisyphus"
      width={1080}
      height={920}
      className="w-full h-full grayscale contrast-[500] opacity-80 " />
      </div>
      
    </div>
  );
}
