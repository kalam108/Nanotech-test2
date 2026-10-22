import React from 'react';
import { Inter } from 'next/font/google';
import Sidebar from '../../components/admin/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#FFFFFF] text-[#1A1A1A] antialiased`}>
      <Sidebar />
      <main className="ml-[220px] min-h-screen bg-[#FFFFFF] p-8 text-[13px]">
        {children}
      </main>
    </div>
  );
}
