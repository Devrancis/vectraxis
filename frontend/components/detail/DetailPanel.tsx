"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Shield, Terminal, Globe, Layers } from "lucide-react";
import { Technique } from "@/types/attack";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DetailPanelProps {
  technique: Technique | null;
  onClose: () => void;
}

export default function DetailPanel({ technique, onClose }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {technique && (
        <motion.div
          initial={{ translateX: "100%" }}
          animate={{ translateX: 0 }}
          exit={{ translateX: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          className="w-[450px] h-full bg-bg-surface border-l border-border shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col shrink-0 z-50 overflow-hidden"
        >
          {/* Header section */}
          <div className="p-4 bg-bg-raised border-b border-border flex items-start justify-between">
            <div>
              <div className="font-mono text-xs font-semibold text-accent tracking-wider">
                {technique.id}
              </div>
              <h2 className="font-display text-lg font-bold text-text-primary mt-1 pr-6 leading-tight">
                {technique.name}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-bg-base border border-transparent hover:border-border rounded transition-colors text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details Scrollable Content Body */}
          <ScrollArea className="flex-1">
            <div className="p-4 flex flex-col gap-5 pb-12">
              
              {/* Badges for Target Environments / Platforms */}
              <div className="flex flex-wrap gap-1.5">
                {technique.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="bg-bg-base font-mono border-border text-[10px] text-text-secondary">
                    {platform}
                  </Badge>
                ))}
              </div>

              {/* Description Section */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-accent" /> Description
                </span>
                <p className="text-sm text-text-secondary leading-relaxed bg-bg-base/30 p-3 rounded border border-border/40 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {technique.description || "No tactical analytical description available for this structural profile entry."}
                </p>
              </div>

              <Separator className="bg-border/60" />

              {/* Sub-techniques */}
              {technique.subtechniques && technique.subtechniques.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" /> Sub-techniques
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {technique.subtechniques.map((subId) => (
                      <div key={subId} className="font-mono text-xs bg-bg-base border border-border/50 px-2 py-1.5 rounded text-text-secondary">
                        {subId}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detection Protocols */}
              {technique.detection && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-accent" /> Detection Strategy
                  </span>
                  <div className="text-xs font-mono text-text-secondary bg-bg-base border border-border/80 p-3 rounded leading-normal overflow-x-auto whitespace-pre-wrap max-h-40">
                    {technique.detection}
                  </div>
                </div>
              )}

              {/* Engineering Mitigations */}
              {technique.mitigations && technique.mitigations.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-accent" /> Defensive Countermeasures
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {technique.mitigations.map((mit, index) => (
                      <div key={mit.id || index} className="text-xs bg-bg-raised border border-border p-2.5 rounded flex flex-col gap-1">
                        <span className="font-mono text-accent font-medium">{mit.id}: {mit.name}</span>
                        <p className="text-text-secondary leading-normal">{mit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External References link */}
              <div className="mt-2 text-center">
                <a 
                  href={technique.mitre_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-mono text-accent hover:underline bg-accent/5 px-3 py-2 border border-accent/20 rounded"
                >
                  View full documentation on attack.mitre.org →
                </a>
              </div>

            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}