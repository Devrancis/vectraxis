from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.config import settings
from app.stix.indexer import build_and_cache_indexes
from app.api.routes import matrix, actors, compare

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(build_and_cache_indexes())
    yield

app = FastAPI(title="Vectraxis Threat Intelligence API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the routers
app.include_router(matrix.router, prefix="/api/matrix", tags=["Matrix Heatmap"])
app.include_router(actors.router, prefix="/api/actors", tags=["Threat Actors"])
app.include_router(compare.router, prefix="/api/compare", tags=["Actor Comparison"])

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "Vectraxis API is online and accepting requests."}