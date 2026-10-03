import pandas as pd
import os
import numpy as np

def load_climate_file(file_path):
    """
    Loads a NASA POWER climate file, skipping metadata by searching for the header row.
    """
    print(f"Processing {file_path}...")
    
    # NASA POWER files have a header that starts with 'PARAMETER,YEAR,LAT,LON...'
    skip_rows = 0
    with open(file_path, 'r') as f:
        for i, line in enumerate(f):
            if 'PARAMETER,YEAR,LAT,LON' in line:
                skip_rows = i
                break
    
    return pd.read_csv(file_path, skiprows=skip_rows)

def process_climate_df(df, value_type):
    """
    STEP 1: Converts monthly climate data into seasonal features.
    Seasons:
    Kharif: JUN, JUL, AUG, SEP
    Rabi: OCT, NOV, DEC, JAN, FEB
    Summer: MAR, APR, MAY
    Whole Year: JAN-DEC
    """
    # 1. Clean columns
    df.columns = df.columns.str.strip()
    df = df.replace(-999, np.nan)

    # 2. Define seasonal columns
    kharif_months = ['JUN', 'JUL', 'AUG', 'SEP']
    rabi_months = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB']
    summer_months = ['MAR', 'APR', 'MAY']
    all_months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

    # 3. Calculate seasonal means per row
    df[f'kharif_{value_type}'] = df[kharif_months].mean(axis=1)
    df[f'rabi_{value_type}'] = df[rabi_months].mean(axis=1)
    df[f'summer_{value_type}'] = df[summer_months].mean(axis=1)
    df[f'year_{value_type}'] = df[all_months].mean(axis=1)

    # 4. Group by YEAR to get one record per year
    seasonal_cols = [f'kharif_{value_type}', f'rabi_{value_type}', f'summer_{value_type}', f'year_{value_type}']
    df_seasonal = df.groupby('YEAR')[seasonal_cols].mean().reset_index()
    
    # Rename YEAR to year
    df_seasonal = df_seasonal.rename(columns={'YEAR': 'year'})
    
    return df_seasonal

def merge_climate_data():
    """
    Merges seasonal features for temperature, rainfall, humidity, solar radiation, and soil wetness.
    """
    data_dir = os.path.join('ml', 'data')
    
    # Load files (STEP 2)
    temp_df = load_climate_file(os.path.join(data_dir, 'temp.csv'))
    rain_df = load_climate_file(os.path.join(data_dir, 'rainfall.csv'))
    hum_df = load_climate_file(os.path.join(data_dir, 'humidity.csv'))
    solar_df = load_climate_file(os.path.join(data_dir, 'irradiance.csv'))
    soil_df = load_climate_file(os.path.join(data_dir, 'soilwetness.csv'))

    # Process seasonal features for each type (STEP 2)
    temp_processed = process_climate_df(temp_df, 'temp')
    rain_processed = process_climate_df(rain_df, 'rainfall')
    hum_processed = process_climate_df(hum_df, 'humidity')
    solar_processed = process_climate_df(solar_df, 'solar')
    soil_processed = process_climate_df(soil_df, 'soil')

    # Merge all into one climate table (STEP 3)
    climate_final = temp_processed.merge(rain_processed, on='year', how='outer')
    climate_final = climate_final.merge(hum_processed, on='year', how='outer')
    climate_final = climate_final.merge(solar_processed, on='year', how='outer')
    climate_final = climate_final.merge(soil_processed, on='year', how='outer')

    # Handle missing values with column mean (STEP 4)
    for col in climate_final.columns:
        if col != 'year' and climate_final[col].isnull().any():
            climate_final[col] = climate_final[col].fillna(climate_final[col].mean())

    return climate_final.sort_values('year')

def main():
    output_path = os.path.join('ml', 'data', 'climate_final.csv')

    try:
        # Generate seasonal climate features
        climate_final = merge_climate_data()

        # Save the seasonal climate table
        print(f"Saving seasonal climate data to {output_path}...")
        climate_final.to_csv(output_path, index=False)

        print("\nSuccess: Seasonal climate processing complete!")
        print(f"Columns: {', '.join(climate_final.columns)}")
        print("\nPreview:")
        print(climate_final.head())

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()