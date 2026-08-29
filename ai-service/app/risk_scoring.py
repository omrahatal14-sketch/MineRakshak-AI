"""
Prototype risk scoring.

Deliberately a transparent weighted-factor model rather than a black-box classifier: the
SRS calls for "explainable risk insights showing contributing patterns instead of a
black-box score alone."
"""

from datetime import datetime, timezone, timedelta
from app.firebase_client import db

SEVERITY_WEIGHTS = {"low": 1, "medium": 2, "high": 4, "critical": 7}
LOOKBACK_DAYS = 180


def _parse_datetime(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if hasattr(val, "to_datetime"):
        dt = val.to_datetime()
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    try:
        dt = datetime.fromisoformat(str(val).replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        return None


def _compute_factors(mine_id: str) -> dict:
    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)

    try:
        violations = [
            v.to_dict()
            for v in db.collection("violations").where("mineId", "==", mine_id).stream()
        ]
    except Exception:
        violations = []

    recent_violations = []
    for v in violations:
        dt = _parse_datetime(v.get("detectedAt") or v.get("createdAt"))
        if dt and dt >= cutoff:
            recent_violations.append(v)
    if not recent_violations:
        recent_violations = violations

    severity_sum = sum(SEVERITY_WEIGHTS.get(v.get("severity", "low"), 1) for v in recent_violations)
    open_count = sum(1 for v in recent_violations if v.get("status") in ("open", "in_progress"))

    try:
        action_docs = [a.to_dict() for a in db.collection("correctiveActions").stream()]
    except Exception:
        action_docs = []

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    overdue_actions = sum(
        1 for a in action_docs
        if a.get("mineId") == mine_id and (a.get("targetDate") or "") < today_str and a.get("status") not in ("verified", "closed")
    )

    category_counts: dict[str, int] = {}
    for v in recent_violations:
        cat = v.get("category", "Uncategorized")
        category_counts[cat] = category_counts.get(cat, 0) + 1
    recurring_categories = {c: n for c, n in category_counts.items() if n >= 2}

    return {
        "violation_count": len(recent_violations),
        "severity_weighted_sum": severity_sum,
        "open_or_in_progress": open_count,
        "overdue_corrective_actions": overdue_actions,
        "recurring_categories": recurring_categories,
    }


def _level(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 35:
        return "medium"
    return "low"


def score_mine_risk(mine_id: str) -> dict:
    factors = _compute_factors(mine_id)

    score = (
        min(factors["severity_weighted_sum"], 40) * 1.0
        + min(factors["open_or_in_progress"], 15) * 2.0
        + min(factors["overdue_corrective_actions"], 10) * 3.0
        + min(len(factors["recurring_categories"]), 5) * 4.0
    )
    score = round(min(max(score, 20.0), 100.0), 1)

    result = {
        "mineId": mine_id,
        "score": score,
        "level": _level(score),
        "factors": factors,
        "computedAt": datetime.now(timezone.utc).isoformat(),
    }
    try:
        db.collection("riskScores").add(result)
    except Exception:
        pass
    return result
