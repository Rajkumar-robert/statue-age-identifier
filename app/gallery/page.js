"use client";
import Image from "next/image";
import React from "react";

const Gallery = () => {
  // Sample images (replace with actual statue images)
  const images = Array.from({ length: 12 }, (_, i) => `/statue_images/${i + 1}.png`);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">Statue Gallery</h1>

      {/* Masonry Grid Layout */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((src, index) => (
          <div key={index} className="break-inside-avoid overflow-hidden rounded-lg shadow-md border-1 border-black">
            <Image
              src={src}
              alt={`Statue ${index + 1}`}
              width={500}
              height={700}
              className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
