import json
import httpx
import os
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.core.redis import get_redis
from app.stix.parser import parse_stix_bundle

STIX_ENTERPRISE_URL = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
RAW_CACHE_KEY = "stix:enterprise:raw"

async def fetch_stix_bundle() -> dict:
    """
    Fetches the raw enterprise ATT&CK STIX bundle from public source.
    Utilizes a streaming client to manage memory allocation gracefully.
    """
    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.get(STIX_ENTERPRISE_URL)
        response.raise_for_status()
        return response.json()

async def load_and_initialize_stix() -> Tuple[dict, dict, dict]:
    """
    Coordinates lifecycle ingestion of STIX metadata. Checks Redis cache
    before falling back to a remote HTTP connection to protect pipeline throughput.
    """
    redis = await get_redis()
    
    # Check if the raw payload is cached locally
    cached_raw = await redis.get(RAW_CACHE_KEY)
    
    if cached_raw:
        print("[VECTRAXIS] Raw STIX cache hit. Initializing parser...")
        raw_bundle = json.loads(cached_raw)
    else:
        print("[VECTRAXIS] Cache miss. Downloading upstream enterprise STIX dataset...")
        raw_bundle = await fetch_stix_bundle()
        
        # Hydrate raw cache string with an explicit TTL setting
        ttl_seconds = settings.STIX_CACHE_TTL_DAYS * 86400
        await redis.setex(RAW_CACHE_KEY, ttl_seconds, json.dumps(raw_bundle))
        print(f"[VECTRAXIS] Successfully cached raw STIX data with {settings.STIX_CACHE_TTL_DAYS} days TTL.")

    # Execute transformation via parser layer
    tactics, techniques, actors = parse_stix_bundle(raw_bundle)
    return tactics, techniques, actors