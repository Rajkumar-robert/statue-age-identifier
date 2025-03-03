"use client";
import Image from "next/image";
import React from "react";

const Page = () => {
  return (
    <div className="flex h-[88vh] w-full p-4 gap-4">
      {/* Left Section (Uploaded Image) */}
      <div className="w-1/3 bg-gray-200 flex items-center justify-center p-4 rounded-lg border-1 border-black">
        <Image
          src="/statue_images/6.png"
          alt="Uploaded Statue"
          width={500}
          height={600}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Right Section (Remaining 70%) */}
      <div className="w-2/3 flex flex-col gap-4">    
        <div className="flex gap-4 h-1/3">
          <div className=" font-sans w-1/2 bg-gray-200 flex items-center justify-center rounded-lg border-1 border-black text-4xl font-bold">
            <p>Age: ~100-110 years</p>

          </div>
          <div className="w-1/2 bg-gray-200 flex items-center justify-center rounded-lg border-1 border-black text-4xl font-bold">
            <p>Era: Vedic</p>
          </div>
        </div>

        {/* Middle Section (Description) */}
        <div className="h-2/3 px-10 font-mono bg-gray-500 flex flex-col items-center justify-center rounded-lg border-1 border-black p-4 text-white text-lg">
          <p>
            This statue dates back approximately 100-110 years, belonging to the 
            Vedic era. It showcases intricate stonework, characteristic of 
            the period, with detailed carvings reflecting the cultural and artistic 
            influences of the time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
