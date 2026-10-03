import pandas as pd
import os
import numpy as np
from rapidfuzz import process, utils

def normalize_name(name):
    """Normalize names: uppercase, strip spaces, remove double spaces (STEP 3)."""
    if pd.isna(name):
        return ""
    return " ".join(str(name).upper().split())

def fuzzy_match(name, choices, threshold=80):
    """Find best match in choices using rapidfuzz (STEP 4)."""
    if not name or not choices:
        return None, 0
    match = process.extractOne(name, choices, processor=utils.default_process)
    if match and match[1] >= threshold:
        return match[0], match[1]
    return None, 0

def load_data(file_path):
    """Loads a CSV dataset using pandas."""
    print(f"Loading {file_path}...")
    return pd.read_csv(file_path)

def merge_datasets(df_processed, df_climate_spatial):
    """
    STEP 6-9: Merges processed data with spatial climate data.
    Maps climate features based on district centroids and nearest NASA grids.
    """
    data_dir = os.path.join('ml', 'data')
    raw_data_path = os.path.join(data_dir, 'crop_production.csv')
    coords_path = os.path.join(data_dir, 'district_coordinates.csv')
    climate_fallback_path = os.path.join(data_dir, 'climate_final.csv')
    
    # PART 1 — Define NASA coverage bounds
    lat_min = df_climate_spatial["LAT"].min()
    lat_max = df_climate_spatial["LAT"].max()
    lon_min = df_climate_spatial["LON"].min()
    lon_max = df_climate_spatial["LON"].max()
    
    print("\nNASA coverage bounds:")
    print(f"LAT: {lat_min} to {lat_max}")
    print(f"LON: {lon_min} to {lon_max}")
    
    # 1. Get District_Name and State_Name to district_code mapping from raw data
    print("Reconstructing district and state name mapping...")
    df_raw = pd.read_csv(raw_data_path)
    df_raw = df_raw.dropna(subset=['District_Name', 'State_Name'])
    
    # Reproduce the encoding from preprocess.py
    df_raw['district_code'] = df_raw['District_Name'].astype('category').cat.codes
    district_mapping = df_raw[['District_Name', 'State_Name', 'district_code']].drop_duplicates()
    
    # 2. Load and compute district centroids (STEP 1 & 2)
    print("Computing district centroids...")
    encodings = ['utf-16', 'utf-8-sig', 'utf-8', 'latin1']
    df_coords = None
    for enc in encodings:
        try:
            df_coords = pd.read_csv(coords_path, encoding=enc)
            print(f"Successfully loaded district coordinates with {enc} encoding.")
            break
        except Exception as e:
            continue
            
    if df_coords is None:
        raise Exception("Could not load district coordinates file with any standard encoding.")
        
    df_coords['District_Name_Norm'] = df_coords['District'].apply(normalize_name)
    df_coords['State_Name_Norm'] = df_coords['State'].apply(normalize_name)
    
    district_centroids = df_coords.groupby('District')[['Latitude', 'Longitude']].mean().reset_index()
    district_centroids = district_centroids.rename(columns={
        'District': 'District_Name',
        'Latitude': 'district_lat',
        'Longitude': 'district_lon'
    })
    district_centroids['District_Name_Norm'] = district_centroids['District_Name'].apply(normalize_name)
    
    # Also get state centroids for fallback (STEP 13)
    state_centroids = df_coords.groupby('State')[['Latitude', 'Longitude']].mean().reset_index()
    state_centroids = state_centroids.rename(columns={
        'State': 'State_Name',
        'Latitude': 'state_lat',
        'Longitude': 'state_lon'
    })
    state_centroids['State_Name_Norm'] = state_centroids['State_Name'].apply(normalize_name)
    
    # 3. Fuzzy matching districts (STEP 4, 11, 13)
    print("Performing fuzzy district matching with fallbacks...")
    crop_districts_info = district_mapping[['District_Name', 'State_Name']].drop_duplicates()
    coord_districts_norm = district_centroids['District_Name_Norm'].tolist()
    coord_norm_to_orig = dict(zip(district_centroids['District_Name_Norm'], district_centroids['District_Name']))
    
    coord_states_norm = state_centroids['State_Name_Norm'].tolist()
    coord_state_norm_to_orig = dict(zip(state_centroids['State_Name_Norm'], state_centroids['State_Name']))
    
    matched_count = 0
    fuzzy_count = 0
    state_fallback_count = 0
    unmatched_districts = []
    
    dist_to_coords_map = {}
    
    for _, row in crop_districts_info.iterrows():
        dist = row['District_Name']
        state = row['State_Name']
        dist_norm = normalize_name(dist)
        
        # 1. Try fuzzy match District
        match_name, score = fuzzy_match(dist_norm, coord_districts_norm)
        
        if match_name:
            orig_name = coord_norm_to_orig[match_name]
            centroid_row = district_centroids[district_centroids['District_Name'] == orig_name].iloc[0]
            dist_to_coords_map[dist] = (centroid_row['district_lat'], centroid_row['district_lon'], orig_name)
            matched_count += 1
            if dist_norm != match_name:
                fuzzy_count += 1
        else:
            # 2. Try state matching fallback (STEP 13)
            state_norm = normalize_name(state)
            match_state, s_score = fuzzy_match(state_norm, coord_states_norm)
            
            if match_state:
                orig_state = coord_state_norm_to_orig[match_state]
                s_centroid = state_centroids[state_centroids['State_Name'] == orig_state].iloc[0]
                dist_to_coords_map[dist] = (s_centroid['state_lat'], s_centroid['state_lon'], f"STATE:{orig_state}")
                state_fallback_count += 1
                matched_count += 1
            else:
                unmatched_districts.append(dist)
            
    print(f"\nMatching Summary:")
    print(f"Total districts in crop dataset: {len(crop_districts_info)}")
    print(f"Total districts matched: {matched_count}")
    print(f"Total fuzzy matches: {fuzzy_count}")
    print(f"Total state fallbacks: {state_fallback_count}")
    print(f"Total unmatched districts: {len(unmatched_districts)}")
    
    if unmatched_districts:
        print(f"Unmatched examples: {unmatched_districts[:5]}")

    # 4. Map district centroids to processed data (STEP 6)
    mapped_data = []
    for dist, coords in dist_to_coords_map.items():
        mapped_data.append({
            'District_Name': dist,
            'district_lat': coords[0],
            'district_lon': coords[1],
            'matched_to': coords[2]
        })
    df_mapped_coords = pd.DataFrame(mapped_data)
    district_mapping = pd.merge(district_mapping, df_mapped_coords, on='District_Name', how='inner')
    df_centroids_mapped = district_mapping[['district_code', 'district_lat', 'district_lon', 'District_Name', 'matched_to']]

    # PART 2 — Detect districts inside NASA region
    df_centroids_mapped["inside_nasa"] = (
        (df_centroids_mapped["district_lat"] >= lat_min) & 
        (df_centroids_mapped["district_lat"] <= lat_max) & 
        (df_centroids_mapped["district_lon"] >= lon_min) & 
        (df_centroids_mapped["district_lon"] <= lon_max)
    )
    
    print(f"Districts inside NASA coverage: {df_centroids_mapped['inside_nasa'].sum()}")
    print(f"Districts outside NASA coverage: {(~df_centroids_mapped['inside_nasa']).sum()}")

    # 5. Find nearest NASA grid for each district (STEP 7 & 12)
    print("Mapping districts to nearest NASA grids...")
    nasa_grids = df_climate_spatial[['LAT', 'LON']].drop_duplicates()
    
    district_grid_lookup = []
    for _, row in df_centroids_mapped.iterrows():
        # PART 3 — Apply spatial mapping only for valid districts
        if row["inside_nasa"]:
            # Euclidean distance squared
            distances = (nasa_grids['LAT'] - row['district_lat'])**2 + (nasa_grids['LON'] - row['district_lon'])**2
            nearest_idx = distances.idxmin()
            nearest_grid = nasa_grids.loc[nearest_idx]
            
            district_grid_lookup.append({
                'district_code': row['district_code'],
                'grid_LAT': nearest_grid['LAT'],
                'grid_LON': nearest_grid['LON'],
                'dist_lat': row['district_lat'],
                'dist_lon': row['district_lon'],
                'district_name': row['District_Name'],
                'inside_nasa': True
            })
        else:
            district_grid_lookup.append({
                'district_code': row['district_code'],
                'grid_LAT': np.nan,
                'grid_LON': np.nan,
                'dist_lat': row['district_lat'],
                'dist_lon': row['district_lon'],
                'district_name': row['District_Name'],
                'inside_nasa': False
            })
    
    df_grid_lookup = pd.DataFrame(district_grid_lookup)
    
    # PART 5 — Add spatial coverage statistics
    print(f"Spatial districts: {df_grid_lookup[df_grid_lookup['inside_nasa']==True].shape[0]}")
    print(f"Fallback districts: {df_grid_lookup[df_grid_lookup['inside_nasa']==False].shape[0]}")

    # PART 6 — Add mapping quality validation
    spatial_districts = df_grid_lookup[df_grid_lookup["inside_nasa"]==True].copy()
    if not spatial_districts.empty:
        spatial_districts["distance"] = np.sqrt(
            (spatial_districts["dist_lat"] - spatial_districts["grid_LAT"])**2 + 
            (spatial_districts["dist_lon"] - spatial_districts["grid_LON"])**2
        )
        print("\nSpatial Mapping Quality (Distance in degrees):")
        print(spatial_districts["distance"].describe())
        print(f"Mean distance: {spatial_districts['distance'].mean():.4f}")
        print(f"Max distance: {spatial_districts['distance'].max():.4f}")

    # Print 5 examples (STEP 11)
    print("\nMapping Examples (District -> Centroid -> Grid):")
    for i, row in df_grid_lookup.head(5).iterrows():
        print(f"DISTRICT: {row['district_name']}")
        print(f"CENTROID: {row['dist_lat']:.4f}, {row['dist_lon']:.4f}")
        if not np.isnan(row['grid_LAT']):
            print(f"GRID: {row['grid_LAT']:.4f}, {row['grid_LON']:.4f}")
        else:
            print("GRID: Outside NASA (using fallback)")
        print("-" * 20)

    # 6. Merge grid lookup into processed data
    df_merged = pd.merge(df_processed, df_grid_lookup, on='district_code', how='inner')
    
    # 7. Map climate using lookup (STEP 8)
    print("Merging spatial climate data...")
    # Merge only for spatial rows first
    spatial_mask = df_merged["inside_nasa"] == True
    df_spatial = df_merged[spatial_mask].copy()
    df_fallback_base = df_merged[~spatial_mask].copy()
    
    if not df_spatial.empty:
        df_spatial = pd.merge(
            df_spatial, 
            df_climate_spatial, 
            left_on=['year', 'grid_LAT', 'grid_LON'], 
            right_on=['year', 'LAT', 'LON'], 
            how='inner'
        )
    
    # PART 4 — Fallback climate for outside districts
    print("Applying fallback climate for outside districts...")
    df_climate_fallback = pd.read_csv(climate_fallback_path)
    
    # Concatenate spatial and fallback rows
    # For spatial rows, climate columns are already there.
    # For fallback rows, we need to merge with df_climate_fallback by year.
    if not df_fallback_base.empty:
        df_fallback_merged = pd.merge(df_fallback_base, df_climate_fallback, on='year', how='inner')
        # Combine them back
        df_merged_all = pd.concat([df_spatial, df_fallback_merged], ignore_index=True)
    else:
        df_merged_all = df_spatial

    # 8. Map seasonal climate (STEP 9)
    print("Mapping seasonal features...")
    df_merged_all['season_temperature'] = 0.0
    df_merged_all['season_rainfall'] = 0.0
    df_merged_all['season_humidity'] = 0.0
    df_merged_all['season_solar'] = 0.0
    df_merged_all['season_soil'] = 0.0

    # Map by season_code
    seasons = {
        0: 'kharif',
        1: 'rabi',
        2: 'summer',
        3: 'year'
    }
    
    for code, prefix in seasons.items():
        mask = df_merged_all['season_code'] == code
        if mask.any():
            df_merged_all.loc[mask, 'season_temperature'] = df_merged_all.loc[mask, f'{prefix}_temp']
            df_merged_all.loc[mask, 'season_rainfall'] = df_merged_all.loc[mask, f'{prefix}_rainfall']
            df_merged_all.loc[mask, 'season_humidity'] = df_merged_all.loc[mask, f'{prefix}_humidity']
            df_merged_all.loc[mask, 'season_solar'] = df_merged_all.loc[mask, f'{prefix}_solar']
            df_merged_all.loc[mask, 'season_soil'] = df_merged_all.loc[mask, f'{prefix}_soil']

    # 9. Final columns cleanup (STEP 10 & 14)
    final_columns = [
        'year', 'Area', 'crop_code', 'district_code', 'season_code',
        'season_temperature', 'season_rainfall', 'season_humidity',
        'season_solar', 'season_soil', 'yield'
    ]
    
    df_final = df_merged_all[final_columns].dropna()
    
    print(f"\nFinal validation:")
    # Count unique grids for spatial rows only
    if not df_spatial.empty:
        print(f"Total NASA grids used: {df_spatial[['grid_LAT', 'grid_LON']].drop_duplicates().shape[0]}")
    else:
        print("Total NASA grids used: 0")
    print(f"Total districts mapped: {df_grid_lookup.shape[0]}")
    print(f"Final dataset rows: {len(df_final)}")
    
    return df_final

def main():
    # Define paths
    processed_path = os.path.join('ml', 'data', 'processed.csv')
    climate_spatial_path = os.path.join('ml', 'data', 'climate_spatial.csv')
    final_dataset_path = os.path.join('ml', 'data', 'final_dataset.csv')

    try:
        # Step 1: Load
        df_processed = load_data(processed_path)
        df_climate_spatial = load_data(climate_spatial_path)

        # Step 2: Merge and map seasonal climate spatially
        df_final = merge_datasets(df_processed, df_climate_spatial)

        # Step 3: Save
        print(f"Saving final seasonal ML dataset to {final_dataset_path}...")
        df_final.to_csv(final_dataset_path, index=False)

        # Step 4: Logging
        print("\nSuccess: Spatial dataset merging complete!")
        print(f"Preview:")
        print(df_final.head())

    except Exception as e:
        print(f"An error occurred during dataset merging: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
