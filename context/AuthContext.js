"use client";
import { createContext, useContext, useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";

// Create Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      setUser(null);
      return;
    }

    try {
      // Use `decode` instead of `verify` (No secret key needed)
      const decodedUser = jwt.decode(token);
      console.log("Decoded User:", decodedUser);

      if (decodedUser) {
        setUser(decodedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error decoding token", error);
      setUser(null);
    }
  }, []);

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
