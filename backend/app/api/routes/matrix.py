import json
import zlib
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
        
    # Unzip the binary payload, decode to string, and parse JSON
    decompressed_string = zlib.decompress(data).decode('utf-8')
    return json.loads(decompressed_string)