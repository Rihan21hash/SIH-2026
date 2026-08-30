"""Evaluation metrics for multi-class hazard severity classification."""

from typing import Dict, Any, List
import numpy as np


def compute_classification_metrics(y_true: np.ndarray, y_pred: np.ndarray, num_classes: int = 5) -> Dict[str, Any]:
    """Compute Accuracy, Macro Precision, Recall, and F1 score."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    accuracy = float(np.mean(y_true == y_pred))

    precisions, recalls, f1s = [], [], []
    for cls in range(num_classes):
        tp = np.sum((y_true == cls) & (y_pred == cls))
        fp = np.sum((y_true != cls) & (y_pred == cls))
        fn = np.sum((y_true == cls) & (y_pred != cls))

        prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1 = float(2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)

    return {
        "accuracy": round(accuracy, 4),
        "macro_precision": round(float(np.mean(precisions)), 4),
        "macro_recall": round(float(np.mean(recalls)), 4),
        "macro_f1": round(float(np.mean(f1s)), 4),
        "per_class_f1": [round(f, 3) for f in f1s],
    }
