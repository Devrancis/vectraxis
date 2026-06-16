import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import Topbar from "@/components/slider/Topbar"; 

export const metadata: Metadata = {
  title: "Vectraxis",
  description: "Interactive MITRE ATT&CK Threat Visualizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-text-primary font-body antialiased min-h-screen flex flex-col">
        <QueryProvider>

          <Topbar />
          
          <main className="flex-1 flex overflow-hidden">
            {children}
          </main>
          
        </QueryProvider>
      </body>
    </html>
  );
}