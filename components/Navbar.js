import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <Link href="/" className="text-lg font-bold">Statue Age Identifier</Link>
      <div>
        <Link href="/upload" className="px-4">Upload</Link>
        <Link href="/login" className="px-4">Login</Link>
      </div>
    </nav>
  );
}
