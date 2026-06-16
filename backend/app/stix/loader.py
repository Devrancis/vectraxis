import httpx
from typing import Dict, Any, Tuple
from app.stix.parser import parse_stix_bundle

STIX_ENTERPRISE_URL = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"

async def fetch_stix_bundle() -> dict:
    """
    Fetches the raw enterprise ATT&CK STIX bundle from public source.
    """

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.get(STIX_ENTERPRISE_URL)
        response.raise_for_status()
        return response.json()

async def load_and_initialize_stix() -> Tuple[dict, dict, dict]:
    """
    Downloads the upstream STIX dataset and passes it directly to the parser.
    We bypass caching the raw bundle to strictly avoid Upstash 10MB limits.
    """
    print("[VECTRAXIS] Downloading upstream enterprise STIX dataset...")
    raw_bundle = await fetch_stix_bundle()
    
    print("[VECTRAXIS] Download complete. Executing transformation via parser layer...")
    # Execute transformation via parser layer
    tactics, techniques, actors = parse_stix_bundle(raw_bundle)
    
    return tactics, techniques, actors