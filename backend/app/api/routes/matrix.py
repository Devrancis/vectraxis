import json
from fastapi import APIRouter, HTTPException
from app.core.redis import get_redis
from app.stix.indexer import INDEX_MATRIX_KEY

router = APIRouter()

@router.get("/")
async def get_attack_matrix():
    redis = await get_redis()
    data = await redis.get(INDEX_MATRIX_KEY)
    
    if not data:
        raise HTTPException(status_code=503, detail="Matrix index is still building. Try again in a few seconds.")
        
    return json.loads(data)