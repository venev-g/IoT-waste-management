import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from sklearn.ensemble import GradientBoostingRegressor
from datetime import datetime, timedelta
import numpy as np
import pymongo
from pymongo import MongoClient

# Connect to MongoDB
MONGO_URI = "you-uri"
client = MongoClient(MONGO_URI)

db = client['smartwaste']  # Replace with your database name
collection = db['bin_predictions']  # Replace with your collection name

# Load and prepare data
data = pd.read_csv("enhanced_bin_data.csv")
data['observationDateTime'] = pd.to_datetime(data['observationDateTime']).dt.tz_localize(None)

# Add synthetic recent data to bridge gap to current date (replace with real observations if available)
current_date = datetime.now()
last_date_in_data = data['observationDateTime'].max()
if last_date_in_data.date() < current_date.date():
    days_missing = (current_date - last_date_in_data).days
    synthetic_dates = [last_date_in_data + timedelta(days=i) for i in range(1, days_missing + 1)]
   
    synthetic_data = pd.DataFrame({
        'binFillingLevel': np.linspace(data['binFillingLevel'].iloc[-1], 82, days_missing),
        'observationDateTime': synthetic_dates,
        'binFullnessThreshold': 80,
        'license_plate': data['license_plate'].iloc[-1],
        'days_since_first_reading': data['days_since_first_reading'].iloc[-1] + np.arange(1, days_missing + 1),
        'day_of_week': [d.weekday() for d in synthetic_dates],
        'hour_of_day': 12,
        'is_weekend': [int(d.weekday() >= 5) for d in synthetic_dates]
    })
    data = pd.concat([data, synthetic_data], ignore_index=True)

# Feature Engineering
data['days_since_last_clear'] = data.groupby('license_plate')['observationDateTime'].diff().dt.days.fillna(0)
data['fill_rate'] = data['binFillingLevel'] / (data['days_since_last_clear'].replace(0, 1))
data['trend'] = data.groupby('license_plate')['binFillingLevel'].pct_change(periods=2).fillna(0)

# Model Features
features = [
    'days_since_first_reading',
    'day_of_week',
    'hour_of_day',
    'is_weekend',
    'days_since_last_clear',
    'fill_rate',
    'trend'
]
X = data[features]
y = data['binFillingLevel']

# Train model with time-based validation
model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=3,
    validation_fraction=0.2,
    n_iter_no_change=10,
    random_state=42
)
model.fit(X, y)

# Enhanced prediction function
def predict_fill_level(date, last_clear_date, last_fill_level, license_plate):
    days_since_clear = (date - last_clear_date).days
   
    # Get bin-specific patterns
    bin_data = data[data['license_plate'] == license_plate]
    median_fill_rate = bin_data['fill_rate'].median() if len(bin_data) > 5 else data['fill_rate'].median()
   
    pred_features = pd.DataFrame([{
        'days_since_first_reading': (date - data['observationDateTime'].min()).days,
        'day_of_week': date.weekday(),
        'hour_of_day': 12,
        'is_weekend': int(date.weekday() >= 5),
        'days_since_last_clear': days_since_clear,
        'fill_rate': median_fill_rate,
        'trend': bin_data['trend'].mean() if len(bin_data) > 3 else 0
    }])
   
    predicted = model.predict(pred_features)[0]
    return np.clip(predicted, 0, 100)

# Get current status
last_record = data.iloc[-1]
current_fill = last_record['binFillingLevel']
threshold = last_record['binFullnessThreshold']
license_plate = last_record['license_plate']
last_clear_date = data[data['binFillingLevel'] < 10]['observationDateTime'].max()

# Generate predictions
tomorrow = current_date + timedelta(days=1)
tomorrow_fill = predict_fill_level(tomorrow, last_clear_date, current_fill, license_plate)

# Find critical dates
threshold_date = None
full_date = None
projection_days = 60

future_dates = []
future_fills = []
for days_ahead in range(1, projection_days + 1):
    test_date = current_date + timedelta(days=days_ahead)
    test_fill = predict_fill_level(test_date, last_clear_date, current_fill, license_plate)
    future_dates.append(test_date)
    future_fills.append(test_fill)
   
    if test_fill > threshold and threshold_date is None:
        threshold_date = test_date
   
    if test_fill >= 100 and full_date is None:
        full_date = test_date

# Generate report
print("\n" + "="*50)
print(f"BIN PREDICTION REPORT ({current_date.strftime('%Y-%m-%d')})".center(50))
print("="*50)
print(f"\n• Last Observation: {last_record['observationDateTime'].strftime('%Y-%m-%d %H:%M')}")
print(f"• Current Fill Level: {current_fill}%")
print(f"• Tomorrow's Prediction: {tomorrow_fill:.1f}%")
print(f"• Fullness Threshold: {threshold}%")

if threshold_date:
    print(f"\n Will exceed threshold on: {threshold_date.strftime('%Y-%m-%d')}")
    print(f"   ({(threshold_date - current_date).days} days from now)")
else:
    print(f"\n Not predicted to exceed threshold within {projection_days} days")

if full_date:
    print(f"\n Will reach 100% capacity on: {full_date.strftime('%Y-%m-%d')}")
    print(f"   ({(full_date - current_date).days} days from now)")
    print("\n URGENT: Schedule collection before this date!")
elif threshold_date:
    print(f"\n Note:Not predicted to reach 100% within {projection_days}days")

# MongoDB - Insert predicted data into collection
prediction_data = {
    "observationDateTime": current_date,
    "binFillingLevel": current_fill,
    "predictedFillTomorrow": tomorrow_fill,
    "thresholdExceedDate": threshold_date,
    "fullDate": full_date,
    # "licensePlate": license_plate#
}

# Insert into MongoDB collection
collection.insert_one(prediction_data)
print(f"\nData successfully inserted into MongoDB collection: {collection.name}")

