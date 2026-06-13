from pydantic import BaseModel
from typing import List

class Tactic(BaseModel):
    id: str     
    name: str       
    description: str
    short_name: str 
    order: int      