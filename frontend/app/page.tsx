"use client";

import React, { useState, useMemo } from "react";
import { useMatrix } from "@/hooks/useMatrix";
import { useActors, useActorDetail, useCompareActors } from "@/hooks/useActors";
import { Technique } from "@/types/attack";
import AttackMatrix, { ComparisonSets } from "@/components/matrix/AttackMatrix";
import ActorSidebar from "@/components/sidebar/ActorSidebar";
import DetailPanel from "@/components/detail/DetailPanel";
import GlobalSearch from "@/components/search/GlobalSearch";
import { Loader2, AlertCircle, X, GitCompare } from "lucide-react";

export default function Home() {
  const { data: matrixData, isLoading: isMatrixLoading, isError, error } = useMatrix();
  const { data: allActors = [] } = useActors(); 
  
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [compareActorId, setCompareActorId] = useState<string | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<Technique | null>(null);

  // Queries
  const { data: actorProfile } = useActorDetail(selectedActorId);
  const { data: comparisonResponse, isFetching: isComparing } = useCompareActors(selectedActorId, compareActorId);

  // Format Single Actor techniques for O(1) lookup
  const actorTechniqueSet = useMemo(() => {
    const set = new Set<string>();
    if (actorProfile?.techniques_used) {
      actorProfile.techniques_used.forEach((t: any) => set.add(t.technique_id));
    }
    return set;
  }, [actorProfile]);

  // Format Comparison techniques into exact Sets
  const comparisonData: ComparisonSets | null = useMemo(() => {
    if (!compareActorId || !comparisonResponse) return null;
    return {
      shared: new Set(comparisonResponse.shared_techniques),
      actor1: new Set(comparisonResponse.actor1_only),
      actor2: new Set(comparisonResponse.actor2_only)
    };
  }, [comparisonResponse, compareActorId]);

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
      <header className="h-14 border-b border-border bg-bg-surface flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-accent text-xl tracking-tight">vectraxis.</h1>
          <div className="h-6 w-px bg-border mx-2"></div>
          <GlobalSearch 
            matrixData={matrixData} 
            actors={allActors} 
            onSelectActor={(id) => {
              setSelectedActorId(id);
              setCompareActorId(null);
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
            if (!id) setCompareActorId(null);
            setActiveTechnique(null);
          }} 
        />
        
        <main className="flex-1 overflow-hidden flex flex-col relative bg-bg-base">
          {/* Context & Comparison Header */}
          <div className="min-h-10 bg-bg-raised border-b border-border flex flex-wrap items-center px-4 py-2 shrink-0 text-xs text-text-secondary font-mono justify-between z-10 shadow-sm gap-4">
            
            {!selectedActorId ? (
              <span>Tracking {matrixData.total_actors} APT Groups across {matrixData.total_techniques} Techniques</span>
            ) : (
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <span className="text-accent font-semibold flex items-center gap-1.5 animate-pulse shrink-0">
                  ● Viewing: {actorProfile?.name || "Loading..."}
                </span>

                {/* Compare Target Selector */}
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-text-muted" />
                  <select
                    value={compareActorId || ""}
                    onChange={(e) => setCompareActorId(e.target.value || null)}
                    className="bg-bg-base border border-border rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-accent w-48 truncate"
                  >
                    <option value="">Compare with...</option>
                    {allActors
                      .filter((a: any) => a.id !== selectedActorId)
                      .map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                  </select>
                  {compareActorId && (
                    <button onClick={() => setCompareActorId(null)} className="p-1 hover:text-threat-critical">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Comparison Legend */}
            {comparisonData && comparisonResponse && (
              <div className="flex items-center gap-3 bg-bg-base px-3 py-1.5 rounded border border-border text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#ff6b35] opacity-80" />
                  <span className="truncate max-w-[100px]">{comparisonResponse.actor1.name} Only ({comparisonData.actor1.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                  <span className="truncate max-w-[100px]">{comparisonResponse.actor2.name} Only ({comparisonData.actor2.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]" />
                  <span className="text-accent font-semibold">Shared ({comparisonData.shared.size})</span>
                </div>
                {isComparing && <Loader2 className="w-3 h-3 animate-spin text-text-muted ml-2" />}
              </div>
            )}
          </div>
          
          <AttackMatrix 
            matrixData={matrixData} 
            selectedActorId={selectedActorId} 
            actorTechniques={actorTechniqueSet}
            comparisonData={comparisonData}
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