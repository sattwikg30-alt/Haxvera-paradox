import pandas as pd
import numpy as np
import os
import joblib
import json

print("Predict module loaded from:", __file__)

DEBUG_MODE = True
TRACE_MODE = True

def log_step(title, data):
    print("\n"+"="*60)
    print("STEP:", title)
    print("-" * 60)
    print(data)
    print("=" * 60)

# STEP 1 — Load required models globally
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
models = {
    "q20": joblib.load(os.path.join(MODEL_DIR, "model_q20.pkl")),
    "q50": joblib.load(os.path.join(MODEL_DIR, "model_q50.pkl")),
    "q80": joblib.load(os.path.join(MODEL_DIR, "model_q80.pkl")),
    "point": joblib.load(os.path.join(MODEL_DIR, "model_point.pkl"))
}
features = joblib.load(os.path.join(MODEL_DIR, "features.pkl"))

# PART 5 — Add model version loading
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")
MODEL_METADATA = None
if os.path.exists(METADATA_PATH):
    with open(METADATA_PATH) as f:
        MODEL_METADATA = json.load(f)
    print("Model version:", MODEL_METADATA.get("training_date", "Unknown"))

# PRE-LOADING DATA FOR MAPPINGS (Steps 3, 4, 12)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'crop_production.csv')
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed.csv')

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
    df_final = pd.read_csv(os.path.join(BASE_DIR, 'data', 'final_dataset.csv'))
    df_final['yield_log'] = np.log1p(df_final['yield'])
    crop_means = df_final.groupby('crop_code')['yield_log'].mean().to_dict()
    
    # Build climate means per crop
    climate_means = {}
    climate_cols = [
        "season_rainfall",
        "season_temperature",
        "season_humidity"
    ]
    
    for col in climate_cols:
        climate_means[col] = df_final.groupby(
            "crop_code"
        )[col].mean().to_dict()
    
    return crop_map, district_map, most_common_district_code, crop_means, climate_means

CROP_MAP, DISTRICT_MAP, MOST_COMMON_DISTRICT_CODE, CROP_MEANS, CLIMATE_MEANS = build_mappings()

# STEP 2 — Create input conversion functions
def normalize_crop_name(crop_name):
    return crop_name.lower().strip()

def normalize_district(name):
    if not name:
        return None
    name = name.upper()
    name = name.replace("DISTRICT", "")
    name = name.replace("DT", "")
    name = name.replace(".", "")
    name = name.replace("  ", " ")
    name = name.strip()
    return name

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
    
    precip = get_safe("rainfall", 0.0)
    
    # PART 1 — Fix rainfall estimation
    # Convert OpenMeteo precipitation to monthly rainfall estimate
    daily_precip = precip
    # Prevent zero rainfall collapse
    if daily_precip < 0.1:
        daily_precip = 0.5
    
    days_in_month = 30
    monthly_rain = daily_precip * days_in_month
    
    # Seasonal multiplier based on season
    season_multiplier = {
        0: 3,   # Kharif heavy rain
        1: 1.5, # Rabi moderate
        2: 1,   # Summer low
        3: 2    # Whole year
    }
    
    season_code = month_to_season_code(input_dict["month"])
    rain = monthly_rain * season_multiplier.get(season_code, 1.5)
    
    log_step(
        "SEASONAL RAIN ESTIMATE",
        {
            "daily": daily_precip,
            "monthly": monthly_rain,
            "seasonal": rain
        }
    )
    
    hum = get_safe("humidity", 60.0)
    
    # 3 Add solar estimate (Basic estimate if missing)
    # Solar radiation usually ranges from 15-25 based on cloud cover/month
    solar = input_dict.get("solar")
    if solar is None:
        solar = 18.0
        log_step(
            "SOLAR FALLBACK USED",
            solar
        )
    else:
        log_step(
            "SOLAR FROM OPENMETEO",
            solar
        )
    
    # 4 Add soil estimate (Basic estimate if missing)
    # Soil wetness is usually 0.3-0.8 based on rainfall
    soil = input_dict.get("soil")
    if soil is None:
        soil = 0.5
        log_step(
            "SOIL FALLBACK USED",
            soil
        )
    else:
        log_step(
            "SOIL FROM OPENMETEO",
            soil
        )

    return {
        "season_temperature": temp,
        "season_rainfall": rain,
        "season_humidity": hum,
        "season_solar": solar,
        "season_soil": soil
    }

def generate_recommendation(yield_value, risk_level, risk_score, lower, upper):
    """
    Generates farming recommendations based on prediction uncertainty and risk level.
    """
    if risk_level == "LOW":
        return {
            "decision": "PROCEED",
            "message": "Stable yield expected. Proceed with normal farming practices.",
            "action": "Normal fertilizer and irrigation recommended."
        }
    elif risk_level == "MEDIUM":
        return {
            "decision": "CAUTION",
            "message": "Moderate uncertainty. Consider risk mitigation.",
            "action": "Use crop insurance or irrigation backup."
        }
    else:
        return {
            "decision": "HIGH RISK",
            "message": "High uncertainty detected.",
            "action": "Consider delaying sowing or alternative crops."
        }

def generate_agronomic_recommendations(sample_row, importance_df, risk_level):
    """
    Generates structured agronomic advice based on climate anomalies and feature importance.
    """
    # Extract top important features
    top_features = importance_df.sort_values(
        'importance_percent',
        ascending=False
    ).head(5)
    
    recommendations = []
    
    # Check climate anomalies (Step 3)
    if sample_row["rain_anomaly"] < -0.5:
        recommendations.append("Rainfall below normal → consider irrigation support")
    if sample_row["rain_anomaly"] > 0.5:
        recommendations.append("Excess rainfall risk → ensure proper drainage")
        
    if sample_row["temp_anomaly"] > 0.5:
        recommendations.append("High temperature stress → increase irrigation frequency")
    if sample_row["temp_anomaly"] < -0.5:
        recommendations.append("Low temperature → monitor delayed crop growth")
        
    if sample_row["humidity_anomaly"] > 0.5:
        recommendations.append("High humidity → monitor fungal disease risk")
        
    if sample_row["season_soil"] < -0.5:
        recommendations.append("Low soil moisture → consider soil conditioning")
        
    if sample_row["season_solar"] > 0.5:
        recommendations.append("High solar exposure → possible heat stress")
        
    # Add risk advice (Step 4)
    if risk_level == "LOW":
        recommendations.append("Conditions stable. Continue normal farming practices.")
    elif risk_level == "MEDIUM":
        recommendations.append("Monitor climate conditions and consider adaptive irrigation.")
    elif risk_level == "HIGH":
        recommendations.append("High uncertainty. Consider crop insurance or alternative crops.")
        
    # Create explanation list (Step 5)
    explanation = ["Prediction influenced mainly by:"]
    for f in top_features["feature"].head(3):
        # Clean feature name for display
        clean_name = f.replace("_", " ").title()
        explanation.append(clean_name)
        
    return {
        "top_factors": list(top_features["feature"]),
        "recommendations": recommendations,
        "explanation": explanation
    }

# STEP 11 — Prediction pipeline
def predict_yield(input_dict):
    """
    Main prediction function that matches train.py logic exactly.
    """
    print("\nML PIPELINE STARTED")
    if MODEL_METADATA:
        print("MODEL VERSION:", MODEL_METADATA.get("training_date", "Unknown"))
        
    log_step(
        "RAW USER INPUT",
        input_dict
    )
    # Improvement 3 — Input validation
    validate_inputs(input_dict)
            
    # Normalize inputs
    crop_name = normalize_crop_name(input_dict["crop"])
    user_district = input_dict["district"]
    acres = float(input_dict["area"])
    month = input_dict["month"]
    
    log_step(
        "NORMALIZED INPUT",
        {
            "crop": crop_name,
            "district": user_district,
            "area": acres
        }
    )

    # Get mappings
    crop_code = CROP_MAP[crop_name]
    
    # PART 1 — Fix district matching properly (IMPORTANT)
    district_clean = normalize_district(user_district)
    district_clean = district_clean.replace(" ", "")
    best_match = None
    
    for d in DISTRICT_MAP:
        d_clean = normalize_district(d)
        d_clean = d_clean.replace(" ", "")
        if district_clean == d_clean:
            best_match = d
            break
            
    if best_match is None:
        # partial match
        for d in DISTRICT_MAP:
            d_clean = normalize_district(d)
            d_clean = d_clean.replace(" ", "")
            if district_clean in d_clean:
                best_match = d
                print("District partial match:", best_match)
                break
                
    if best_match is None:
        print("District not found:", user_district)
        district_code = MOST_COMMON_DISTRICT_CODE
    else:
        print("District matched:", best_match)
        district_code = DISTRICT_MAP[best_match]
        
    log_step(
        "DISTRICT MAPPING",
        {
            "input": user_district,
            "mapped": district_code
        }
    )

    season_code = month_to_season_code(month)
    
    # Area conversion (Step 6)
    hectare = acre_to_hectare(acres)
    area_log = np.log1p(hectare)
    
    # Fix 2 & 3 — Accept climate fields and keep lat/lon
    climate = generate_climate_features(input_dict)
    
    log_step(
        "CLIMATE INPUT",
        {
            "temperature": climate["season_temperature"],
            "rainfall": climate["season_rainfall"],
            "humidity": climate["season_humidity"],
            "solar": climate["season_solar"],
            "soil": climate["season_soil"]
        }
    )

    # STEP 8 — Climate interaction features
    climate["temp_humidity"] = climate["season_temperature"] * climate["season_humidity"]
    climate["rain_soil"] = climate["season_rainfall"] * climate["season_soil"]
    climate["temp_soil"] = climate["season_temperature"] * climate["season_soil"]
    climate["rain_solar"] = climate["season_rainfall"] * climate["season_solar"]
    climate["humidity_solar"] = climate["season_humidity"] * climate["season_solar"]
    
    # STEP 9 — Climate anomaly features (Step 9)
    rain_mean = CLIMATE_MEANS["season_rainfall"].get(
        crop_code,
        np.mean(list(CLIMATE_MEANS["season_rainfall"].values()))
    )
    temp_mean = CLIMATE_MEANS["season_temperature"].get(
        crop_code,
        np.mean(list(CLIMATE_MEANS["season_temperature"].values()))
    )
    humidity_mean = CLIMATE_MEANS["season_humidity"].get(
        crop_code,
        np.mean(list(CLIMATE_MEANS["season_humidity"].values()))
    )

    climate["rain_anomaly"] = climate["season_rainfall"] - rain_mean
    climate["temp_anomaly"] = climate["season_temperature"] - temp_mean
    climate["humidity_anomaly"] = climate["season_humidity"] - humidity_mean
    
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
    
    log_step(
        "FINAL FEATURE VECTOR",
        df.iloc[0].to_dict()
    )

    # Predict (Step 11)
    q20 = models["q20"].predict(df)[0]
    q50 = models["q50"].predict(df)[0]
    q80 = models["q80"].predict(df)[0]
    
    # Prevent quantile crossing
    q20 = min(q20, q50)
    q80 = max(q80, q50)
    
    # Point model prediction
    point = models["point"].predict(df)[0]
    
    log_step(
        "MODEL OUTPUT",
        {
            "prediction": q50, # Point model or median
            "lower": q20,
            "upper": q80
        }
    )

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
    
    # PART 4 — Add decision system
    recommendation = generate_recommendation(
        absolute_yield,
        risk_level,
        risk_score,
        lower_bound,
        upper_bound
    )
    
    # STEP 7 — Agronomic layer
    # We use a simplified importance for explanation since we don't have the full model importance here
    # In a real system, we'd load this from model_metadata or a separate file.
    # For now, we'll create a dummy importance_df based on the features used.
    importance_df = pd.DataFrame({
        'feature': features,
        'importance_percent': [5.0] * len(features) # Equal weight placeholder
    })
    
    # Boost climate features if they have high anomalies
    for feat in ["rain_anomaly", "temp_anomaly", "humidity_anomaly"]:
        if abs(climate.get(feat, 0)) > 0.5:
            importance_df.loc[importance_df['feature'] == feat, 'importance_percent'] = 20.0

    agro_info = generate_agronomic_recommendations(
        climate,
        importance_df,
        risk_level
    )
    
    # PART 6 — Add terminal debug
    log_step(
        "DECISION SYSTEM",
        recommendation
    )

    print("ML PIPELINE FINISHED")
    # STEP 14 — Output format (Improvement 6: return dict only)
    return {
        "predicted_yield": float(absolute_yield),
        "lower_bound": float(lower_bound),
        "upper_bound": float(upper_bound),
        "risk_level": risk_level,
        "risk_score": float(risk_score),
        "decision": recommendation["decision"],
        "recommendation": recommendation["message"],
        "action": recommendation["action"],
        "explainability": {
            "topFactors": agro_info["top_factors"],
            "recommendations": agro_info["recommendations"],
            "explanation": agro_info["explanation"]
        }
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
        print(f"Decision: {result['decision']}")
        print(f"Recommendation: {result['recommendation']}")
        print(f"Action: {result['action']}")
    except Exception as e:
        print(f"Prediction failed: {e}")