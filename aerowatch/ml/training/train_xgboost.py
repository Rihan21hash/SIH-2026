"""XGBoost training script for AeroWatch hazard severity classification."""

import os
import pickle
import numpy as np
from ml.training.data_preparation import generate_synthetic_training_dataset, prepare_temporal_splits
from backend.models.xgboost_model import WeatherEventXGBoostModel


def run_training():
    """Execute complete model training workflow with temporal validation."""
    print("[AeroWatch ML] Generating dataset...")
    df = generate_synthetic_training_dataset(num_samples=3000)
    train_df, val_df, test_df = prepare_temporal_splits(df)

    feature_cols = [c for c in df.columns if c != "severity"]
    X_train = train_df[feature_cols].values
    y_train = train_df["severity"].values
    X_val = val_df[feature_cols].values
    y_val = val_df["severity"].values
    X_test = test_df[feature_cols].values
    y_test = test_df["severity"].values

    print(f"[AeroWatch ML] Training on {len(X_train)} samples, validating on {len(X_val)}, testing on {len(X_test)}")

    model_wrapper = WeatherEventXGBoostModel()
    model_wrapper.train(X_train, y_train, eval_set=[(X_val, y_val)])

    preds = model_wrapper.predict(X_test)
    print(f"[AeroWatch ML] Evaluation completed on {len(preds)} test samples.")

    # Save model artifact
    os.makedirs("ml/models", exist_ok=True)
    model_save_path = "ml/models/xgboost_model.pkl"
    with open(model_save_path, "wb") as f:
        pickle.dump(model_wrapper, f)
    print(f"[AeroWatch ML] Saved trained model to {model_save_path}")


if __name__ == "__main__":
    run_training()
