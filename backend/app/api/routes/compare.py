import json
import zlib
from fastapi import APIRouter, HTTPException
from app.core.redis import get_redis
from app.stix.indexer import INDEX_ACTORS_KEY

router = APIRouter()

@router.get("")
async def compare_actors(actor1: str, actor2: str):
    redis = await get_redis()
    # Fetch the compressed binary payload from Upstash
    data = await redis.get(INDEX_ACTORS_KEY)
    
    if not data:
        raise HTTPException(status_code=503, detail="Index not ready.")
        
    # Unzip the binary payload, decode to string, and parse JSON
    decompressed_string = zlib.decompress(data).decode('utf-8')
    parsed_data = json.loads(decompressed_string)
    actors = parsed_data.get("actors", [])
    
    a1_data = next((a for a in actors if a["id"] == actor1 or a["mitre_id"] == actor1), None)
    a2_data = next((a for a in actors if a["id"] == actor2 or a["mitre_id"] == actor2), None)
    
    if not a1_data or not a2_data:
        raise HTTPException(status_code=404, detail="One or both threat actors not found.")
        
    a1_techs = set(t["technique_id"] for t in a1_data["techniques_used"])
    a2_techs = set(t["technique_id"] for t in a2_data["techniques_used"])
    
    shared = list(a1_techs.intersection(a2_techs))
    total_unique = len(a1_techs.union(a2_techs))
    overlap_percentage = (len(shared) / total_unique * 100) if total_unique > 0 else 0.0
    
    return {
        "actor1": a1_data,
        "actor2": a2_data,
        "shared_techniques": shared,
        "only_actor1": list(a1_techs - a2_techs),
        "only_actor2": list(a2_techs - a1_techs),
        "overlap_percentage": round(overlap_percentage, 1)
    }