import json
import zlib
import base64
from fastapi import APIRouter, HTTPException
from app.core.redis import get_redis
from app.stix.indexer import INDEX_MATRIX_KEY

router = APIRouter()

@router.get("")
async def get_attack_matrix():
    redis = await get_redis()
    # Fetch the compressed binary payload from Upstash
    data = await redis.get(INDEX_MATRIX_KEY)
    
    if not data:
        raise HTTPException(status_code=503, detail="Matrix index is still building. Try again in a few seconds.")
        
    # Process the Base64 encoded, zlib compressed string safely
    raw_bytes = base64.b64decode(data)
    decompressed_string = zlib.decompress(raw_bytes).decode('utf-8')
    return json.loads(decompressed_string)