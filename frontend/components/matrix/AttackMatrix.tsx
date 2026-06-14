"use client";

import React from "react";
import { scaleThreshold } from "d3-scale";
import { MatrixData, Technique } from "@/types/attack";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const heatScale = scaleThreshold<number, string>()
  .domain([1, 3, 6, 11, 20])
  .range([
    "#0d1117", // 0 actors (base)
    "#1e3a5f", // 1-2
    "#1e4d2b", // 3-5
    "#7c4d12", // 6-10
    "#7c2d12", // 11-20
    "#991b1b"  // 20+
  ]);

export interface ComparisonSets {
  shared: Set<string>;
  actor1: Set<string>;
  actor2: Set<string>;
}

interface AttackMatrixProps {
  matrixData: MatrixData;
  selectedActorId?: string | null;
  actorTechniques?: Set<string>;
  comparisonData?: ComparisonSets | null;
  onTechniqueSelect: (technique: Technique) => void;
  activeTechniqueId?: string | null;
}

export default function AttackMatrix({ 
  matrixData, 
  selectedActorId, 
  actorTechniques = new Set(),
  comparisonData,
  onTechniqueSelect,
  activeTechniqueId
}: AttackMatrixProps) {
  return (
    <ScrollArea className="w-full h-full bg-bg-base relative">
      <div className="flex gap-2 p-4 min-w-max pb-8">
        {matrixData.tactics.map((tactic) => (
          <div key={tactic.id} className="w-[200px] flex flex-col gap-1 shrink-0">
            
            <div className="sticky top-0 bg-bg-surface border-b border-border p-2 z-20 shadow-sm">
              <div className="font-mono text-[10px] text-text-secondary tracking-wider">{tactic.id}</div>
              <div className="font-display text-sm font-semibold truncate text-text-primary mt-1">{tactic.name}</div>
              <div className="text-[10px] text-text-muted mt-1 font-medium">{tactic.technique_count} techniques</div>
            </div>

            <div className="flex flex-col gap-[2px]">
              {tactic.techniques.map((tech) => {
                const isActive = activeTechniqueId === tech.id;
                
                let cellColor = "#0d1117"; 
                let opacityStyle = "100%";

                if (comparisonData) {
                  // COMPARISON MODE: Tri-color rendering
                  const isShared = comparisonData.shared.has(tech.id);
                  const isA1Only = comparisonData.actor1.has(tech.id);
                  const isA2Only = comparisonData.actor2.has(tech.id);

                  if (isShared) {
                    cellColor = "#a855f7"; // Purple (Overlap)
                  } else if (isA1Only) {
                    cellColor = "rgba(255, 107, 53, 0.8)"; // Orange (Actor 1)
                  } else if (isA2Only) {
                    cellColor = "#3b82f6"; // Blue (Actor 2)
                  } else {
                    cellColor = "#0b0e1a"; // Unused
                    opacityStyle = "30%";
                  }
                } else if (selectedActorId) {
                  // SINGLE ACTOR FOCUS MODE
                  const isUsedByActor = actorTechniques.has(tech.id);
                  cellColor = isUsedByActor ? "rgba(255, 107, 53, 0.7)" : "#0b0e1a";
                  if (!isUsedByActor) opacityStyle = "40%";
                } else {
                  // DEFAULT HEATMAP MODE
                  cellColor = heatScale(tech.actor_count);
                }

                return (
                  <div 
                    key={tech.id}
                    onClick={() => onTechniqueSelect(tech)}
                    className={`group relative flex items-center px-2 py-[6px] h-8 text-xs cursor-pointer rounded-[2px] transition-all hover:brightness-125 select-none ${
                      isActive ? "border border-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] z-10" : ""
                    }`}
                    style={{ backgroundColor: cellColor, opacity: opacityStyle }}
                  >
                    <span className="truncate text-text-primary z-10 w-full">{tech.name}</span>
                    <div className="absolute inset-0 border border-transparent group-hover:border-accent/50 transition-colors rounded-[2px] pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}