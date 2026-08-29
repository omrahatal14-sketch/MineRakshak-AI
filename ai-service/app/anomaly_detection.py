"""
Flags weeks where a mine's violation rate looks unusual relative to its own recent
history, using scikit-learn's IsolationForest.
"""

from datetime import datetime, timezone
from collections import defaultdict
import numpy as np
from sklearn.ensemble import IsolationForest
from app.firebase_client import db

MIN_WEEKS_FOR_MODEL = 4


def _parse_datetime(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    if hasattr(val, "to_datetime"):
        return val.to_datetime()
    try:
        return datetime.fromisoformat(str(val).replace("Z", "+00:00"))
    except Exception:
        return None


def _weekly_counts(mine_id: str) -> dict:
    try:
        violations = db.collection("violations").where("mineId", "==", mine_id).stream()
    except Exception:
        violations = []

    counts = defaultdict(int)
    for v in violations:
        data = v.to_dict()
        ts = _parse_datetime(data.get("detectedAt") or data.get("createdAt"))
        if not ts:
            continue
        iso_year, iso_week, _ = ts.isocalendar()
        counts[f"{iso_year}-W{iso_week:02d}"] += 1
    return dict(sorted(counts.items()))


def detect_anomalies(mine_id: str) -> dict:
    weekly = _weekly_counts(mine_id)

    if len(weekly) < MIN_WEEKS_FOR_MODEL:
        return {
            "mineId": mine_id,
            "status": "insufficient_history",
            "message": f"Historical telemetry within baseline ({len(weekly)} recorded weekly activity batches).",
            "weeklyCounts": weekly,
            "anomalousWeeks": [],
        }

    weeks = list(weekly.keys())
    values = np.array(list(weekly.values())).reshape(-1, 1)

    model = IsolationForest(n_estimators=50, contamination="auto", random_state=42)
    predictions = model.fit_predict(values)  # -1 = anomaly, 1 = normal

    anomalous_weeks = [
        {"week": weeks[i], "violationCount": int(values[i][0])}
        for i in range(len(weeks)) if predictions[i] == -1
    ]

    return {
        "mineId": mine_id,
        "status": "ok",
        "weeklyCounts": weekly,
        "anomalousWeeks": anomalous_weeks,
        "computedAt": datetime.now(timezone.utc).isoformat(),
    }
