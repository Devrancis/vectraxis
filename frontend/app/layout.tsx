import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

export const metadata: Metadata = {
  title: "Vectraxis | Threat Intelligence Visualizer",
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
          {/* Topbar placeholder - we will build this soon */}
          <header className="h-12 border-b border-border bg-bg-surface flex items-center px-4 shrink-0">
            <h1 className="font-display font-bold text-accent text-xl tracking-tight">Vectraxis.</h1>
          </header>
          
          <main className="flex-1 flex overflow-hidden">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}