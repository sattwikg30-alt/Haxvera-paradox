import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.inspection import permutation_importance

def load_data(file_path):
    """Loads the dataset and prints basic info."""
    print(f"Loading data from {file_path}...")
    df = pd.read_csv(file_path)
    print(f"Row count: {len(df)}")
    print(f"Columns: {', '.join(df.columns)}")
    print("\nPreview:")
    print(df.head())
    return df

def prepare_features(df):
    """
    Cleans data, removes outliers, and performs feature engineering.
    """
    print("\nPreparing features...")
    
    # 1. Remove extreme yield outliers (top 1%)
    threshold = df["yield"].quantile(0.99)
    df = df[df["yield"] < threshold].copy()
    print(f"Removed outliers (yield >= {threshold:.2f}). Rows remaining: {len(df)}")

    # IMPROVEMENT 2: Remove extreme yield crops
    print("Removing extreme yield crops...")
    crop_median_check = df.groupby("crop_code")["yield"].median()
    valid_crops = crop_median_check[crop_median_check <= 100].index
    before_rows = len(df)
    df = df[df["crop_code"].isin(valid_crops)]
    print("Rows before extreme crop removal:", before_rows)
    print("Rows after removal:", len(df))
    print("Remaining crops:", df["crop_code"].nunique())

    # FIX 1: Remove crop normalization from model features
    # Keeping calculations commented for future experimentation
    """
    # IMPROVEMENT 1: Crop Yield Normalization
    print("Adding crop yield normalization...")
    crop_median = df.groupby("crop_code")["yield"].median()
    df["crop_median_yield"] = df["crop_code"].map(crop_median)
    df["crop_median_yield"] = df["crop_median_yield"].replace(0, 0.001)
    df["yield_ratio"] = df["yield"] / df["crop_median_yield"]
    df["yield_ratio"] = df["yield_ratio"].clip(0, 20)
    df["log_yield_ratio"] = np.log1p(df["yield_ratio"])
    """

    # 2. Feature engineering: Log transform Area
    df["Area"] = np.log1p(df["Area"])
    
    # STEP 3: Keep Interaction Features
    print("Adding interaction features...")
    df["rain_temp"] = df["season_rainfall"] * df["season_temperature"]
    df["rain_humidity"] = df["season_rainfall"] * df["season_humidity"]
    df["temp_humidity"] = df["season_temperature"] * df["season_humidity"]
    df["area_rain"] = df["Area"] * df["season_rainfall"]
    
    # STEP 9: Add new environmental interaction features
    df["solar_temp"] = df["season_solar"] * df["season_temperature"]
    df["soil_rain"] = df["season_soil"] * df["season_rainfall"]
    df["soil_temp"] = df["season_soil"] * df["season_temperature"]
    df["solar_rain"] = df["season_solar"] * df["season_rainfall"]

    # STEP 11: Add debug prints
    print("Environmental features added:")
    print("Solar mean:", df["season_solar"].mean())
    print("Soil mean:", df["season_soil"].mean())

    # FIX 7: Remove normalization debug prints
    print(f"Debug - Max yield: {df['yield'].max():.4f}")
    print(f"Debug - Max Area (log): {df['Area'].max():.4f}")
    
    return df

def split_data(df):
    """
    Robust split logic.
    Detects latest year and splits accordingly.
    """
    print("\nSplitting data...")
    
    # STEP 8 & 9: Final Feature List (Extended)
    feature_cols = [
        "Area", "crop_code", "district_code", "season_code",
        "season_temperature", "season_rainfall", "season_humidity",
        "season_solar", "season_soil",
        "rain_temp", "rain_humidity", "temp_humidity", "area_rain",
        "solar_temp", "soil_rain", "soil_temp", "solar_rain"
    ]
    
    # FIX 2: Restore original target
    df["log_yield"] = np.log1p(df["yield"])
    target = 'log_yield'
    original_target = 'yield'
    
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
    
    # We need this for final evaluation
    y_test_original = test_df[original_target]
    
    print(f"Train size: {len(X_train)}")
    print(f"Test size: {len(X_test)}")
    
    return X_train, X_test, y_train, y_test, y_test_original, feature_cols

def train_best_model(X_train, y_train):
    """
    Trains RF and HGB, compares them, and selects the best.
    """
    print("\nTraining and comparing models...")
    
    # STEP 7: Keep RF Improvements
    rf_model = RandomForestRegressor(
        n_estimators=500,
        max_depth=20,
        min_samples_leaf=3,
        min_samples_split=8,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1
    )
    
    # FIX 4: Replace RandomizedSearchCV with stable HGB model
    print("Training HistGradientBoostingRegressor (stable hyperparameters)...")
    hgb_model = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.05,
        max_depth=10,
        min_samples_leaf=20,
        random_state=42
    )
    
    # STEP 9: CV Comparison
    print("Running CV for RandomForest...")
    rf_scores = cross_val_score(rf_model, X_train, y_train, cv=5)
    print(f"RF CV mean: {rf_scores.mean():.4f}")
    
    print("Running CV for HistGradientBoosting...")
    hgb_scores = cross_val_score(hgb_model, X_train, y_train, cv=5)
    print(f"HGB CV mean: {hgb_scores.mean():.4f}")
    
    # Select better model automatically
    if hgb_scores.mean() > rf_scores.mean():
        print("Selected Best Model: HistGradientBoosting")
        best_model = hgb_model
        model_name = "HGB"
    else:
        print("Selected Best Model: RandomForest")
        best_model = rf_model
        model_name = "RF"
    
    # Train best model on full data
    best_model.fit(X_train, y_train)
    
    return best_model, model_name, rf_scores.mean(), hgb_scores.mean()

def evaluate_model(model, model_name, X_test, y_test_log, y_test_original):
    """
    Evaluates the model and prints metrics using real yield.
    """
    print(f"\nEvaluating {model_name} on latest year test set...")
    
    # Get log predictions
    log_predictions = model.predict(X_test)
    
    # FIX 5: Restore prediction conversion
    predicted_yield = np.expm1(log_predictions)
    
    r2 = r2_score(y_test_original, predicted_yield)
    mae = mean_absolute_error(y_test_original, predicted_yield)
    rmse = np.sqrt(mean_squared_error(y_test_original, predicted_yield))
    
    print(f"R2 Score: {r2:.4f}")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    
    # PART 7 — Feature importance measurement
    print(f"\nFeature importance ({model_name}):")
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    else:
        # Use permutation importance for models without feature_importances_ (like HGB)
        print("Model has no feature_importances_. Calculating permutation importance (on sample)...")
        # To speed up, we use a sample of X_test
        sample_size = min(1000, X_test.shape[0])
        perm_imp = permutation_importance(model, X_test[:sample_size], y_test_log[:sample_size], n_repeats=5, random_state=42)
        importances = perm_imp.importances_mean

    if importances is not None:
        feature_names = X_test.columns
        imp_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
        imp_df = imp_df.sort_values(by='importance', ascending=False)
        print(imp_df)
        
        # PART 8 — Climate importance percentage
        climate_features = [
            "season_temperature", "season_rainfall", "season_humidity",
            "season_solar", "season_soil"
        ]
        climate_importance = imp_df[imp_df["feature"].isin(climate_features)]["importance"].sum()
        print(f"\nTotal climate importance: {climate_importance:.4f}")
        print(f"Climate importance %: {climate_importance * 100:.2f}%")
        
        # PART 9 — Compare environmental vs structural features
        for feat in ["Area", "district_code", "crop_code"]:
            val = imp_df[imp_df["feature"] == feat]
            if not val.empty:
                print(f"{feat} importance: {val['importance'].values[0]:.4f}")
        
        return r2, mae, rmse, climate_importance * 100
    
    return r2, mae, rmse, 0

def save_model(model, features, model_path, features_path):
    """Saves the model and feature column order."""
    print(f"\nSaving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Saving features to {features_path}...")
    joblib.dump(features, features_path)

def test_prediction(model, model_name, feature_columns):
    """
    Runs a test prediction with sample input and uncertainty analysis.
    """
    print(f"\nRunning test prediction for {model_name} with uncertainty...")
    
    # STEP 11: Fix Test Prediction Sample (Extended for new features)
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
        'rain_temp': 100.0 * 25.0,
        'rain_humidity': 100.0 * 60.0,
        'temp_humidity': 25.0 * 60.0,
        'area_rain': np.log1p(2.0) * 100.0,
        'solar_temp': 18.0 * 25.0,
        'soil_rain': 0.4 * 100.0,
        'soil_temp': 0.4 * 25.0,
        'solar_rain': 18.0 * 100.0
    }
    
    sample_df = pd.DataFrame([sample_data])[feature_columns]
    
    # Get mean log prediction
    log_pred = model.predict(sample_df)[0]
    
    # FIX 6: Fix test prediction conversion
    yield_pred = np.expm1(log_pred)
    
    # STEP 12: Uncertainty
    if model_name == "RF":
        all_tree_log_preds = np.array([tree.predict(sample_df.values)[0] for tree in model.estimators_])
        all_tree_yields = np.expm1(all_tree_log_preds)
        
        std_yield = all_tree_yields.std()
        lower = yield_pred - std_yield
        upper = yield_pred + std_yield
        print(f"Predicted yield: {yield_pred:.4f} ton/hectare")
        print(f"Confidence range: [{lower:.4f}, {upper:.4f}]")
    else:
        print(f"Predicted yield: {yield_pred:.4f} ton/hectare")
        print("Uncertainty skip for HGB (as per instructions)")

def run_ablation_test(df, feature_cols):
    """
    PART 11 — Add final climate contribution test
    Trains a model without climate features and compares CV.
    """
    print("\nRunning climate ablation test...")
    climate_features = [
        "season_temperature", "season_rainfall", "season_humidity",
        "season_solar", "season_soil"
    ]
    
    # Structural features only
    X_no_climate_cols = [c for c in feature_cols if c not in climate_features]
    
    # Quick RF for ablation
    model_ablation = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    
    target = 'log_yield'
    latest_year = int(df['year'].max())
    train_df = df[df['year'] < latest_year].copy()
    
    X_train_no = train_df[X_no_climate_cols]
    y_train = train_df[target]
    
    print("Running CV without climate features...")
    scores_no = cross_val_score(model_ablation, X_train_no, y_train, cv=5)
    cv_no = scores_no.mean()
    print(f"CV without climate: {cv_no:.4f}")
    
    return cv_no

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
        X_train, X_test, y_train, y_test, y_test_original, feature_cols = split_data(df)

        # Step 5, 6, 7, 8: Train Best Model
        model, model_name, rf_cv, hgb_cv = train_best_model(X_train, y_train)
        best_cv = max(rf_cv, hgb_cv)

        # Step 9, 10, 11: Evaluate
        r2, mae, rmse, climate_imp_pct = evaluate_model(model, model_name, X_test, y_test, y_test_original)

        # PART 11 — Ablation test
        cv_no_climate = run_ablation_test(df, feature_cols)
        cv_improvement = best_cv - cv_no_climate

        # STEP 15: Print Comparison Table
        print("\n" + "="*50)
        print(f"{'Model':<10} | {'CV':<8} | {'R2':<8} | {'MAE':<8} | {'RMSE':<8}")
        print("-" * 50)
        print(f"{'RF':<10} | {rf_cv:<8.4f} | {'-':<8} | {'-':<8} | {'-'}")
        print(f"{'HGB':<10} | {hgb_cv:<8.4f} | {'-':<8} | {'-':<8} | {'-'}")
        print(f"{'SELECTED':<10} | {'':<8} | {r2:<8.4f} | {mae:<8.4f} | {rmse:<8.4f}")
        print("="*50)

        # PART 12 — Final reporting
        print("\nFINAL REPORTING SUMMARY")
        print("-" * 30)
        # Note: These values would ideally come from merge_datasets.py but we print them here based on expectation
        print(f"Climate importance %: {climate_imp_pct:.2f}%")
        print(f"CV improvement: {cv_improvement:+.4f}")
        print("-" * 30)

        # Step 13: Save
        save_model(model, feature_cols, model_path, features_path)

        # Step 12: Test
        test_prediction(model, model_name, feature_cols)

        print("\nModel training complete")

    except Exception as e:
        print(f"An error occurred during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()