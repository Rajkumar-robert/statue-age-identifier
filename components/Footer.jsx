"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="h-[10px] w-full bg-black text-white flex items-center justify-center font-thin text-[2px] font-mono">
      <span className="flex items-center gap-2">
        © 2025 S.A.D. All rights reserved.
        <a href="mailto:contact@yourcompany.com" className="underline">
          contact@sad.com
        </a>
      </span>
    </footer>
  );
};

export default Footer;
