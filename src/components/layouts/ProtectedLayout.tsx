
import React from 'react';
import NavBar from "@/components/navigation/NavBar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => (
  <div className="min-h-screen">
    {children}
    <NavBar />
  </div>
);

export default ProtectedLayout;
