from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.risk_scoring import score_mine_risk
from app.anomaly_detection import detect_anomalies
from app.prioritization import prioritize_inspections
from app.image_analysis import analyze_hazard_image

app = FastAPI(title="MineRakshak AI Service", version="0.1.0")


class MineRequest(BaseModel):
    mineId: str


class ImageAnalysisRequest(BaseModel):
    fileName: Optional[str] = ""
    contextText: Optional[str] = ""
    mineId: Optional[str] = "KCM-01"


@app.get("/health")
def health():
    return {"status": "ok", "service": "minerakshak-ai-service"}


@app.post("/risk-score")
def risk_score(req: MineRequest):
    try:
        return score_mine_risk(req.mineId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/anomaly-detection")
def anomaly_detection(req: MineRequest):
    try:
        return detect_anomalies(req.mineId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/prioritization")
def prioritization():
    try:
        return {"ranking": prioritize_inspections()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-hazard-image")
def analyze_image(req: ImageAnalysisRequest):
    try:
        return analyze_hazard_image(
            file_name=req.fileName or "",
            context_text=req.contextText or "",
            mine_id=req.mineId or "KCM-01",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
