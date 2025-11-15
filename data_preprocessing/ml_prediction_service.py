#!/usr/bin/env python3
"""ML prediction service for escalation routing."""

import pickle
import json
import sys
import argparse
from typing import Dict, Any, Optional

try:
    import sklearn
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: scikit-learn not available", file=sys.stderr)


class MLPredictionService:
    def __init__(self, model_path='model.pkl', encoder_path='label_encoder.pkl'):
        self.model = None
        self.label_encoder = None
        
        if not ML_AVAILABLE:
            return
        
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            print(f"✓ Loaded ML model", file=sys.stderr)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            self.model = None
    
    def predict(self, text: str, workload: Optional[str] = None, 
                monitor: Optional[str] = None) -> Dict[str, Any]:
        if not self.model or not self.label_encoder:
            return self._heuristic_prediction(text, workload)
        
        try:
            import numpy as np
            probas = self.model.predict_proba([text])[0]
            predicted_idx = np.argmax(probas)
            predicted_team = self.label_encoder.classes_[predicted_idx]
            confidence = float(probas[predicted_idx])
            
            # Get top 3 alternatives
            top_indices = np.argsort(probas)[-3:][::-1]
            alternatives = [
                {
                    'team': self.label_encoder.classes_[idx],
                    'confidence': round(float(probas[idx]), 3)
                }
                for idx in top_indices[1:]  # Skip the first one (it's the prediction)
            ]
            
            return {
                'team': predicted_team,
                'confidence': round(confidence, 2),
                'method': 'ml_model',
                'alternatives': alternatives
            }
        except Exception as e:
            print(f"Prediction error: {e}", file=sys.stderr)
            return self._heuristic_prediction(text, workload)
    
    def _heuristic_prediction(self, text: str, workload: Optional[str]) -> Dict[str, Any]:
        text_lower = text.lower()
        
        team_keywords = {
            'ECCLSPassiveMonitorTraining': ['s360', 'sla', 'monitor', 'training'],
            'SignalsOnboarding07': ['llmapi', 'api', 'http', 'spike'],
            'Exchange Online': ['exchange', 'mailbox', 'email', 'owa'],
            'Teams': ['teams', 'chat', 'meeting'],
            'Identity Services': ['auth', 'login', 'token', 'aad'],
            'Infrastructure': ['vm', 'compute', 'cpu', 'host'],
            'Database Engineering': ['sql', 'database', 'cosmos', 'dtu'],
        }
        
        if workload:
            if 'exchange' in workload.lower():
                return {'team': 'ECCLSPassiveMonitorTraining', 'confidence': 0.75, 'method': 'default', 'alternatives': []}
            if 'teams' in workload.lower():
                return {'team': 'Teams', 'confidence': 0.75, 'method': 'default', 'alternatives': []}
        
        for team, keywords in team_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return {'team': team, 'confidence': 0.75, 'method': 'heuristic', 'alternatives': []}
        
        return {'team': 'ECCLSPassiveMonitorTraining', 'confidence': 0.75, 'method': 'default', 'alternatives': []}


def main():
    parser = argparse.ArgumentParser(description='ML Prediction Service')
    parser.add_argument('--text', type=str, help='Incident text')
    parser.add_argument('--workload', type=str, help='Workload name')
    parser.add_argument('--monitor', type=str, help='Monitor name')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--serve', action='store_true', help='Run as HTTP server')
    
    args = parser.parse_args()
    service = MLPredictionService()
    
    if args.serve:
        try:
            from flask import Flask, request, jsonify
            app = Flask(__name__)
            
            @app.route('/predict', methods=['POST'])
            def predict():
                data = request.json
                result = service.predict(data.get('text', ''), data.get('workload'), data.get('monitor'))
                return jsonify(result)
            
            app.run(host='0.0.0.0', port=5000)
        except ImportError:
            print("Error: Flask not installed", file=sys.stderr)
            sys.exit(1)
    elif args.text:
        result = service.predict(args.text, args.workload, args.monitor)
        if args.json:
            print(json.dumps(result))
        else:
            print(f"Team: {result['team']}")
            print(f"Confidence: {result['confidence']:.2f}")
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
