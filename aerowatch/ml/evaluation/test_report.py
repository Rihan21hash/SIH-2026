"""Test report generator for model evaluation and governance."""

import json
from datetime import datetime
from ml.training.data_preparation import generate_synthetic_training_dataset
from ml.evaluation.validation import run_rolling_window_temporal_cv


def generate_evaluation_report() -> str:
    """Generate Markdown and JSON model evaluation report."""
    df = generate_synthetic_training_dataset(num_samples=2000)
    cv_results = run_rolling_window_temporal_cv(df, n_splits=4)

    mean_acc = sum(r["accuracy"] for r in cv_results) / len(cv_results)
    mean_f1 = sum(r["macro_f1"] for r in cv_results) / len(cv_results)

    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "model": "WeatherEventXGBoostClassifier",
        "mean_temporal_cv_accuracy": round(mean_acc, 4),
        "mean_temporal_cv_macro_f1": round(mean_f1, 4),
        "folds": cv_results,
    }

    return json.dumps(report, indent=2)


if __name__ == "__main__":
    print(generate_evaluation_report())
