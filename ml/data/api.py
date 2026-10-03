from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Fast2SMS configuration (loaded from .env)
FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY", "")
FAST2SMS_URL = os.getenv("FAST2SMS_URL", "https://www.fast2sms.com/dev/bulkV2")

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

# ─────────────────────────────────────────────────────────────
# SMS INTEGRATION — httpSMS webhook + sending API
# ─────────────────────────────────────────────────────────────

# httpSMS configuration (loaded from .env)
HTTPSMS_API_KEY  = os.getenv("HTTPSMS_API_KEY", "")
HTTPSMS_SEND_URL = "https://api.httpsms.com/v1/messages/send"


def send_sms(to_number: str, from_number: str, message: str) -> None:
    """
    Send an SMS reply via the httpSMS API.
    Logs success/failure but never raises so the endpoint always
    returns a clean response to the webhook caller.
    """
    if not HTTPSMS_API_KEY:
        print("[SMS] WARNING: HTTPSMS_API_KEY is not set. Skipping SMS send.")
        return

    if not to_number or not from_number:
        print("[SMS] WARNING: Sender or Receiver number is missing. Skipping SMS send.")
        return

    # Ensure E.164 format
    def format_e164(num: str) -> str:
        num = num.strip()
        if not num.startswith("+"):
            if len(num) == 10:
                return "+91" + num
            return "+" + num
        return num

    to_number = format_e164(to_number)
    from_number = format_e164(from_number)

    payload = {
        "content": message,
        "from":    from_number,
        "to":      to_number,
    }
    headers = {
        "x-api-key": HTTPSMS_API_KEY,
        "Content-Type":  "application/json",
    }

    try:
        response = requests.post(HTTPSMS_SEND_URL, json=payload, headers=headers, timeout=10)
        print(f"[SMS] Sent to {to_number} (from {from_number}) | Status: {response.status_code} | Response: {response.text}")
    except Exception as e:
        print(f"[SMS] Failed to send SMS to {to_number}: {e}")


@app.post("/incoming-sms")
async def incoming_sms(data: dict):
    """
    Receives incoming SMS forwarded by httpSMS webhook.

    Expected JSON:
        {
            "event": "message.phone.received",
            "data": {
                "id": "...",
                "from": "919XXXXXXXXX",
                "to": "your_number",
                "content": "RICE SOUTH24 JUNE 1"
            }
        }

    Parses the content, runs the ML prediction, and sends back
    the result as an SMS to the original sender via httpSMS.
    """
    # ── Log raw webhook payload ─────────────────────────────────
    print(f"[SMS-WEBHOOK] Raw data: {data}")

    # ── Extract fields from httpSMS webhook structure ───────────
    message_data = data.get("data", {})
    sender  = message_data.get("from")
    our_number = message_data.get("to")
    message = message_data.get("content", "") or ""

    print(f"[SMS-IN] From: {sender} | Content: {message}")

    # ── Guard: empty message ────────────────────────────────────
    if not message.strip():
        print("[SMS-IN] Empty message body received. Skipping.")
        return {"status": "ok"}

    try:
        # ── Parse SMS body ──────────────────────────────────────
        parts = message.upper().strip().split()
        if len(parts) < 4:
            raise ValueError(f"Expected ≥4 tokens, got {len(parts)}: {parts}")

        crop  = parts[0].capitalize()   # e.g. "Rice"
        month = parts[2].capitalize()   # e.g. "June"
        area  = float(parts[3])         # e.g. 1.0

        # District hardcoded for now
        district = "South 24 Parganas"

        print(f"[SMS-PARSE] crop={crop}, month={month}, area={area}, district={district}")

        # ── Run ML prediction ───────────────────────────────────
        result = predict_yield({
            "crop":     crop,
            "district": district,
            "area":     area,
            "month":    month,
        })

        print(f"[SMS-PREDICT] Result: {result}")

        # ── Format reply (rounded to 2 decimal places) ──────────
        def _fmt(val):
            try:
                return round(float(val), 2)
            except (TypeError, ValueError):
                return val

        predicted_yield = _fmt(result.get("predicted_yield", "N/A"))
        risk_level      = result.get("risk_level", "N/A")
        lower_bound     = _fmt(result.get("lower_bound",     "N/A"))
        upper_bound     = _fmt(result.get("upper_bound",     "N/A"))

        reply = (
            f"Yield: {predicted_yield}\n"
            f"Risk: {risk_level}\n"
            f"Range: {lower_bound} - {upper_bound}"
        )

    except Exception as e:
        print(f"[SMS-ERROR] Parsing/prediction failed: {e}")
        reply = "Format: RICE SOUTH24 JUNE 1"

    # ── Send SMS reply ──────────────────────────────────────────
    send_sms(to_number=sender, from_number=our_number, message=reply)

    return {"status": "ok"}


# STEP 8 — Add server runner
if __name__ == "__main__":
    import uvicorn
    # Use "api:app" so reload works correctly
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)