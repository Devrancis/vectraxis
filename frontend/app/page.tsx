"use client";

import React, { useState, useMemo } from "react";
import { useMatrix } from "@/hooks/useMatrix";
import { useActors, useActorDetail } from "@/hooks/useActors";
import { Technique } from "@/types/attack";
import AttackMatrix from "@/components/matrix/AttackMatrix";
import ActorSidebar from "@/components/sidebar/ActorSidebar";
import DetailPanel from "@/components/detail/DetailPanel";
import GlobalSearch from "@/components/search/GlobalSearch";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: matrixData, isLoading: isMatrixLoading, isError, error } = useMatrix();
  const { data: allActors = [] } = useActors(); // Fetch all actors for global search
  
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<Technique | null>(null);

  const { data: actorProfile } = useActorDetail(selectedActorId);

  const actorTechniqueSet = useMemo(() => {
    const set = new Set<string>();
    if (actorProfile?.techniques_used) {
      actorProfile.techniques_used.forEach((t: any) => set.add(t.technique_id));
    }
    return set;
  }, [actorProfile]);

  if (isMatrixLoading) {
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
    <div className="flex flex-col h-screen w-full">
      {/* Top Application Bar */}
      <header className="h-14 border-b border-border bg-bg-surface flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-accent text-xl tracking-tight">vectraxis.</h1>
          <div className="h-6 w-px bg-border mx-2"></div>
          <GlobalSearch 
            matrixData={matrixData} 
            actors={allActors} 
            onSelectActor={(id) => {
              setSelectedActorId(id);
              setActiveTechnique(null);
            }}
            onSelectTechnique={(tech) => setActiveTechnique(tech)}
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <ActorSidebar 
          selectedActorId={selectedActorId} 
          onSelectActor={(id) => {
            setSelectedActorId(id);
            setActiveTechnique(null);
          }} 
        />
        
        <main className="flex-1 overflow-hidden flex flex-col relative bg-bg-base">
          <div className="h-10 bg-bg-raised border-b border-border flex items-center px-4 shrink-0 text-xs text-text-secondary font-mono justify-between z-10 shadow-sm">
            <span>Tracking {matrixData.total_actors} APT Groups across {matrixData.total_techniques} Techniques</span>
            {selectedActorId && actorProfile && (
              <span className="text-accent font-semibold flex items-center gap-1.5 animate-pulse">
                ● Viewing Profile: {actorProfile.name}
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

        <DetailPanel 
          technique={activeTechnique} 
          onClose={() => setActiveTechnique(null)} 
        />
      </div>
    </div>
  );
}