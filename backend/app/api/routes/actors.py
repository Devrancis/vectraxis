import json
import zlib
import base64
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.redis import get_redis
from app.stix.indexer import INDEX_ACTORS_KEY

router = APIRouter()

@router.get("")
async def get_all_actors(industry: Optional[str] = None, country: Optional[str] = None):
    redis = await get_redis()
    # Fetch the compressed binary payload from Upstash
    data = await redis.get(INDEX_ACTORS_KEY)
    
    if not data:
        raise HTTPException(status_code=503, detail="Actors index not ready.")
    
    # Process the Base64 encoded, zlib compressed string safely
    raw_bytes = base64.b64decode(data)
    decompressed_string = zlib.decompress(raw_bytes).decode('utf-8')
    parsed_data = json.loads(decompressed_string)
    actors = parsed_data.get("actors", [])
    
    # Apply query filters dynamically
    if country:
        actors = [a for a in actors if a.get("country") and a["country"].lower() == country.lower()]
        
    if industry:
        actors = [a for a in actors if industry.lower() in a.get("description", "").lower()]
        
    return actors

@router.get("/{actor_id}")
async def get_actor_detail(actor_id: str):
    redis = await get_redis()
    # Fetch the compressed binary payload from Upstash
    data = await redis.get(INDEX_ACTORS_KEY)
    
    if not data:
        raise HTTPException(status_code=503, detail="Actors index not ready.")
        
    # Process the Base64 encoded, zlib compressed string safely
    raw_bytes = base64.b64decode(data)
    decompressed_string = zlib.decompress(raw_bytes).decode('utf-8')
    parsed_data = json.loads(decompressed_string)
    actors = parsed_data.get("actors", [])
    
    for actor in actors:
        if actor["id"] == actor_id or actor["mitre_id"] == actor_id:
            return actor
            
    raise HTTPException(status_code=404, detail="Actor not found in dataset")