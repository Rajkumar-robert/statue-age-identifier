"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Menu, X, Home, Upload, Info, ImageIcon } from "lucide-react"; // Lucide icons

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className=" font-mono bg-white text-black px-6 py-4 border-b border-black-200">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className=" font-bold">
          <Image
            src="/dank_logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="cursor-pointer"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <NavItem href="/dashbord" Icon={LayoutDashboard} text="Dashboard" />
          <NavItem href="/upload" Icon={Upload} text="Upload" />
          <NavItem href="/gallery" Icon={ImageIcon} text="Gallery" />
          <NavItem href="/about" Icon={Info} text="About" />
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          {isOpen ? <X size={28} className="text-black" /> : <Menu size={28} className="text-black" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden flex flex-col items-center space-y-4 mt-4">
          <NavItem href="/" Icon={Home} text="Home" />
          <NavItem href="/upload" Icon={Upload} text="Upload" />
          <NavItem href="/gallery" Icon={ImageIcon} text="Gallery" />
          <NavItem href="/about" Icon={Info} text="About" />
        </ul>
      )}
    </div>
  );
}

// Reusable NavItem Component
const NavItem = ({ href, Icon, text }) => (
  <li>
    <Link href={href} className="flex items-center space-x-2 hover:text-gray-600">
      <Icon size={18} className="text-black" />
      <span>{text}</span>
    </Link>
  </li>
);
