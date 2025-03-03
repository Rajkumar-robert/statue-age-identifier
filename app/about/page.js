"use client";
import React from "react";

const AboutPage = () => {
  return (
    <div className="min-h-[88vh] flex flex-col items-center text-center px-6 py-12 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/headless_buddha_bg.png')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white mb-4 font-sans">About Us</h1>
        <p className="max-w-2xl text-white text-lg mb-6 font-mono">
          Welcome to our platform, where history meets technology. We leverage AI to
          analyze and determine the approximate age and era of stone statues,
          offering enthusiasts and historians a powerful tool to explore the past.
        </p>

        {/* Glass Effect Section */}
        <div className="mt-8 max-w-4xl w-full bg-white/30 backdrop-blur-sm shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-black mb-4 font-sans">How It Works</h2>
          <ul className="text-black text-md list-disc list-inside space-y-2 font-mono">
            <li>Upload an image of a stone statue.</li>
            <li>Our AI analyzes the texture, style, and details.</li>
            <li>Receive an estimated age range and historical era.</li>
            <li>Explore detailed descriptions and insights.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
