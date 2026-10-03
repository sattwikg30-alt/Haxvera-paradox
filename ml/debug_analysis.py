import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

print("\n========== DATASET LOAD ==========")

df = pd.read_csv("ml/data/final_dataset.csv")

print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

print("\nPreview:")
print(df.head())

print("\n========== BASIC STATS ==========")

print(df.describe())

print("\n========== MISSING VALUES ==========")

print(df.isna().sum())

print("\n========== YIELD DISTRIBUTION ==========")

print("Min:", df["yield"].min())
print("Max:", df["yield"].max())
print("Mean:", df["yield"].mean())
print("Median:", df["yield"].median())
print("Std:", df["yield"].std())

print("\nYield quantiles:")
print(df["yield"].quantile([0.01,0.05,0.25,0.5,0.75,0.95,0.99]))

print("\n========== CLIMATE VARIANCE ==========")

climate_cols = [
'season_temperature',
'season_rainfall',
'season_humidity',
'season_solar',
'season_soil'
]

print(df[climate_cols].describe())

print("\nClimate standard deviations:")
print(df[climate_cols].std())

print("\nClimate unique values:")
for col in climate_cols:
    print(col, df[col].nunique())

print("\n========== CLIMATE CORRELATION WITH YIELD ==========")

for col in climate_cols:
    corr = df[col].corr(df['yield'])
    print(col, "correlation:", corr)

print("\n========== FULL CORRELATION MATRIX ==========")

corr = df.corr(numeric_only=True)

print(corr["yield"].sort_values(ascending=False))

print("\n========== CROP DOMINANCE ANALYSIS ==========")

crop_stats = df.groupby('crop_code')['yield'].agg(['mean','std','min','max','count'])

print(crop_stats.sort_values("mean").head(20))

print("\nCrop yield std (variation inside crops):")

print(df.groupby('crop_code')['yield'].std().describe())

print("\n========== SEASON ANALYSIS ==========")

print(df.groupby('season_code')[climate_cols].mean())

print("\n========== DISTRICT CLIMATE VARIATION ==========")

print(df.groupby('district_code')[climate_cols].std().describe())

print("\n========== CLIMATE VARIATION INSIDE CROPS ==========")

for col in climate_cols:
    print(col)
    print(df.groupby('crop_code')[col].std().mean())

print("\n========== OUTLIER CHECK ==========")

print("Yield outliers:")

q1 = df['yield'].quantile(0.25)
q3 = df['yield'].quantile(0.75)

iqr = q3-q1

lower = q1-1.5*iqr
upper = q3+1.5*iqr

outliers = df[(df['yield']<lower)|(df['yield']>upper)]

print("Outlier count:",len(outliers))

print("\n========== CLIMATE FEATURE CORRELATION ==========")

print(df[climate_cols].corr())

print("\n========== CLIMATE VS YIELD CORRELATION ==========")

print(df[['yield']+climate_cols].corr()['yield'])

print("\n========== CLIMATE ONLY MODEL TEST ==========")

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

rf = RandomForestRegressor(n_estimators=50,n_jobs=-1)

X = df[climate_cols]
y = df['yield']

scores = cross_val_score(rf,X,y,cv=5)

print("Climate only CV score:",scores.mean())

print("\n========== WITHOUT CROP TEST ==========")

features = [
'Area',
'season_code',
'season_temperature',
'season_rainfall',
'season_humidity',
'season_solar',
'season_soil'
]

scores = cross_val_score(rf,df[features],df['yield'],cv=5)

print("Without crop CV:",scores.mean())

print("\n========== WITH CROP TEST ==========")

features = [
'Area',
'crop_code',
'district_code',
'season_code',
'season_temperature',
'season_rainfall',
'season_humidity',
'season_solar',
'season_soil'
]

scores = cross_val_score(rf,df[features],df['yield'],cv=5)

print("With crop CV:",scores.mean())

print("\n========== INTERACTION TEST ==========")

df["temp_rain"] = df["season_temperature"]*df["season_rainfall"]

print(df[["temp_rain","yield"]].corr())

print("\n========== BASIC FEATURE IMPORTANCE TEST ==========")

rf.fit(df[features],df['yield'])

imp = pd.Series(rf.feature_importances_,index=features)

print(imp.sort_values(ascending=False))

print("\n========== DISTRICT CLIMATE CHECK ==========")

print(df.groupby('district_code')['season_temperature'].std().describe())

print("\n========== FINAL DIAGNOSIS ==========")

print("If climate CV very low -> climate weak signal")
print("If crop CV huge -> crop dominating")
print("If climate std small -> mapping problem")
print("If correlations small -> missing agronomy features")

print("\n========== DEBUG COMPLETE ==========")