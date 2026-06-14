"use client";

import React, { useState } from "react";
import { useActors } from "@/hooks/useActors";
import { Search, ShieldAlert, Globe, Briefcase, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Actor } from "@/types/attack";

interface ActorSidebarProps {
  selectedActorId: string | null;
  onSelectActor: (id: string | null) => void;
}

// Static fallback filter options matching our backend parser definitions
const COUNTRIES = ["All Countries", "China", "Russia", "Iran", "North Korea", "Unknown"];
const INDUSTRIES = ["All Industries", "Government", "Financial", "Healthcare", "Defense", "Energy", "Technology"];

export default function ActorSidebar({ selectedActorId, onSelectActor }: ActorSidebarProps) {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  // Pass active filters directly into our React Query state manager
  const { data: actors = [], isLoading, isError } = useActors(
    selectedIndustry && selectedIndustry !== "All Industries" ? selectedIndustry : undefined,
    selectedCountry && selectedCountry !== "All Countries" ? selectedCountry : undefined
  );

  // Client-side text match filtering over the fetched data stream
  const filteredActors = actors.filter((actor: Actor) =>
    actor.name.toLowerCase().includes(search.toLowerCase()) ||
    actor.associated_groups?.some((alias: string) => alias.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <aside className="w-[320px] h-full bg-bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden">
      
      {/* Search and Filters Segment */}
      <div className="p-4 border-b border-border flex flex-col gap-3 bg-bg-raised">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search actors or aliases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-base border border-border rounded-md pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Country Selection */}
          <div className="relative">
            <Globe className="absolute left-2 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-bg-base border border-border rounded-md pl-7 pr-2 py-1.5 text-xs text-text-secondary appearance-none focus:outline-none focus:border-accent"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Industry Selection */}
          <div className="relative">
            <Briefcase className="absolute left-2 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full bg-bg-base border border-border rounded-md pl-7 pr-2 py-1.5 text-xs text-text-secondary appearance-none focus:outline-none focus:border-accent"
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actors Scrollable Content Area */}
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-xs font-mono">Syncing Registry...</span>
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-xs text-threat-critical flex flex-col items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <span>Failed to index active threat groups.</span>
          </div>
        ) : filteredActors.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted">
            No threat actors match current criteria.
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-2 flex flex-col gap-1">
              {filteredActors.map((actor: Actor) => {
                const isSelected = selectedActorId === actor.id;
                return (
                  <button
                    key={actor.id}
                    onClick={() => onSelectActor(isSelected ? null : actor.id)}
                    className={`w-full text-left p-3 rounded-md border transition-all flex flex-col gap-1.5 group ${
                      isSelected
                        ? "bg-accent/10 border-accent shadow-[0_0_12px_rgba(var(--accent-rgb),0.15)]"
                        : "bg-transparent border-transparent hover:bg-bg-raised hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm font-semibold truncate transition-colors ${
                        isSelected ? "text-accent" : "text-text-primary group-hover:text-accent"
                      }`}>
                        {actor.name}
                      </span>
                      {actor.country && actor.country !== "Unknown" && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-bg-base border border-border text-text-secondary rounded">
                          {actor.country}
                        </span>
                      )}
                    </div>

                    {actor.associated_groups && actor.associated_groups.length > 0 && (
                      <p className="text-xs text-text-muted truncate">
                        <span className="font-mono text-[10px]">Aliases:</span> {actor.associated_groups.join(", ")}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono mt-1">
                      <span>⚡ {actor.techniques_used?.length || 0} Techniques</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </aside>
  );
}