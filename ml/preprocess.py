import pandas as pd
import os
import numpy as np

def load_data(file_path):
    """Loads the dataset using pandas."""
    print(f"Loading data from {file_path}...")
    return pd.read_csv(file_path)

def clean_data(df):
    """
    Cleans the data by removing nulls and invalid values.
    Calculates the yield column.
    """
    initial_rows = len(df)
    print(f"Rows before cleaning: {initial_rows}")

    # 1. Rename Crop_Year to year
    df = df.rename(columns={'Crop_Year': 'year'})

    # 2. Remove null rows
    df = df.dropna()

    # 3. Remove rows where Area or Production is 0
    df = df[(df['Area'] > 0) & (df['Production'] > 0)]

    # 4. Create yield column (yield = Production / Area)
    df['yield'] = df['Production'] / df['Area']

    # 5. Clean Season names (strip whitespace)
    df['Season'] = df['Season'].str.strip()

    print(f"Rows after cleaning: {len(df)}")
    return df

def process_features(df):
    """
    Keeps useful columns and encodes categorical variables.
    """
    # Keep only useful columns
    useful_columns = ['year', 'District_Name', 'Crop', 'Season', 'Area', 'yield']
    df = df[useful_columns].copy()

    # STEP 1-8: Crop filtering logic
    print("Filtering rare crops...")
    crop_counts = df["Crop"].value_counts()
    print("Total crops before filtering:", len(crop_counts))
    
    threshold = 1000
    valid_crops = crop_counts[crop_counts >= threshold].index
    
    original_rows = len(df)
    df = df[df["Crop"].isin(valid_crops)]
    
    print("Rows before crop filtering:", original_rows)
    print("Rows after crop filtering:", len(df))
    print("Crops remaining:", df["Crop"].nunique())
    
    print("Top crops after filtering:")
    print(df["Crop"].value_counts().head(20))
    
    if len(df) == 0:
        raise Exception("All crops removed. Lower threshold.")

    # STEP 2: Custom Season Encoding to match merge_datasets logic
    # 0 -> Kharif (Kharif, Autumn)
    # 1 -> Rabi (Rabi, Winter)
    # 2 -> Summer (Summer)
    # 3 -> Whole Year (Whole Year)
    season_map = {
        'Kharif': 0,
        'Autumn': 0,
        'Rabi': 1,
        'Winter': 1,
        'Summer': 2,
        'Whole Year': 3
    }
    print("Encoding Season using custom mapping...")
    df['season_code'] = df['Season'].map(season_map)
    
    # Mapping for Crop and District
    categorical_mapping = {
        'Crop': 'crop_code',
        'District_Name': 'district_code'
    }
    
    for original_col, new_col_name in categorical_mapping.items():
        print(f"Encoding {original_col} -> {new_col_name}")
        df[new_col_name] = df[original_col].astype('category').cat.codes
    
    # Drop original text columns
    df = df.drop(columns=['Crop', 'District_Name', 'Season'])
    
    # Ensure final column order
    final_cols = ['year', 'Area', 'yield', 'crop_code', 'district_code', 'season_code']
    df = df[final_cols]
    
    return df

def main():
    # Define paths
    raw_data_path = os.path.join('ml', 'data', 'crop_production.csv')
    processed_data_path = os.path.join('ml', 'data', 'processed.csv')

    # Execute pipeline
    try:
        # Step 1: Load
        df = load_data(raw_data_path)

        # Step 2 & 3: Clean and calculate yield
        df = clean_data(df)

        # Step 4, 5, 6: Process features and encode
        df = process_features(df)

        # Step 7: Save
        print(f"Saving processed data to {processed_data_path}...")
        df.to_csv(processed_data_path, index=False)

        print("\nSuccess: Preprocessing complete!")
        print(f"Processed file contains {len(df)} rows and {len(df.columns)} columns.")
        print(f"Columns: {', '.join(df.columns)}")
        print("\nPreview:")
        print(df.head())

    except Exception as e:
        print(f"An error occurred during preprocessing: {e}")

if __name__ == "__main__":
    main()