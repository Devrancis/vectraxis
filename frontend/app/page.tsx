"use client";

import React, { useState, useMemo } from "react";
import { useMatrix } from "@/hooks/useMatrix";
import { useActorDetail } from "@/hooks/useActors";
import { Technique } from "@/types/attack";
import AttackMatrix from "@/components/matrix/AttackMatrix";
import ActorSidebar from "@/components/sidebar/ActorSidebar";
import DetailPanel from "@/components/detail/DetailPanel";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: matrixData, isLoading, isError, error } = useMatrix();
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<Technique | null>(null);

  // Query details on selected actor to extract technique overlaps
  const { data: actorProfile } = useActorDetail(selectedActorId);

  // Compute lookup tables for fast O(1) highlights inside the matrix cell generator
  const actorTechniqueSet = useMemo(() => {
    const set = new Set<string>();
    if (actorProfile?.techniques_used) {
      actorProfile.techniques_used.forEach((t: any) => {
        set.add(t.technique_id);
      });
    }
    return set;
  }, [actorProfile]);

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
    <div className="flex-1 flex overflow-hidden w-full h-full relative">
      
      {/* Left Sidebar Registry */}
      <ActorSidebar 
        selectedActorId={selectedActorId} 
        onSelectActor={(id) => {
          setSelectedActorId(id);
          // If active technique belongs to previous profile lookups, clear focus bounds
          setActiveTechnique(null);
        }} 
      />
      
      {/* Interactive Core Matrix */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-bg-base">
        <div className="h-10 bg-bg-raised border-b border-border flex items-center px-4 shrink-0 text-xs text-text-secondary font-mono justify-between z-10 shadow-sm">
          <span>Tracking {matrixData.total_actors} APT Groups across {matrixData.total_techniques} Techniques</span>
          {selectedActorId && actorProfile && (
            <span className="text-accent font-semibold flex items-center gap-1.5 animate-pulse">
              ● Viewing Profile: {actorProfile.name} ({actorProfile.techniques_used?.length || 0} Techniques Injected)
            </span>
          )}
        </div>
        
        <AttackMatrix 
          matrixData={matrixData} 
          selectedActorId={selectedActorId} 
          actorTechniques={actorTechniqueSet}
          onTechniqueSelect={setActiveTechnique}
          activeTechniqueId={activeTechnique?.id}
        />
      </main>

      {/* Right Intelligence Context Slideout Drawer */}
      <DetailPanel 
        technique={activeTechnique} 
        onClose={() => setActiveTechnique(null)} 
      />
      
    </div>
  );
}