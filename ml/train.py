import pandas as pd
import numpy as np
import os
import joblib
import json
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.inspection import permutation_importance

from sklearn.preprocessing import StandardScaler
import optuna

def load_data(file_path):
    """Loads the dataset and prints basic info."""
    print(f"Loading data from {file_path}...")
    df = pd.read_csv(file_path)
    print(f"Row count: {len(df)}")
    print(f"Columns: {', '.join(df.columns)}")
    
    # STEP 1 — Fix yield distribution (CRITICAL)
    print("Applying log transform to yield...")
    df['yield_raw'] = df['yield']
    df['yield'] = np.log1p(df['yield'])
    print("Yield after log transform:")
    print(df['yield'].describe())

    # STEP 2 — Normalize yield by crop (VERY IMPORTANT)
    print("Creating crop normalized yield...")
    df['crop_mean'] = df.groupby('crop_code')['yield'].transform('mean')
    df['yield_relative'] = df['yield'] - df['crop_mean']
    
    print("\nPreview:")
    print(df.head())
    return df

def prepare_features(df):
    """
    Cleans data, removes outliers, and performs feature engineering.
    """
    print("\nPreparing features...")
    
    target_column = 'yield_relative'
    
    # STEP 5 — Remove extreme outliers better
    print("Removing extreme yield anomalies...")
    low = df[target_column].quantile(0.01)
    high = df[target_column].quantile(0.99)
    df = df[(df[target_column] > low) & (df[target_column] < high)].copy()
    print(f"Rows after percentile filtering: {len(df)}")

    # IMPROVEMENT 2: Remove extreme yield crops
    print("Removing extreme yield crops...")
    crop_median_check = df.groupby("crop_code")["yield_raw"].median()
    valid_crops = crop_median_check[crop_median_check <= 100].index
    before_rows = len(df)
    df = df[df["crop_code"].isin(valid_crops)].copy()
    print("Rows before extreme crop removal:", before_rows)
    print("Rows after removal:", len(df))
    print("Remaining crops:", df["crop_code"].nunique())

    # 2. Feature engineering: Log transform Area
    df["Area"] = np.log1p(df["Area"])
    
    # STEP 3 — Add strong climate engineering features
    print("Adding advanced climate features...")
    df['temp_humidity'] = df['season_temperature'] * df['season_humidity']
    df['rain_soil'] = df['season_rainfall'] * df['season_soil']
    df['temp_soil'] = df['season_temperature'] * df['season_soil']
    df['rain_solar'] = df['season_rainfall'] * df['season_solar']
    df['humidity_solar'] = df['season_humidity'] * df['season_solar']
    
    # STEP 4 — Add climate anomaly features (HIGH IMPACT)
    print("Adding climate anomaly features...")
    df['rain_anomaly'] = (
        df['season_rainfall'] - 
        df.groupby('crop_code')['season_rainfall'].transform('mean')
    )
    df['temp_anomaly'] = (
        df['season_temperature'] - 
        df.groupby('crop_code')['season_temperature'].transform('mean')
    )
    df['humidity_anomaly'] = (
        df['season_humidity'] - 
        df.groupby('crop_code')['season_humidity'].transform('mean')
    )

    # STEP 6 — Feature scaling (IMPORTANT)
    print("Scaling climate features...")
    climate_cols = [
        'season_temperature', 'season_rainfall', 'season_humidity', 
        'season_solar', 'season_soil', 'rain_anomaly', 
        'temp_anomaly', 'humidity_anomaly'
    ]
    scaler = StandardScaler()
    df[climate_cols] = scaler.fit_transform(df[climate_cols])

    # STEP 11: Add debug prints
    print("Environmental features added:")
    print("Solar mean:", df["season_solar"].mean())
    print("Soil mean:", df["season_soil"].mean())

    print(f"Debug - Max yield (log): {df['yield'].max():.4f}")
    print(f"Debug - Max Area (log): {df['Area'].max():.4f}")
    
    return df

def compare_missing_data_strategies(df, feature_cols):
    """
    Compares two strategies for handling missing climate data.
    Strategy A: Mean imputation
    Strategy B: Drop rows
    """
    print("\nMISSING DATA STRATEGY COMPARISON")
    print("-" * 40)

    climate_cols = [
        'season_temperature',
        'season_rainfall',
        'season_humidity',
        'season_solar',
        'season_soil'
    ]

    df_missing = df.copy()

    # Simulate missing data (5%)
    for col in climate_cols:
        mask = np.random.rand(len(df_missing)) < 0.05
        df_missing.loc[mask, col] = np.nan

    print("Simulated missing values added")

    # Strategy A — Mean imputation
    df_mean = df_missing.copy()
    for col in climate_cols:
        df_mean[col] = df_mean[col].fillna(df_mean[col].mean())
    print("Mean imputation applied")

    # Strategy B — Drop rows
    df_drop = df_missing.dropna(subset=climate_cols)
    print("Drop strategy applied")

    # Evaluate both
    target = 'yield_relative'
    latest_year = int(df['year'].max())
    
    # Simple evaluation using latest year as test
    train_mean = df_mean[df_mean['year'] < latest_year]
    train_drop = df_drop[df_drop['year'] < latest_year]

    X_mean = train_mean[feature_cols]
    y_mean = train_mean[target]
    X_drop = train_drop[feature_cols]
    y_drop = train_drop[target]

    params = {
        'n_estimators': 100,
        'max_depth': 10,
        'random_state': 42,
        'n_jobs': -1
    }

    mean_cv = compute_absolute_cv(
        RandomForestRegressor,
        params,
        X_mean,
        y_mean,
        train_mean['crop_mean'].values
    )

    drop_cv = compute_absolute_cv(
        RandomForestRegressor,
        params,
        X_drop,
        y_drop,
        train_drop['crop_mean'].values
    )

    print("\nMissing data strategy results:")
    print(f"Mean imputation CV (Absolute R2): {mean_cv:.4f}")
    print(f"Drop rows CV (Absolute R2): {drop_cv:.4f}")

    if mean_cv > drop_cv:
        print("BEST STRATEGY: Mean imputation")
    else:
        print("BEST STRATEGY: Drop rows")

    return mean_cv, drop_cv

def compute_absolute_cv(model_class, params, X, y_relative, crop_means):
    """
    Manual KFold CV that computes R2 on reconstructed absolute yield.
    """
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    scores = []

    for train_idx, val_idx in kf.split(X):
        X_tr = X.iloc[train_idx]
        X_val = X.iloc[val_idx]
        y_tr = y_relative.iloc[train_idx]
        y_val = y_relative.iloc[val_idx]
        crop_mean_val = crop_means[val_idx]

        model = model_class(**params)
        model.fit(X_tr, y_tr)

        pred_rel = model.predict(X_val)

        # Reconstruct absolute yield: log_yield = relative + crop_mean, then expm1
        pred_abs = np.expm1(pred_rel + crop_mean_val)
        true_abs = np.expm1(y_val + crop_mean_val)

        score = r2_score(true_abs, pred_abs)
        scores.append(score)

    return np.mean(scores)

def split_data(df):
    """
    Robust split logic.
    Detects latest year and splits accordingly.
    """
    print("\nSplitting data...")
    
    # STEP 7 — Improve feature set definition
    feature_cols = [
        'Area', 'crop_code', 'district_code', 'season_code',
        'season_temperature', 'season_rainfall', 'season_humidity',
        'season_solar', 'season_soil', 'temp_humidity', 'rain_soil',
        'temp_soil', 'rain_solar', 'humidity_solar', 'rain_anomaly',
        'temp_anomaly', 'humidity_anomaly'
    ]
    
    target = 'yield_relative'
    
    available_years = sorted(df['year'].unique().tolist())
    latest_year = int(df['year'].max())
    print(f"Available years: {available_years}")
    print(f"Latest year: {latest_year}")

    # Split based on latest year
    train_df = df[df['year'] < latest_year].copy()
    test_df = df[df['year'] == latest_year].copy()
    
    # Safety check: If test set is too small, fallback to random split
    if len(test_df) < 100:
        print(f"Test set too small ({len(test_df)} rows). Falling back to random split (20%)...")
        train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

    X_train = train_df[feature_cols]
    y_train = train_df[target]
    X_test = test_df[feature_cols]
    y_test = test_df[target]
    
    # We need this for final evaluation (using yield_raw for metrics)
    y_test_original = test_df['yield_raw']
    # And crop means to reconstruct absolute yield from relative
    train_crop_means = train_df['crop_mean'].values
    test_crop_means = test_df['crop_mean'].values
    
    print(f"Train size: {len(X_train)}")
    print(f"Test size: {len(X_test)}")
    
    return X_train, X_test, y_train, y_test, y_test_original, train_crop_means, test_crop_means, feature_cols

def optimize_hgb(X_train, y_train, train_crop_means):
    """
    Optimizes HistGradientBoostingRegressor hyperparameters using Optuna.
    """
    print("\nStarting hyperparameter optimization with Optuna...")
    
    def objective(trial):
        params = {
            'max_iter': trial.suggest_int('max_iter', 200, 600),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.1, log=True),
            'max_depth': trial.suggest_int('max_depth', 4, 12),
            'min_samples_leaf': trial.suggest_int('min_samples_leaf', 10, 80),
            'l2_regularization': trial.suggest_float('l2_regularization', 0.0, 1.0),
            'max_bins': trial.suggest_int('max_bins', 128, 255),
            'random_state': 42
        }
        
        score = compute_absolute_cv(
            HistGradientBoostingRegressor,
            params,
            X_train,
            y_train,
            train_crop_means
        )
        return score

    try:
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=20) # 25-40 trials
        
        print("\nOptimization complete.")
        print("Best params:", study.best_params)
        return study.best_params
    except Exception as e:
        print(f"Optuna optimization failed: {e}. Using default parameters.")
        return None

def train_best_model(X_train, y_train, train_crop_means):
    """
    Trains RF and HGB, compares them, and selects the best architecture.
    Then trains tuned quantile models (0.2, 0.5, 0.8) and a point model for hybrid prediction.
    """
    print("\nTraining and comparing models...")
    
    # RandomForest parameters
    rf_params = {
        'n_estimators': 500,
        'max_depth': 20,
        'min_samples_leaf': 3,
        'min_samples_split': 8,
        'max_features': "sqrt",
        'random_state': 42,
        'n_jobs': -1
    }
    
    # Stable HGB model parameters for initial architecture comparison
    hgb_params_comp = {
        'max_iter': 300,
        'learning_rate': 0.05,
        'max_depth': 10,
        'min_samples_leaf': 20,
        'random_state': 42
    }
    
    print("Running Absolute CV for RandomForest...")
    rf_cv = compute_absolute_cv(RandomForestRegressor, rf_params, X_train, y_train, train_crop_means)
    print(f"RF CV absolute R2: {rf_cv:.4f}")
    
    print("Running Absolute CV for HistGradientBoosting...")
    hgb_cv = compute_absolute_cv(HistGradientBoostingRegressor, hgb_params_comp, X_train, y_train, train_crop_means)
    print(f"HGB CV absolute R2: {hgb_cv:.4f}")
    
    if hgb_cv > rf_cv:
        print("Selected Best Model Architecture: HistGradientBoosting")
        model_name = "HGB"
    else:
        print("Selected Best Model Architecture: RandomForest")
        model_name = "RF"
    
    # Run Optuna Hyperparameter Optimization
    best_hgb_params = optimize_hgb(X_train, y_train, train_crop_means)
    
    # PART 2 & 12 — Tuned HGB parameters for quantile stability and robustness
    print("\nTraining Tuned Probabilistic Quantile Models (0.2, 0.5, 0.8)...")
    
    # Default parameters as fallback
    hgb_params = {
        'max_iter': 400,
        'learning_rate': 0.03,
        'max_depth': 8,
        'min_samples_leaf': 40,
        'l2_regularization': 0.1,
        'max_bins': 255,
        'early_stopping': True,
        'validation_fraction': 0.1,
        'n_iter_no_change': 20,
        'random_state': 42
    }
    
    # Apply Optuna results if available
    if best_hgb_params:
        print("Applying best Optuna parameters...")
        hgb_params.update(best_hgb_params)
    
    model_q20 = HistGradientBoostingRegressor(loss="quantile", quantile=0.2, **hgb_params)
    model_q50 = HistGradientBoostingRegressor(loss="quantile", quantile=0.5, **hgb_params)
    model_q80 = HistGradientBoostingRegressor(loss="quantile", quantile=0.8, **hgb_params)
    
    # PART 10 — Point model for hybrid prediction
    point_model = HistGradientBoostingRegressor(loss="squared_error", **hgb_params)
    
    print("Fitting quantile and point models...")
    model_q20.fit(X_train, y_train)
    model_q50.fit(X_train, y_train)
    model_q80.fit(X_train, y_train)
    point_model.fit(X_train, y_train)
    
    return model_q20, model_q50, model_q80, point_model, model_name, rf_cv, hgb_cv, hgb_params

def evaluate_model(model_q20, model_q50, model_q80, point_model, model_name, X_test, y_test_log, y_test_original, test_crop_means, df_full):
    """
    Evaluates the tuned probabilistic models with quantile smoothing and calibrated metrics.
    """
    print(f"\nEvaluating Tuned Probabilistic {model_name} Models...")
    
    # PART 3 — Quantile Predictions (on relative scale)
    q20 = model_q20.predict(X_test)
    q50 = model_q50.predict(X_test)
    q80 = model_q80.predict(X_test)
    
    # PART 3 — Quantile crossing prevention (Smoothing Trick)
    q20 = np.minimum(q20, q50)
    q80 = np.maximum(q80, q50)
    
    # Reconstruct absolute yield: log_yield = relative + crop_mean, then expm1
    yield_q20 = np.expm1(q20 + test_crop_means)
    yield_q50 = np.expm1(q50 + test_crop_means)
    yield_q80 = np.expm1(q80 + test_crop_means)
    
    # PART 10 — Hybrid Prediction (Blend)
    q_point = point_model.predict(X_test)
    yield_point = np.expm1(q_point + test_crop_means)
    yield_blend = (0.7 * yield_q50 + 0.3 * yield_point)
    
    # Evaluation Metrics using Blend/Median
    r2 = r2_score(y_test_original, yield_blend)
    mae = mean_absolute_error(y_test_original, yield_blend)
    rmse = np.sqrt(mean_squared_error(y_test_original, yield_blend))
    
    # PART 8 — Median Absolute Deviation
    mad = np.median(np.abs(yield_q50 - y_test_original))
    
    print(f"R2 Score (Hybrid Blend): {r2:.4f}")
    print(f"MAE (Hybrid Blend): {mae:.4f}")
    print(f"RMSE (Hybrid Blend): {rmse:.4f}")
    print(f"Median Absolute Deviation: {mad:.4f}")
    
    # PART 7 — Interval Calibration (0.2 to 0.8)
    inside = (y_test_original >= yield_q20) & (y_test_original <= yield_q80)
    coverage = inside.mean()
    
    # PART 3 — Add uncertainty calibration report
    expected = 0.6
    calibration_error = abs(coverage - expected)
    
    print("\nUNCERTAINTY CALIBRATION")
    print("------------------------")
    print("Expected coverage:", expected)
    print("Actual coverage:", coverage)
    print("Calibration error:", calibration_error)
    
    if calibration_error < 0.05:
        print("Calibration quality: GOOD")
    elif calibration_error < 0.1:
        print("Calibration quality: ACCEPTABLE")
    else:
        print("Calibration quality: POOR")
        
    # PART 4 — Add simple calibration histogram (text)
    interval_sizes = yield_q80 - yield_q20
    print("\nUNCERTAINTY WIDTH SUMMARY")
    print("Mean width:", interval_sizes.mean())
    print("Median width:", np.median(interval_sizes))
    print("Max width:", interval_sizes.max())
    
    # STEP 11 — Better uncertainty scaling
    interval_width = yield_q80 - yield_q20
    normalized_uncertainty = interval_width / np.abs(yield_q50 + 0.001)
    print(f"Normalized uncertainty: {normalized_uncertainty.mean():.4f}")
    
    # PART 4 & 11 — Uncertainty Metrics (Relative & Normalized)
    mean_raw_width = interval_width.mean()
    median_yield_test = np.median(yield_q50)
    relative_width = interval_width / (median_yield_test + 0.001)
    
    # Get crop medians for normalization (using raw yield)
    crop_medians = df_full.groupby("crop_code")["yield_raw"].median()
    test_crop_medians = X_test["crop_code"].map(crop_medians)
    normalized_width = interval_width / (test_crop_medians + 0.001)
    
    print(f"Mean uncertainty width: {mean_raw_width:.4f}")
    print(f"Relative uncertainty: {relative_width.mean():.4f}")
    print(f"Normalized uncertainty (by crop): {normalized_width.mean():.4f}")
    
    # PART 5 & 6 — Fix risk score calculation and thresholds
    risk = (yield_q80 - yield_q20) / (yield_q50 + 0.5)
    
    def get_risk_level(r):
        if r < 0.6: return "LOW"
        elif r < 1.2: return "MEDIUM"
        else: return "HIGH"
    
    risk_levels = [get_risk_level(r) for r in risk]
    risk_counts = pd.Series(risk_levels).value_counts(normalize=True) * 100
    
    print("\nRisk distribution:")
    for level in ["LOW", "MEDIUM", "HIGH"]:
        pct = risk_counts.get(level, 0.0)
        print(f"{level.capitalize()} risk: {pct:.1f}%")

    # PART 9 — Stabilized Feature Importance
    print(f"\nFeature importance (HGB Median Model):")
    print("Calculating stabilized permutation importance (sample=3000)...")
    sample_size = min(3000, X_test.shape[0])
    perm_imp = permutation_importance(model_q50, X_test[:sample_size], y_test_log[:sample_size], n_repeats=5, random_state=42)
    
    feature_names = X_test.columns
    importance_df = pd.DataFrame({'feature': feature_names, 'importance': perm_imp.importances_mean})
    
    # STEP 8 — Improve feature importance reporting
    importance_df['abs_importance'] = importance_df['importance'].abs()
    total_importance = importance_df['abs_importance'].sum()
    importance_df['importance_percent'] = (importance_df['abs_importance'] / total_importance * 100)
    importance_df = importance_df.sort_values('importance_percent', ascending=False)
    
    print("\nFeature importance %:")
    print(importance_df[['feature', 'importance_percent']])
    
    # STEP 9 — Climate importance calculation (FIXED METHOD)
    climate_features = [
        'season_temperature', 'season_rainfall', 'season_humidity', 
        'season_solar', 'season_soil', 'temp_humidity', 'rain_soil', 
        'temp_soil', 'rain_solar', 'humidity_solar', 'rain_anomaly', 
        'temp_anomaly', 'humidity_anomaly'
    ]
    climate_importance = importance_df[importance_df['feature'].isin(climate_features)]['importance_percent'].sum()
    print(f"\nTotal climate importance %: {climate_importance:.2f}%")
    
    crop_importance = importance_df[importance_df['feature'] == 'crop_code']['importance_percent'].values[0]
    print(f"Crop importance %: {crop_importance:.2f}%")
    
    return r2, mae, rmse, climate_importance, coverage, mean_raw_width, relative_width.mean(), importance_df

def test_prediction(model_q20, model_q50, model_q80, point_model, model_name, feature_columns, df_full):
    """
    Runs test prediction with tuned intervals and updated risk levels.
    """
    print(f"\nRunning test prediction for {model_name} with tuned intervals...")
    
    sample_data = {
        'Area': np.log1p(2.0),
        'crop_code': 10,
        'district_code': 50,
        'season_code': 1,
        'season_temperature': 25.0,
        'season_rainfall': 100.0,
        'season_humidity': 60.0,
        'season_solar': 18.0,
        'season_soil': 0.4,
        'temp_humidity': 25.0 * 60.0,
        'rain_soil': 100.0 * 0.4,
        'temp_soil': 25.0 * 0.4,
        'rain_solar': 100.0 * 18.0,
        'humidity_solar': 60.0 * 18.0,
        'rain_anomaly': 0.0, # Approximate
        'temp_anomaly': 0.0,
        'humidity_anomaly': 0.0
    }
    
    # We need crop mean to reconstruct
    crop_mean = df_full[df_full['crop_code'] == 10]['crop_mean'].iloc[0]
    
    sample_df = pd.DataFrame([sample_data])[feature_columns]
    
    # Quantile Predictions (Relative)
    q20 = model_q20.predict(sample_df)[0]
    q50 = model_q50.predict(sample_df)[0]
    q80 = model_q80.predict(sample_df)[0]
    
    # Smoothing Trick
    q20 = min(q20, q50)
    q80 = max(q80, q50)
    
    # Hybrid Prediction (Relative)
    q_point = point_model.predict(sample_df)[0]
    
    # Reconstruct absolute
    yield_q20 = np.expm1(q20 + crop_mean)
    yield_q50 = np.expm1(q50 + crop_mean)
    yield_q80 = np.expm1(q80 + crop_mean)
    yield_point = np.expm1(q_point + crop_mean)
    yield_blend = 0.7 * yield_q50 + 0.3 * yield_point
    
    print(f"Predicted yield (Hybrid): {yield_blend:.4f} ton/hectare")
    print(f"Confidence interval (q20-q80): [{yield_q20:.2f}, {yield_q80:.2f}]")
    
    # Risk Score
    risk = (yield_q80 - yield_q20) / (yield_q50 + 0.5)
    if risk < 0.6: risk_level = "LOW"
    elif risk < 1.2: risk_level = "MEDIUM"
    else: risk_level = "HIGH"
    
    print(f"Risk level: {risk_level} (Score: {risk:.4f})")

def run_ablation_test(df, feature_cols, train_crop_means):
    """
    STEP 10 — Climate ablation test improvement
    Trains a model without climate features and compares Absolute CV.
    """
    print("\nRunning climate ablation test (Absolute CV)...")
    climate_features = [
        'season_temperature', 'season_rainfall', 'season_humidity', 
        'season_solar', 'season_soil', 'temp_humidity', 'rain_soil', 
        'temp_soil', 'rain_solar', 'humidity_solar', 'rain_anomaly', 
        'temp_anomaly', 'humidity_anomaly'
    ]
    
    # Structural features only
    X_no_climate_cols = [c for c in feature_cols if c not in climate_features]
    
    # Quick RF for ablation parameters
    params_ablation = {'n_estimators': 100, 'max_depth': 10, 'random_state': 42, 'n_jobs': -1}
    
    target = 'yield_relative'
    latest_year = int(df['year'].max())
    train_df = df[df['year'] < latest_year].copy()
    
    X_train_no = train_df[X_no_climate_cols]
    y_train = train_df[target]
    
    print("Running Absolute CV without climate features...")
    cv_no = compute_absolute_cv(RandomForestRegressor, params_ablation, X_train_no, y_train, train_crop_means)
    print(f"CV without climate (Absolute R2): {cv_no:.4f}")
    
    return cv_no

def save_models(model_q20, model_q50, model_q80, point_model, features, feature_cols_path):
    """Saves all tuned probabilistic models."""
    model_dir = os.path.join('ml', 'models')
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    print(f"\nSaving tuned quantile models to {model_dir}...")
    joblib.dump(model_q20, os.path.join('ml', 'model_q20.pkl'))
    joblib.dump(model_q50, os.path.join('ml', 'model_q50.pkl'))
    joblib.dump(model_q80, os.path.join('ml', 'model_q80.pkl'))
    joblib.dump(point_model, os.path.join('ml', 'model_point.pkl'))
    
    joblib.dump(features, feature_cols_path)

def save_model_metadata(df, feature_cols, hgb_params):
    """
    Saves metadata about the model version, dataset, and features.
    """
    metadata = {
        "training_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "dataset_rows": int(len(df)),
        "features": feature_cols,
        "num_features": len(feature_cols),
        "years_used": sorted(df["year"].unique().tolist()),
        "model_type": "Quantile HistGradientBoosting Hybrid",
        "hgb_params": hgb_params,
        "target": "relative yield",
        "climate_features": [
            'season_temperature',
            'season_rainfall',
            'season_humidity',
            'season_solar',
            'season_soil'
        ]
    }

    with open("ml/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)

    print("Model metadata saved")

def main():
    data_path = os.path.join('ml', 'data', 'final_dataset.csv')
    model_path = os.path.join('ml', 'model.pkl')
    features_path = os.path.join('ml', 'features.pkl')

    try:
        # Step 1 & 2: Load and Prepare
        df = load_data(data_path)
        
        # PART 10 — Climate variance sanity check
        print("\nClimate variance sanity check:")
        climate_cols = ["season_temperature", "season_rainfall", "season_humidity", "season_solar", "season_soil"]
        print(df[climate_cols].std())
        
        df = prepare_features(df)

        # Step 3: Split
        X_train, X_test, y_train, y_test, y_test_original, train_crop_means, test_crop_means, feature_cols = split_data(df)

        # Step 5, 6, 7, 8: Train Best Model
        model_q20, model_q50, model_q80, point_model, model_name, rf_cv, hgb_cv, hgb_params = train_best_model(X_train, y_train, train_crop_means)
        best_cv = max(rf_cv, hgb_cv)

        # Step 9, 10, 11: Evaluate
        r2, mae, rmse, climate_imp_pct, coverage, mean_width, rel_width, importance_df = evaluate_model(
            model_q20, model_q50, model_q80, point_model, model_name, X_test, y_test, y_test_original, test_crop_means, df
        )

        # PART 11 — Ablation test
        cv_no_climate = run_ablation_test(df, feature_cols, train_crop_means)
        cv_improvement = best_cv - cv_no_climate

        # PART 1 — Missing data strategy comparison
        mean_cv, drop_cv = compare_missing_data_strategies(df, feature_cols)

        # STEP 15: Print Comparison Table
        print("\n" + "="*50)
        print(f"{'Model':<10} | {'CV (Abs R2)':<12} | {'R2':<8} | {'MAE':<8} | {'RMSE':<8}")
        print("-" * 50)
        print(f"{'RF':<10} | {rf_cv:<12.4f} | {'-':<8} | {'-':<8} | {'-'}")
        print(f"{'HGB':<10} | {hgb_cv:<12.4f} | {'-':<8} | {'-':<8} | {'-'}")
        print(f"{'SELECTED':<10} | {'':<12} | {r2:<8.4f} | {mae:<8.4f} | {rmse:<8.4f}")
        print("="*50)

        # STEP 12 & 15 — Final reporting
        print("\nCLIMATE SIGNAL REPORT")
        print("-" * 30)
        print(f"Climate importance %: {climate_imp_pct:.2f}%")
        print(f"Climate CV contribution: {cv_improvement:+.4f}")
        print("\nTop 10 features %:")
        print(importance_df[['feature', 'importance_percent']].head(10))
        
        print("\nTop climate features:")
        climate_features = [
            'season_temperature', 'season_rainfall', 'season_humidity', 
            'season_solar', 'season_soil', 'temp_humidity', 'rain_soil', 
            'temp_soil', 'rain_solar', 'humidity_solar', 'rain_anomaly', 
            'temp_anomaly', 'humidity_anomaly'
        ]
        print(importance_df[importance_df['feature'].isin(climate_features)].head(10))
        
        print(f"\nModel: {model_name} Quantile tuned")
        print(f"R2 (Hybrid): {r2:.4f}")
        print(f"Coverage: {coverage:.4f}")
        print(f"Mean width: {mean_width:.4f}")
        print(f"Relative width: {rel_width:.4f}")
        print("-" * 30)

        # Step 13: Save
        save_models(model_q20, model_q50, model_q80, point_model, feature_cols, features_path)
        save_model_metadata(df, feature_cols, hgb_params)

        # Step 12: Test
        test_prediction(model_q20, model_q50, model_q80, point_model, model_name, feature_cols, df)

        print("\nModel training complete")

    except Exception as e:
        print(f"An error occurred during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()