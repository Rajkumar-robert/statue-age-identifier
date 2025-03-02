"use client";
import Image from "next/image";
import React, { useState } from "react";
import Marquee from "react-fast-marquee";

const Slider = () => {
  
  const sliderImages = Array.from({ length: 13}, (_, i) => `/statue_images/${i + 1}.png`);
  
  const [isHovered, setIsHovered] = useState([...Array(sliderImages.length)].map(() => false));

  return (
    <div className="bg-accent h-fit overflow-hidden select-none">
      <Marquee play={true} direction="right" speed={100} pauseOnHover>
        {sliderImages.map((src, index) => (
          <div key={index} className="h-64 w-52 flex items-center justify-center mx-2 relative "
            onMouseEnter={() => setIsHovered((prev) => prev.map((_, i) => i === index))}
            onMouseLeave={() => setIsHovered((prev) => prev.map((_, i) => false))}>
            <Image
              src={src}
              alt={`Statue ${index + 1}`}
              layout="fill" // Makes the image cover the entire space
              objectFit="cover" // Ensures it fills without stretching
              className={`rounded-lg transition-transform transform ${isHovered[index] ? "" : "scale-110 grayscale transition duration-300"}`}
              
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Slider;
