import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aksjeportefølje",
  description: "Administrer din aksjeportefølje",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
