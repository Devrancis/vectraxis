"use client";

import React from "react";
import { scaleThreshold } from "d3-scale";
import { MatrixData } from "@/types/attack";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Define the exact threat scale requested in the architecture spec
const heatScale = scaleThreshold<number, string>()
  .domain([1, 3, 6, 11, 20])
  .range([
    "#0d1117", // 0 actors (base, invisible)
    "#1e3a5f", // 1-2 (cold blue)
    "#1e4d2b", // 3-5 (cool green)
    "#7c4d12", // 6-10 (amber)
    "#7c2d12", // 11-20 (burnt orange)
    "#991b1b"  // 20+ (threat red)
  ]);

interface AttackMatrixProps {
  matrixData: MatrixData;
  selectedActorId?: string | null;
  // We will add onTechniqueClick later when we build the detail panel
}

export default function AttackMatrix({ matrixData, selectedActorId }: AttackMatrixProps) {
  return (
    <ScrollArea className="w-full h-full bg-bg-base relative">
      <div className="flex gap-2 p-4 min-w-max pb-8">
        {matrixData.tactics.map((tactic) => (
          <div key={tactic.id} className="w-[200px] flex flex-col gap-1 shrink-0">
            
            {/* Tactic Column Header */}
            <div className="sticky top-0 bg-bg-surface border-b border-border p-2 z-20 shadow-sm">
              <div className="font-mono text-[10px] text-text-secondary tracking-wider">
                {tactic.id}
              </div>
              <div className="font-display text-sm font-semibold truncate text-text-primary mt-1">
                {tactic.name}
              </div>
              <div className="text-[10px] text-text-muted mt-1 font-medium">
                {tactic.technique_count} techniques
              </div>
            </div>

            {/* Techniques Grid */}
            <div className="flex flex-col gap-[2px]">
              {tactic.techniques.map((tech) => {
                
                // Color Logic Engine
                let cellColor = "#0d1117"; // Default base
                
                if (selectedActorId) {
                  // TODO: When actor logic is fully wired, we will pass the actor's specific technique IDs here.
                  // For now, if an actor is selected, we just dim everything until wired.
                  cellColor = "#0b0e1a"; 
                } else {
                  // Heatmap Mode (Default)
                  cellColor = heatScale(tech.actor_count);
                }

                return (
                  <div 
                    key={tech.id}
                    className="group relative flex items-center px-2 py-[6px] h-8 text-xs cursor-pointer rounded-[2px] transition-all hover:brightness-125"
                    style={{ backgroundColor: cellColor }}
                  >
                    <span className="truncate text-text-primary z-10 w-full select-none">
                      {tech.name}
                    </span>
                    
                    {/* Hover State Outline Overlay */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-accent/80 transition-colors rounded-[2px] pointer-events-none" />
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