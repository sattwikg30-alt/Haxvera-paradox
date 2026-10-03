from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Add current directory to path so we can import predict
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from predict import predict_yield

app = FastAPI(title="Agri Yield Prediction ML API")

# STEP 7 — Add CORS (important for Next.js access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# PART 2 — Improve PredictionInput schema
class PredictionInput(BaseModel):
    crop: str
    district: str
    area: float
    month: str
    
    # Climate fields
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    humidity: Optional[float] = None
    solar: Optional[float] = None
    soil: Optional[float] = None
    
    # Coordinates
    lat: Optional[float] = None
    lon: Optional[float] = None

# STEP 4 — Root test endpoint
@app.get("/")
def read_root():
    return {"status": "ML API running"}

# PART 3 — Add health endpoint
@app.get("/health")
def health():
    return {"status": "ok"}

# STEP 5 — Prediction endpoint
@app.post("/predict")
def predict(input_data: PredictionInput):
    # STEP 6 — Error handling
    try:
        # Convert Pydantic model to dict
        data = input_data.dict()
        # Call prediction function
        result = predict_yield(data)
        return result
    except ValueError as e:
        # Validation errors from predict.py
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # General server errors
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# PART 5 — Add test endpoint inside api.py
@app.get("/test")
def test_prediction():
    sample_data = {
        "crop": "Rice",
        "district": "Nadia",
        "area": 2.0,
        "month": "January",
        "temperature": 25.0,
        "rainfall": 100.0,
        "humidity": 60.0
    }
    try:
        result = predict_yield(sample_data)
        return {
            "message": "Sample prediction successful",
            "input": sample_data,
            "output": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# STEP 8 — Add server runner
if __name__ == "__main__":
    import uvicorn
    # Use "api:app" so reload works correctly
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)