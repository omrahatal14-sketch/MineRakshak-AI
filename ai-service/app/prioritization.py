from app.firebase_client import db
from app.risk_scoring import score_mine_risk


def prioritize_inspections() -> list[dict]:
    mines = [{"id": m.id, **m.to_dict()} for m in db.collection("mines").stream()]
    ranked = []
    for mine in mines:
        risk = score_mine_risk(mine["id"])
        ranked.append({
            "mineId": mine["id"],
            "mineName": mine.get("name"),
            "riskScore": risk["score"],
            "riskLevel": risk["level"],
            "topFactors": risk["factors"],
        })
    ranked.sort(key=lambda r: r["riskScore"], reverse=True)
    for i, r in enumerate(ranked, start=1):
        r["priorityRank"] = i
    return ranked
