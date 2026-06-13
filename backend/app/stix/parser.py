import re
from typing import Dict, Any, List, Tuple
from app.models.technique import Technique, Reference, Mitigation
from app.models.actor import Actor, ActorTechniqueUsage
from app.models.tactic import Tactic

# Tactic display ordering map defined explicitly by MITRE hierarchy
TACTIC_ORDER_MAP = {
    "reconnaissance": 0, "resource-development": 1, "initial-access": 2,
    "execution": 3, "persistence": 4, "privilege-escalation": 5,
    "defense-evasion": 6, "credential-access": 7, "discovery": 8,
    "lateral-movement": 9, "collection": 10, "command-and-control": 11,
    "exfiltration": 12, "impact": 13
}

COUNTRIES_KEYWORDS = {
    "Russia": ["russia", "apt28", "fancy bear", "cozy bear"],
    "China": ["china", "apt41", "comment crew", "wicked panda"],
    "Iran": ["iran", "oilrig", "muddywater", "charming kitten"],
    "North Korea": ["north korea", "lazarus", "kimsuky", "andariel"]
}

def infer_country(description: str, name: str) -> Optional[str]:
    combined = f"{name} {description}".lower()
    for country, keywords in COUNTRIES_KEYWORDS.items():
        if any(keyword in combined for keyword in keywords):
            return country
    return None

def parse_stix_bundle(raw_data: dict) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
    objects = raw_data.get("objects", [])
    
    tactics_raw = {}
    techniques_raw = {}
    actors_raw = {}
    mitigations_raw = {}
    relationships = []

    # First Pass: Segregate raw types
    for obj in objects:
        obj_type = obj.get("type")
        if obj.get("revoked") or obj.get("x_mitre_deprecated"):
            continue

        if obj_type == "x-mitre-tactic":
            tactics_raw[obj["id"]] = obj
        elif obj_type == "attack-pattern":
            techniques_raw[obj["id"]] = obj
        elif obj_type == "intrusion-set":
            actors_raw[obj["id"]] = obj
        elif obj_type == "course-of-action":
            mitigations_raw[obj["id"]] = obj
        elif obj_type == "relationship":
            relationships.append(obj)

    # Process Tactics
    tactics: Dict[str, Any] = {}
    for sid, obj in tactics_raw.items():
        short_name = obj.get("x_mitre_shortname", "")
        order = TACTIC_ORDER_MAP.get(short_name, 99)
        ext_refs = obj.get("external_references", [])
        mitre_id = next((r["external_id"] for r in ext_refs if r["source_name"] == "mitre-attack"), sid)
        
        tactics[short_name] = Tactic(
            id=mitre_id,
            name=obj.get("name", ""),
            description=obj.get("description", ""),
            short_name=short_name,
            order=order
        ).model_dump()

    # Process Mitigations
    mitigations_map: Dict[str, Mitigation] = {}
    for sid, obj in mitigations_raw.items():
        ext_refs = obj.get("external_references", [])
        mitre_id = next((r["external_id"] for r in ext_refs if r["source_name"] == "mitre-attack"), None)
        if mitre_id:
            mitigations_map[sid] = Mitigation(
                id=mitre_id,
                name=obj.get("name", ""),
                description=obj.get("description", "")
            )

    # Process Techniques
    techniques: Dict[str, Any] = {}
    for sid, obj in techniques_raw.items():
        ext_refs = obj.get("external_references", [])
        mitre_id = next((r["external_id"] for r in ext_refs if r["source_name"] == "mitre-attack"), None)
        mitre_url = next((r["url"] for r in ext_refs if r["source_name"] == "mitre-attack"), "")
        
        if not mitre_id:
            continue

        is_sub = obj.get("x_mitre_is_subtechnique", False)
        parent_id = mitre_id.split(".")[0] if is_sub else None
        
        t_ids = [phase["phase_name"] for phase in obj.get("kill_chain_phases", []) if phase["kill_chain_name"] == "mitre-attack"]

        techniques[mitre_id] = Technique(
            id=mitre_id,
            name=obj.get("name", ""),
            description=obj.get("description", ""),
            tactic_ids=t_ids,
            is_subtechnique=is_sub,
            parent_id=parent_id,
            platforms=obj.get("x_mitre_platforms", []),
            data_sources=obj.get("x_mitre_data_sources", []),
            detection=obj.get("x_mitre_detection", ""),
            references=[Reference(**ref) for ref in ext_refs],
            mitre_url=mitre_url
        ).model_dump()

    # Resolve Subtechnique arrays and Mitigations via Relationship map
    for rel in relationships:
        source = rel.get("source_ref", "")
        target = rel.get("target_ref", "")
        rel_type = rel.get("relationship_type", "")

        # Mitigation mappings
        if rel_type == "mitigates" and source in mitigations_map:
            target_obj = techniques_raw.get(target)
            if target_obj:
                t_ext_refs = target_obj.get("external_references", [])
                t_mitre_id = next((r["external_id"] for r in t_ext_refs if r["source_name"] == "mitre-attack"), None)
                if t_mitre_id and t_mitre_id in techniques:
                    techniques[t_mitre_id]["mitigations"].append(mitigations_map[source].model_dump())

    # Update child lists for parents
    for tid, tech in list(techniques.items()):
        if tech["is_subtechnique"] and tech["parent_id"] in techniques:
            techniques[tech["parent_id"]]["subtechniques"].append(tid)

    # Process Actors
    actors: Dict[str, Any] = {}
    for sid, obj in actors_raw.items():
        ext_refs = obj.get("external_references", [])
        mitre_id = next((r["external_id"] for r in ext_refs if r["source_name"] == "mitre-attack"), "Unknown")
        mitre_url = next((r["url"] for r in ext_refs if r["source_name"] == "mitre-attack"), "")
        name = obj.get("name", "")
        desc = obj.get("description", "")

        actors[sid] = Actor(
            id=sid,
            mitre_id=mitre_id,
            name=name,
            aliases=obj.get("aliases", []),
            description=desc,
            country=infer_country(desc, name),
            first_seen=obj.get("first_seen"),
            mitre_url=mitre_url
        ).model_dump()

    # Append mapped usage descriptors from structural relationships
    for rel in relationships:
        if rel.get("relationship_type") == "uses":
            source = rel.get("source_ref", "") # Could be actor
            target = rel.get("target_ref", "") # Could be technique
            
            if source in actors_raw and target in techniques_raw:
                t_obj = techniques_raw[target]
                t_refs = t_obj.get("external_references", [])
                t_mitre_id = next((r["external_id"] for r in t_refs if r["source_name"] == "mitre-attack"), None)
                
                if t_mitre_id and t_mitre_id in techniques:
                    # Map to the first tactic it matches or fallback generic
                    t_tactics = techniques[t_mitre_id]["tactic_ids"]
                    tactic_scope = t_tactics[0] if t_tactics else "unknown"
                    
                    usage = ActorTechniqueUsage(
                        technique_id=t_mitre_id,
                        tactic_id=tactic_scope,
                        use_description=rel.get("description", "No detailed tactical description available.")
                    )
                    actors[source]["techniques_used"].append(usage.model_dump())

    return tactics, techniques, actors