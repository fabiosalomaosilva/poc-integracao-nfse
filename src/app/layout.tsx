import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import Navigation from '@/components/layout/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFSe Nacional",
  description: "Sistema de Notas Fiscais de Serviço Eletrônica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <QueryProvider>
          <AuthProvider>
            <ErrorBoundary>
              <Navigation />
              <main>
                {children}
              </main>
            </ErrorBoundary>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
