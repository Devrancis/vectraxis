"use client";

import React, { useEffect, useState } from "react";
import { Search, Terminal, Users } from "lucide-react";
import { MatrixData, Technique, Actor } from "@/types/attack";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface GlobalSearchProps {
  matrixData: MatrixData;
  actors: Actor[];
  onSelectActor: (actorId: string) => void;
  onSelectTechnique: (technique: Technique) => void;
}

export default function GlobalSearch({ matrixData, actors, onSelectActor, onSelectTechnique }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  // Extract all techniques into a flat array for the search engine
  const allTechniques = React.useMemo(() => {
    const techs: Technique[] = [];
    if (!matrixData) return techs;
    matrixData.tactics.forEach(tactic => {
      tactic.techniques.forEach(tech => techs.push(tech));
    });
    return techs;
  }, [matrixData]);

  // Bind the Cmd+K / Ctrl+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-text-muted bg-bg-base border border-border px-3 py-1.5 rounded-md hover:text-text-primary hover:border-accent transition-colors w-64"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search Vectraxis...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-bg-raised px-1.5 font-mono text-[10px] font-medium text-text-muted">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a technique ID, actor name, or alias..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No intelligence records found.</CommandEmpty>
          
          {/* Threat Actors Group */}
          {actors && actors.length > 0 && (
            <CommandGroup heading="Threat Actors">
              {actors.slice(0, 10).map((actor) => (
                <CommandItem
                  key={actor.id}
                  onSelect={() => {
                    onSelectActor(actor.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-accent" />
                  <span className="font-semibold">{actor.name}</span>
                  {actor.country && actor.country !== "Unknown" && (
                    <span className="text-[10px] text-text-muted border border-border px-1 rounded ml-2">
                      {actor.country}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Techniques Group */}
          {allTechniques.length > 0 && (
            <CommandGroup heading="MITRE Techniques">
              {allTechniques.slice(0, 20).map((tech) => (
                <CommandItem
                  key={tech.id}
                  onSelect={() => {
                    onSelectTechnique(tech);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-text-secondary" />
                  <span className="font-mono text-xs text-text-muted w-14">{tech.id}</span>
                  <span className="truncate">{tech.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}