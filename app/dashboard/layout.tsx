"use client";

import { Header } from "@/components/layout/header";
import { PortfolioProvider } from "@/components/providers/portfolio-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
      </div>
    </PortfolioProvider>
  );
}
