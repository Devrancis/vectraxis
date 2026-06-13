import json
from typing import Dict, Any, List
from app.core.redis import get_redis
from app.stix.loader import load_and_initialize_stix

INDEX_MATRIX_KEY = "stix:index:matrix"
INDEX_ACTORS_KEY = "stix:index:actors"

async def build_and_cache_indexes() -> Dict[str, Any]:
    """
    Parses and builds lookups from domain maps, storing optimized indices
    in Redis to power real-time frontend heatmaps and actor comparisons.
    """
    redis = await get_redis()
    
    # Process files from source pipeline
    tactics, techniques, actors = await load_and_initialize_stix()
    
    # Build structural Matrix schema grouping techniques under tactics
    matrix_tactics = []
    total_techniques_count = 0
    
    # Calculate global tracking frequencies per technique to build heatmaps
    technique_actor_counts: Dict[str, int] = {}
    technique_to_actors_map: Dict[str, List[dict]] = {}
    
    for actor_id, actor in actors.items():
        for usage in actor["techniques_used"]:
            tid = usage["technique_id"]
            technique_actor_counts[tid] = technique_actor_counts.get(tid, 0) + 1
            
            if tid not in technique_to_actors_map:
                technique_to_actors_map[tid] = []
            
            technique_to_actors_map[tid].append({
                "actor_id": actor_id,
                "actor_name": actor["name"],
                "usage": usage["use_description"]
            })

    # Assemble hierarchical structure for matrix view
    for short_name, tactic in sorted(tactics.items(), key=lambda x: x[1]["order"]):
        tactic_techniques = []
        
        for tid, tech in techniques.items():
            if short_name in tech["tactic_ids"]:
                # Hydrate the dynamic actor statistics fields inside the technique node
                tech_copy = tech.copy()
                tech_copy["actor_count"] = technique_actor_counts.get(tid, 0)
                tactic_techniques.append(tech_copy)
                total_techniques_count += 1
                
        tactic_node = tactic.copy()
        tactic_node["techniques"] = sorted(tactic_techniques, key=lambda x: x["id"])
        tactic_node["technique_count"] = len(tactic_techniques)
        matrix_tactics.append(tactic_node)

    matrix_payload = {
        "tactics": matrix_tactics,
        "total_actors": len(actors),
        "total_techniques": len(techniques)
    }

    # Hydrate actor records with technique usage data counts
    processed_actors = []
    for aid, actor in actors.items():
        actor_copy = actor.copy()
        actor_copy["technique_count"] = len(actor["techniques_used"])
        processed_actors.append(actor_copy)

    # Save finalized analytical indices down to the caching tier
    await redis.set(INDEX_MATRIX_KEY, json.dumps(matrix_payload))
    await redis.set(INDEX_ACTORS_KEY, json.dumps({
        "actors": processed_actors,
        "techniques_raw": techniques,
        "technique_mappings": technique_to_actors_map
    }))
    
    print("[VECTRAXIS] Memory index caches compiled successfully.")
    return matrix_payload