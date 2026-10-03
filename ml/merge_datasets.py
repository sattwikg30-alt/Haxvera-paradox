import pandas as pd
import os
import numpy as np

def load_data(file_path):
    """Loads a CSV dataset using pandas."""
    print(f"Loading {file_path}...")
    return pd.read_csv(file_path)

def merge_datasets(df_processed, df_climate):
    """
    STEP 2: Merges processed data with seasonal climate data.
    Maps climate features based on 'season_code'.
    Season codes (as encoded in preprocess.py):
    0 -> Kharif
    1 -> Rabi
    2 -> Summer
    3 -> Whole year
    """
    print("Merging datasets and mapping seasonal climate...")
    
    # 1. Inner merge on year
    df_merged = pd.merge(df_processed, df_climate, on='year', how='inner')
    
    # 2. Initialize new seasonal climate columns
    df_merged['season_temperature'] = 0.0
    df_merged['season_rainfall'] = 0.0
    df_merged['season_humidity'] = 0.0

    # 3. Map climate features based on season_code
    # Kharif (0)
    df_merged.loc[df_merged['season_code'] == 0, 'season_temperature'] = df_merged['kharif_temp']
    df_merged.loc[df_merged['season_code'] == 0, 'season_rainfall'] = df_merged['kharif_rainfall']
    df_merged.loc[df_merged['season_code'] == 0, 'season_humidity'] = df_merged['kharif_humidity']
    
    # Rabi (1)
    df_merged.loc[df_merged['season_code'] == 1, 'season_temperature'] = df_merged['rabi_temp']
    df_merged.loc[df_merged['season_code'] == 1, 'season_rainfall'] = df_merged['rabi_rainfall']
    df_merged.loc[df_merged['season_code'] == 1, 'season_humidity'] = df_merged['rabi_humidity']
    
    # Summer (2)
    df_merged.loc[df_merged['season_code'] == 2, 'season_temperature'] = df_merged['summer_temp']
    df_merged.loc[df_merged['season_code'] == 2, 'season_rainfall'] = df_merged['summer_rainfall']
    df_merged.loc[df_merged['season_code'] == 2, 'season_humidity'] = df_merged['summer_humidity']
    
    # Whole Year (3)
    df_merged.loc[df_merged['season_code'] == 3, 'season_temperature'] = df_merged['year_temp']
    df_merged.loc[df_merged['season_code'] == 3, 'season_rainfall'] = df_merged['year_rainfall']
    df_merged.loc[df_merged['season_code'] == 3, 'season_humidity'] = df_merged['year_humidity']

    # 4. Final columns reordering and cleaning
    # DROP individual seasonal columns
    cols_to_drop = [
        'kharif_temp', 'rabi_temp', 'summer_temp', 'year_temp',
        'kharif_rainfall', 'rabi_rainfall', 'summer_rainfall', 'year_rainfall',
        'kharif_humidity', 'rabi_humidity', 'summer_humidity', 'year_humidity'
    ]
    df_final = df_merged.drop(columns=cols_to_drop)

    # Requested order: year, Area, crop_code, district_code, season_code, season_temperature, season_rainfall, season_humidity, yield
    final_columns = [
        'year', 
        'Area', 
        'crop_code', 
        'district_code', 
        'season_code', 
        'season_temperature', 
        'season_rainfall', 
        'season_humidity', 
        'yield'
    ]
    
    df_final = df_final[final_columns]
    
    # Remove rows with missing values
    df_final = df_final.dropna()
    
    return df_final

def main():
    # Define paths
    processed_path = os.path.join('ml', 'data', 'processed.csv')
    climate_path = os.path.join('ml', 'data', 'climate_final.csv')
    final_dataset_path = os.path.join('ml', 'data', 'final_dataset.csv')

    try:
        # Step 1: Load
        df_processed = load_data(processed_path)
        df_climate = load_data(climate_path)

        # Step 2: Merge and map seasonal climate
        df_final = merge_datasets(df_processed, df_climate)

        # Step 3: Save
        print(f"Saving final seasonal ML dataset to {final_dataset_path}...")
        df_final.to_csv(final_dataset_path, index=False)

        # Step 4: Logging
        print("\nSuccess: Dataset merging complete!")
        print(f"Final dataset rows: {len(df_final)}")
        print(f"Final dataset columns: {', '.join(df_final.columns)}")
        print("\nPreview:")
        print(df_final.head())

    except Exception as e:
        print(f"An error occurred during dataset merging: {e}")

if __name__ == "__main__":
    main()