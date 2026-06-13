from pydantic import BaseModel
from typing import List, Optional
from app.models.technique import Reference

class ActorTechniqueUsage(BaseModel):
    technique_id: str
    tactic_id: str
    use_description: str

class Actor(BaseModel):
    id: str         
    mitre_id: str    
    name: str     
    aliases: List[str] = []
    description: str
    country: Optional[str] = None
    first_seen: Optional[str] = None
    techniques_used: List[ActorTechniqueUsage] = []
    software_used: List[str] = []
    references: List[Reference] = []
    mitre_url: str