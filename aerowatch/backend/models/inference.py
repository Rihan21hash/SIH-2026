"""Model inference pipeline unifying feature extraction, scoring, and SHAP explanation."""

import numpy as np
from typing import Dict, Any, List
from backend.models.xgboost_model import WeatherEventXGBoostModel
from backend.models.shap_explainer import WeatherSHAPExplainer


class WeatherInferencePipeline:
    """
    End-to-end inference pipeline for processing weather observations/forecasts,
    classifying severity, and generating interpretability reports.
    """

    def __init__(self):
        self.model = WeatherEventXGBoostModel()
        self.explainer = WeatherSHAPExplainer(self.model)

    def run_inference(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """
        Run inference on feature vector.
        """
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)

        predicted_severity = self.model.predict(feature_vector)[0]
        probabilities = self.model.predict_proba(feature_vector)[0]
        explanation = self.explainer.explain_instance(feature_vector)

        class_names = self.model.classes_
        prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(class_names, probabilities)}

        return {
            "predicted_severity": predicted_severity,
            "confidence": round(float(np.max(probabilities)) * 100.0, 1),
            "class_probabilities": prob_dict,
            "shap_explanation": explanation,
        }
