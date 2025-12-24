"use client";

import { ReactNode } from "react";

interface ProfileCardProps {
  children: ReactNode;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 md:p-8 mb-8 relative overflow-hidden">
      {/* Декоративный элемент */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent opacity-50 -translate-y-32 translate-x-32" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};