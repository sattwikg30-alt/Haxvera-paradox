import pandas as pd
import numpy as np
import os
import joblib

# STEP 1 — Load required models globally
MODEL_DIR = 'ml'
models = {
    "q20": joblib.load(os.path.join(MODEL_DIR, "model_q20.pkl")),
    "q50": joblib.load(os.path.join(MODEL_DIR, "model_q50.pkl")),
    "q80": joblib.load(os.path.join(MODEL_DIR, "model_q80.pkl")),
    "point": joblib.load(os.path.join(MODEL_DIR, "model_point.pkl"))
}
features = joblib.load(os.path.join(MODEL_DIR, "features.pkl"))

# PRE-LOADING DATA FOR MAPPINGS (Steps 3, 4, 12)
DATA_PATH = os.path.join('ml', 'data', 'crop_production.csv')
PROCESSED_DATA_PATH = os.path.join('ml', 'data', 'processed.csv')

def build_mappings():
    """Builds crop and district mappings following preprocess.py logic."""
    df_raw = pd.read_csv(DATA_PATH)
    
    # Preprocessing steps matching preprocess.py
    df_raw = df_raw.rename(columns={'Crop_Year': 'year'}).dropna()
    df_raw = df_raw[(df_raw['Area'] > 0) & (df_raw['Production'] > 0)]
    df_raw['Season'] = df_raw['Season'].str.strip()
    
    # Filter rare crops (preprocess.py logic)
    crop_counts = df_raw["Crop"].value_counts()
    threshold = 1000
    valid_crops = crop_counts[crop_counts >= threshold].index
    df_filtered = df_raw[df_raw["Crop"].isin(valid_crops)].copy()
    
    # Create codes using categorical encoding
    df_filtered['crop_code'] = df_filtered['Crop'].astype('category').cat.codes
    df_filtered['district_code'] = df_filtered['District_Name'].astype('category').cat.codes
    
    # Build crop mapping (Step 3)
    crop_map = dict(zip(df_filtered['Crop'].str.lower(), df_filtered['crop_code']))
    
    # Build district mapping (Step 4)
    # Normalize names: uppercase, strip spaces
    df_filtered['district_normalized'] = df_filtered['District_Name'].str.upper().str.strip()
    district_map = dict(zip(df_filtered['district_normalized'], df_filtered['district_code']))
    
    # Most common district for fallback
    most_common_district_code = df_filtered['district_code'].mode()[0]
    
    # Build crop mean for absolute yield conversion (Step 12)
    # log_yield = log1p(yield) from final_dataset.csv
    df_final = pd.read_csv(os.path.join('ml', 'data', 'final_dataset.csv'))
    df_final['yield_log'] = np.log1p(df_final['yield'])
    crop_means = df_final.groupby('crop_code')['yield_log'].mean().to_dict()
    
    return crop_map, district_map, most_common_district_code, crop_means

CROP_MAP, DISTRICT_MAP, MOST_COMMON_DISTRICT_CODE, CROP_MEANS = build_mappings()

# STEP 2 — Create input conversion functions
def normalize_crop_name(crop_name):
    return crop_name.lower().strip()

def normalize_district(district_name):
    return district_name.upper().strip()

def month_to_season_code(month):
    """Converts month to season code (Step 5)."""
    month = month.capitalize()
    kharif_months = ["June", "July", "August", "September"]
    rabi_months = ["October", "November", "December", "January", "February"]
    summer_months = ["March", "April", "May"]
    
    if month in kharif_months:
        return 0
    elif month in rabi_months:
        return 1
    elif month in summer_months:
        return 2
    else:
        return 3 # Whole year fallback

def acre_to_hectare(acres):
    """Converts acres to hectares (Step 6)."""
    return acres * 0.4047

# Improvement 3 — Input validation
def validate_inputs(input_dict):
    """Validates prediction inputs (Step 3)."""
    if float(input_dict.get("area", 0)) <= 0:
        raise ValueError("Area must be greater than 0.")
    
    crop_name = normalize_crop_name(input_dict.get("crop", ""))
    if not crop_name or crop_name not in CROP_MAP:
        raise ValueError(f"Crop '{crop_name}' not found or invalid.")
    
    month = input_dict.get("month", "").capitalize()
    valid_months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    if month not in valid_months:
        raise ValueError(f"Month '{month}' is invalid.")
    
    if not input_dict.get("district", "").strip():
        raise ValueError("District name cannot be empty.")

# Fix 1 — Remove random climate generation
def generate_climate_features(input_dict):
    """Returns climate features from input with safe None handling and estimates (Step 7)."""
    
    def get_safe(key, default):
        val = input_dict.get(key)
        return val if val is not None else default

    # 1 Fix None climate handling
    temp = get_safe("temperature", 25.0)
    rain = get_safe("rainfall", 100.0)
    hum = get_safe("humidity", 60.0)
    
    # 3 Add solar estimate (Basic estimate if missing)
    # Solar radiation usually ranges from 15-25 based on cloud cover/month
    solar = get_safe("solar", 18.0)
    
    # 4 Add soil estimate (Basic estimate if missing)
    # Soil wetness is usually 0.3-0.8 based on rainfall
    soil = get_safe("soil", 0.5)

    return {
        "season_temperature": temp,
        "season_rainfall": rain,
        "season_humidity": hum,
        "season_solar": solar,
        "season_soil": soil
    }

# STEP 11 — Prediction pipeline
def predict_yield(input_dict):
    """
    Main prediction function that matches train.py logic exactly.
    """
    # Improvement 3 — Input validation
    validate_inputs(input_dict)
            
    # Normalize inputs
    crop_name = normalize_crop_name(input_dict["crop"])
    district_name = normalize_district(input_dict["district"])
    acres = float(input_dict["area"])
    month = input_dict["month"]
    
    # Get mappings
    crop_code = CROP_MAP[crop_name]
    
    # Improvement 2 — Better district fallback
    district_code = DISTRICT_MAP.get(district_name)
    if district_code is None:
        print("District not found, using fallback")
        district_code = MOST_COMMON_DISTRICT_CODE
        
    season_code = month_to_season_code(month)
    
    # Area conversion (Step 6)
    hectare = acre_to_hectare(acres)
    area_log = np.log1p(hectare)
    
    # Fix 2 & 3 — Accept climate fields and keep lat/lon
    climate = generate_climate_features(input_dict)
    
    # STEP 8 — Climate interaction features
    climate["temp_humidity"] = climate["season_temperature"] * climate["season_humidity"]
    climate["rain_soil"] = climate["season_rainfall"] * climate["season_soil"]
    climate["temp_soil"] = climate["season_temperature"] * climate["season_soil"]
    climate["rain_solar"] = climate["season_rainfall"] * climate["season_solar"]
    climate["humidity_solar"] = climate["season_humidity"] * climate["season_solar"]
    
    # STEP 9 — Climate anomaly features (Step 9)
    climate["rain_anomaly"] = 0
    climate["temp_anomaly"] = 0
    climate["humidity_anomaly"] = 0
    
    # STEP 10 — Feature vector creation
    data = {
        "Area": area_log,
        "crop_code": crop_code,
        "district_code": district_code,
        "season_code": season_code,
        **climate
    }
    
    df = pd.DataFrame([data])
    
    # Ensure column order matches features.pkl
    df = df[features]
    
    # Improvement 5 — Add prediction debug logging
    print("Feature vector used:")
    print(df.head())
    
    # Predict (Step 11)
    q20 = models["q20"].predict(df)[0]
    q50 = models["q50"].predict(df)[0]
    q80 = models["q80"].predict(df)[0]
    
    # Prevent quantile crossing
    q20 = min(q20, q50)
    q80 = max(q80, q50)
    
    # Point model prediction
    point = models["point"].predict(df)[0]
    
    # Blend
    relative_yield = 0.7 * q50 + 0.3 * point
    
    # Improvement 1 — Safe crop mean lookup
    crop_mean = CROP_MEANS.get(
        crop_code, 
        np.mean(list(CROP_MEANS.values()))
    )
    
    def to_absolute(rel):
        log_yield = rel + crop_mean
        return np.expm1(log_yield)
    
    absolute_yield = to_absolute(relative_yield)
    lower_bound = to_absolute(q20)
    upper_bound = to_absolute(q80)
    median_yield = to_absolute(q50) # q50 for risk calculation
    
    # STEP 13 — Risk calculation
    # risk = (q80 - q20) / (q50 + 0.5)
    risk_score = (upper_bound - lower_bound) / (median_yield + 0.5)
    
    if risk_score < 0.6:
        risk_level = "LOW"
    elif risk_score < 1.2:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
    
    # STEP 14 — Output format (Improvement 6: return dict only)
    return {
        "predicted_yield": float(absolute_yield),
        "lower_bound": float(lower_bound),
        "upper_bound": float(upper_bound),
        "risk_level": risk_level,
        "risk_score": float(risk_score)
    }

# STEP 15 — Create main test block
if __name__ == "__main__":
    sample_input = {
        "crop": "Rice",
        "district": "Malda",
        "area": 2,
        "month": "February",
        "temperature": 27.9,
        "rainfall": 0.0,
        "humidity": 89.0
    }
    
    try:
        result = predict_yield(sample_input)
        print("\nPrediction Result:")
        print(f"Predicted yield: {result['predicted_yield']:.2f} ton/hectare")
        print(f"Confidence interval: [{result['lower_bound']:.2f}, {result['upper_bound']:.2f}]")
        print(f"Risk: {result['risk_level']} (Score: {result['risk_score']:.4f})")
    except Exception as e:
        print(f"Prediction failed: {e}")