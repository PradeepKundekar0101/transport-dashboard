import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import SimulationPanel from "@/components/simulation-panel";

export const metadata: Metadata = {
  title: "AutoTransport — Dispatch Hub",
  description: "Auto transport brokerage management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 ml-[240px] min-h-screen">
          <div className="max-w-[1400px] mx-auto px-6 py-6">{children}</div>
        </main>
        <SimulationPanel />
      </body>
    </html>
  );
}
