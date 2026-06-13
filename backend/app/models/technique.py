from pydantic import BaseModel
from typing import List, Optional

class Reference(BaseModel):
    source_name: str
    url: Optional[str] = None
    external_id: Optional[str] = None

class Mitigation(BaseModel):
    id: str      
    name: str
    description: str

class Technique(BaseModel):
    id: str        
    name: str
    description: str
    tactic_ids: List[str]
    is_subtechnique: bool
    parent_id: Optional[str] = None
    subtechniques: List[str] = []
    platforms: List[str] = []
    data_sources: List[str] = []
    detection: str = ""
    mitigations: List[Mitigation] = []
    references: List[Reference] = []
    mitre_url: str