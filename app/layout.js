import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Mona_Sans,
  Outfit,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
export const metadata = {
  title: "Statue Age Prediction",
  description: "🗿",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${mono.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          {children}
          <Chatbot />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
