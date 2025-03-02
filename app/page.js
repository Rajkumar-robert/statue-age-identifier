"use client";
import Slider from "@/components/Slider";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full h-[90vh] flex flex-col items-center justify-center bg-gray-100 overflow-hidden">
  
      <div className="absolute top-28 flex flex-col items-center justify-center">
        <h1 className=" text-8xl font-extrabold text-black opacity-90 select-none">
        Unveiling the Past
        </h1>
        <p className=" text-lg text-gray-900 font-mono font-medium">
        Upload an image of a statue and let AI determine its age and historical era with precision.
        </p>
      </div>

      {/* Image Container (Moves image down) */}
      <div className="relative w-full flex justify-center">
        <div className="relative w-[400px] h-[600px] flex flex-col items-center justify-center">
          <div className=" z-10 transform translate-y-10 hover:scale-110 transition duration-150">
            <Link
              href="/upload"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg text-sm tracking-wider font-semibold hover:bg-blue-700 transition font-mono border-2 border-white-200"
            >
              GET STARTED
            </Link>
          </div>

          
          <div className="absolute -bottom-18 flex justify-center w-screen"> 
            <Slider/>
          </div>
          <Image
            src="/thinker_b_bg.png"
            alt="Thinker"
            width={600}
            height={800}
            className="absolute grayscale bottom-[-8%] scale-100 object-contain"
          />
          
        </div>
      </div>
      
    </div>
  );
}
