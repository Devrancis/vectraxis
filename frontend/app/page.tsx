"use client";

import React, { useState } from "react";
import { useMatrix } from "@/hooks/useMatrix";
import AttackMatrix from "@/components/matrix/AttackMatrix";
import ActorSidebar from "@/components/sidebar/ActorSidebar";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: matrixData, isLoading, isError, error } = useMatrix();
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);

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
    <div className="flex-1 flex overflow-hidden w-full h-full">
      {/* Target Registry Component Input */}
      <ActorSidebar 
        selectedActorId={selectedActorId} 
        onSelectActor={setSelectedActorId} 
      />
      
      {/* Telemetry Visualizer Core */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-bg-base">
        <div className="h-10 bg-bg-raised border-b border-border flex items-center px-4 shrink-0 text-xs text-text-secondary font-mono justify-between">
          <span>Tracking {matrixData.total_actors} APT Groups across {matrixData.total_techniques} Techniques</span>
          {selectedActorId && (
            <span className="text-accent animate-pulse font-semibold">
              Filter Active: Actor Profile Selected
            </span>
          )}
        </div>
        
        <AttackMatrix 
          matrixData={matrixData} 
          selectedActorId={selectedActorId} 
        />
      </main>
    </div>
  );
}