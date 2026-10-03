import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

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

    # 2. Feature engineering: Log transform Area (STEP 5)
    df["Area"] = np.log1p(df["Area"])
    
    # STEP 2: Use Log(Yield) Directly
    print("Applying log transform to yield...")
    df["log_yield"] = np.log1p(df["yield"])

    # STEP 3: Keep Interaction Features
    print("Adding interaction features...")
    df["rain_temp"] = df["season_rainfall"] * df["season_temperature"]
    df["rain_humidity"] = df["season_rainfall"] * df["season_humidity"]
    df["temp_humidity"] = df["season_temperature"] * df["season_humidity"]
    df["area_rain"] = df["Area"] * df["season_rainfall"]

    # STEP 13: Clean Debug
    print(f"Debug - Max yield: {df['yield'].max():.4f}")
    print(f"Debug - Max log_yield: {df['log_yield'].max():.4f}")
    print(f"Debug - Max Area (log): {df['Area'].max():.4f}")
    
    return df

def split_data(df):
    """
    Robust split logic.
    Detects latest year and splits accordingly.
    """
    print("\nSplitting data...")
    
    # STEP 4: Final Feature List
    feature_cols = [
        "Area", "crop_code", "district_code", "season_code",
        "season_temperature", "season_rainfall", "season_humidity",
        "rain_temp", "rain_humidity", "temp_humidity", "area_rain"
    ]
    
    # Target columns (STEP 2)
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
    
    # We need this for final evaluation (STEP 10)
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
    
    # STEP 8: Keep HistGradientBoosting
    hgb_model = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.05,
        max_depth=10,
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
    
    # STEP 6 & 10: Prediction Conversion and Evaluation
    predicted_yield = np.expm1(log_predictions)
    
    r2 = r2_score(y_test_original, predicted_yield)
    mae = mean_absolute_error(y_test_original, predicted_yield)
    rmse = np.sqrt(mean_squared_error(y_test_original, predicted_yield))
    
    print(f"R2 Score: {r2:.4f}")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    
    # Feature Importance (RF only)
    if model_name == "RF":
        print("\nFeature Importance (RandomForest):")
        importances = model.feature_importances_
        feature_names = X_test.columns
        fi_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
        fi_df = fi_df.sort_values(by='Importance', ascending=False)
        print(fi_df)
    
    return r2, mae, rmse

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
    
    # STEP 11: Fix Test Prediction Sample
    sample_data = {
        'Area': np.log1p(2.0),
        'crop_code': 10,
        'district_code': 50,
        'season_code': 1,
        'season_temperature': 25.0,
        'season_rainfall': 100.0,
        'season_humidity': 60.0,
        'rain_temp': 100.0 * 25.0,
        'rain_humidity': 100.0 * 60.0,
        'temp_humidity': 25.0 * 60.0,
        'area_rain': np.log1p(2.0) * 100.0
    }
    
    sample_df = pd.DataFrame([sample_data])[feature_columns]
    
    # Get mean log prediction
    log_pred = model.predict(sample_df)[0]
    
    # Convert back to yield
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

def main():
    data_path = os.path.join('ml', 'data', 'final_dataset.csv')
    model_path = os.path.join('ml', 'model.pkl')
    features_path = os.path.join('ml', 'features.pkl')

    try:
        # Step 1 & 2: Load and Prepare
        df = load_data(data_path)
        df = prepare_features(df)

        # Step 3: Split
        X_train, X_test, y_train, y_test, y_test_original, feature_cols = split_data(df)

        # Step 5, 6, 7, 8: Train Best Model
        model, model_name, rf_cv, hgb_cv = train_best_model(X_train, y_train)

        # Step 9, 10, 11: Evaluate
        r2, mae, rmse = evaluate_model(model, model_name, X_test, y_test, y_test_original)

        # STEP 15: Print Comparison Table
        print("\n" + "="*50)
        print(f"{'Model':<10} | {'CV':<8} | {'R2':<8} | {'MAE':<8} | {'RMSE':<8}")
        print("-" * 50)
        print(f"{'RF':<10} | {rf_cv:<8.4f} | {'-':<8} | {'-':<8} | {'-'}")
        print(f"{'HGB':<10} | {hgb_cv:<8.4f} | {'-':<8} | {'-':<8} | {'-'}")
        print(f"{'SELECTED':<10} | {'':<8} | {r2:<8.4f} | {mae:<8.4f} | {rmse:<8.4f}")
        print("="*50)

        # Step 13: Save
        save_model(model, feature_cols, model_path, features_path)

        # Step 12: Test
        test_prediction(model, model_name, feature_cols)

        print("\nModel training complete")

    except Exception as e:
        print(f"An error occurred during training: {e}")

if __name__ == "__main__":
    main()