import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gassi Trip Portal",
  description: "Πύλη εκδρομών GASSI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
