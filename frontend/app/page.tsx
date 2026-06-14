"use client";

import { useMatrix } from "@/hooks/useMatrix";
import AttackMatrix from "@/components/matrix/AttackMatrix";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: matrixData, isLoading, isError, error } = useMatrix();

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base text-text-secondary gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="font-mono text-sm tracking-widest uppercase">Initializing Threat Matrix...</p>
      </div>
    );
  }

  if (isError || !matrixData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base text-threat-critical gap-4">
        <AlertCircle className="w-8 h-8" />
        <p className="font-body text-sm">Failed to load matrix data: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* The Left Sidebar (Actor Browser) will go here.
        For now, the matrix takes up the full screen width.
      */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {/* Analytics Top Bar Placeholder */}
        <div className="h-10 bg-bg-raised border-b border-border flex items-center px-4 shrink-0 text-xs text-text-secondary font-mono">
          Tracking {matrixData.total_actors} APT Groups across {matrixData.total_techniques} Techniques
        </div>
        
        {/* The Live Matrix */}
        <AttackMatrix matrixData={matrixData} />
        
      </main>
      
      {/* The Right Detail Panel will slide in here later */}
    </div>
  );
}