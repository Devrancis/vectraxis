import asyncio
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import redis_client
from app.stix.indexer import build_and_cache_indexes
from app.api.routes import matrix, actors, compare

# Track initialization worker task at module level
_stix_sync_task: asyncio.Task | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _stix_sync_task
    print("[VECTRAXIS-LIFECYCLE] Initializing backend services...")
    
    try:
        # Ping Redis to verify connectivity before starting
        await redis_client.ping()
        print("[VECTRAXIS-LIFECYCLE] Connection to Redis verified successfully.")
    except Exception as e:
        print(f"[VECTRAXIS-LIFECYCLE] CRITICAL: Failed to connect to Redis: {e}", file=sys.stderr)
        # Gracefully terminate application startup if prerequisites aren't met
        sys.exit(1)

    # Spawn the background sync worker task safely
    print("[VECTRAXIS-LIFECYCLE] Spawning STIX synchronization background worker...")
    _stix_sync_task = asyncio.create_task(build_and_cache_indexes())

    yield

    print("[VECTRAXIS-LIFECYCLE] Shutdown signal received. Starting graceful cleanup...")
    
    if _stix_sync_task and not _stix_sync_task.done():
        print("[VECTRAXIS-LIFECYCLE] Canceling active STIX indexing worker task...")
        _stix_sync_task.cancel()
        try:
            await _stix_sync_task
        except asyncio.CancelledError:
            print("[VECTRAXIS-LIFECYCLE] Active STIX indexing task terminated safely.")

    print("[VECTRAXIS-LIFECYCLE] Closing active Redis connection pools...")
    await redis_client.aclose()
    print("[VECTRAXIS-LIFECYCLE] All connections closed. Backend offline.")

app = FastAPI(
    title="Vectraxis Threat Intelligence API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount functional sub-routes
app.include_router(matrix.router, prefix="/api/matrix", tags=["Matrix Heatmap"])
app.include_router(actors.router, prefix="/api/actors", tags=["Threat Actors"])
app.include_router(compare.router, prefix="/api/compare", tags=["Actor Comparison"])

@app.get("/health", tags=["System"])
async def health_check():
    is_syncing = _stix_sync_task is not None and not _stix_sync_task.done()
    return {
        "status": "online",
        "services": {
            "api": "healthy",
            "background_stix_sync": "running" if is_syncing else "completed/idle"
        }
    }