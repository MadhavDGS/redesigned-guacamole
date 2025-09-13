from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

# Simple rules engine scaffold
# Each rule checks eligibility and yields a score contribution

class Rule:
    def __init__(self, name: str, check):
        self.name = name
        self.check = check  # (profile) -> (eligible: bool, score: int, reason: str)

# Example rules
RULES: List[Rule] = [
    Rule("PM-KISAN-smallholder", lambda p: (
        p.get("land_holding_ha", 0) <= 2.0 and p.get("is_farmer", False),
        20,
        "Smallholder farmer"
    )),
    Rule("JalJeevan-water-gap", lambda p: (
        p.get("has_tap_water", False) is False,
        15,
        "No tap water connection"
    )),
    Rule("MGNREGA-labor", lambda p: (
        p.get("unemployment_rate", 0) >= 0.2,
        10,
        "High unemployment"
    )),
]

@router.post("/evaluate")
async def evaluate(profile: Dict[str, Any]):
    recs = []
    total = 0
    for r in RULES:
        eligible, score, reason = r.check(profile)
        if eligible:
            total += score
            recs.append({"rule": r.name, "score": score, "reason": reason})
    return {"total_score": total, "recommendations": recs}