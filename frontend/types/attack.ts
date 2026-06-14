export interface Reference {
  source_name: string;
  url?: string;
  external_id?: string;
}

export interface Mitigation {
  id: string;
  name: string;
  description: string;
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  tactic_ids: string[];
  is_subtechnique: boolean;
  parent_id: string | null;
  subtechniques: string[];
  platforms: string[];
  data_sources: string[];
  detection: string;
  mitigations: Mitigation[];
  references: Reference[];
  mitre_url: string;
  actor_count: number;
}

export interface Tactic {
  id: string;
  name: string;
  description: string;
  short_name: string;
  order: number;
  techniques: Technique[];
  technique_count: number;
}

export interface MatrixData {
  tactics: Tactic[];
  total_actors: number;
  total_techniques: number;
}

export interface ActorTechniqueRef {
  technique_id: string;
  name?: string; 
}

export interface Actor {
  id: string;
  name: string;
  country?: string;
  associated_groups?: string[];
  techniques_used?: ActorTechniqueRef[];
}