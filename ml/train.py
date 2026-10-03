import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
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

    # 2. Feature engineering: Log transform Area
    df["Area"] = np.log1p(df["Area"])
    
    # IMPROVEMENT 3: Debug checks
    print(f"Debug - Max yield: {df['yield'].max():.4f}")
    print(f"Debug - Max Area (log): {df['Area'].max():.4f}")
    
    return df

def split_data(df):
    """
    REQUIRED FIX: Robust split logic.
    Detects latest year and splits accordingly.
    Fallbacks to random split if the latest year has too few samples.
    """
    print("\nSplitting data...")
    
    # Improved logging
    available_years = sorted(df['year'].unique().tolist())
    latest_year = int(df['year'].max())
    print(f"Available years: {available_years}")
    print(f"Latest year: {latest_year}")

    # Split based on latest year
    train_df = df[df['year'] < latest_year].copy()
    test_df = df[df['year'] == latest_year].copy()
    
    target = 'yield'
    
    # Safety check: If test set is too small, fallback to random split
    if len(test_df) < 100:
        print(f"Test set too small ({len(test_df)} rows). Falling back to random split (20%)...")
        X = df.drop(columns=[target, 'year'])
        y = df[target]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        feature_cols = X_train.columns.tolist()
    else:
        print(f"Using chronological split: Train (years < {latest_year}), Test (year == {latest_year})")
        print(f"Train size: {len(train_df)}")
        print(f"Test size: {len(test_df)}")
        
        X_train = train_df.drop(columns=[target, 'year'])
        y_train = train_df[target]
        X_test = test_df.drop(columns=[target, 'year'])
        y_test = test_df[target]
        feature_cols = X_train.columns.tolist()
    
    return X_train, X_test, y_train, y_test, feature_cols

def train_model(X_train, y_train):
    """
    IMPROVEMENT 2: Add cross validation.
    Trains the RandomForestRegressor model.
    """
    print("\nTraining model (RandomForestRegressor)...")
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    
    # IMPROVEMENT 2: Cross validation
    print("Running 5-fold cross validation on training data...")
    scores = cross_val_score(model, X_train, y_train, cv=5)
    print(f"Mean R2 Score (CV): {scores.mean():.4f}")
    
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluates the model and prints metrics."""
    print("\nEvaluating model on latest year test set...")
    predictions = model.predict(X_test)
    
    r2 = r2_score(y_test, predictions)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    
    print(f"R2 Score: {r2:.4f}")
    print(f"Mean Absolute Error (MAE): {mae:.4f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    
    # Feature Importance
    print("\nFeature Importance:")
    importances = model.feature_importances_
    feature_names = X_test.columns
    feature_importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    feature_importance_df = feature_importance_df.sort_values(by='Importance', ascending=False)
    print(feature_importance_df)

def save_model(model, features, model_path, features_path):
    """Saves the model and feature column order."""
    print(f"\nSaving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Saving features to {features_path}...")
    joblib.dump(features, features_path)

def test_prediction(model, feature_columns):
    """
    STEP 6: Runs a test prediction with sample input and uncertainty analysis.
    """
    print("\nRunning test prediction with uncertainty...")
    
    # Sample input using seasonal features
    sample_data = {
        'Area': np.log1p(2.0),
        'crop_code': 10,
        'district_code': 50,
        'season_code': 1,
        'season_temperature': 25.0,
        'season_rainfall': 100.0,
        'season_humidity': 60.0
    }
    
    # Ensure columns match training order
    sample_df = pd.DataFrame([sample_data])[feature_columns]
    
    # Collect predictions from all trees for uncertainty
    all_tree_preds = np.array([
        tree.predict(sample_df.values)[0] 
        for tree in model.estimators_
    ])
    
    mean_pred = all_tree_preds.mean()
    std_pred = all_tree_preds.std()
    lower = mean_pred - std_pred
    upper = mean_pred + std_pred

    print(f"Predicted yield: {mean_pred:.4f} ton/hectare")
    print(f"Confidence range: [{lower:.4f}, {upper:.4f}]")

def main():
    data_path = os.path.join('ml', 'data', 'final_dataset.csv')
    model_path = os.path.join('ml', 'model.pkl')
    features_path = os.path.join('ml', 'features.pkl')

    try:
        # Step 1: Load
        df = load_data(data_path)

        # Step 2: Prepare
        df = prepare_features(df)

        # Step 3: Split
        X_train, X_test, y_train, y_test, feature_cols = split_data(df)

        # Step 4: Train
        model = train_model(X_train, y_train)

        # Step 5: Evaluate
        evaluate_model(model, X_test, y_test)

        # Step 6: Save (CLEAN FINAL FEATURE ORDER)
        save_model(model, feature_cols, model_path, features_path)

        # Step 7: Test (WITH UNCERTAINTY)
        test_prediction(model, feature_cols)

        print("\nModel training complete")

    except Exception as e:
        print(f"An error occurred during training: {e}")

if __name__ == "__main__":
    main()