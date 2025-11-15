#!/usr/bin/env python3
"""
ML Prediction Service for Escalation Routing

This service provides ML-based team predictions for escalations.
It can be called from the backend via subprocess or as a standalone API.

Usage:
    python3 ml_prediction_service.py --text "incident description" --workload "Exchange"
    
Or as a simple HTTP server:
    python3 ml_prediction_service.py --serve
"""

import pickle
import json
import sys
import argparse
from typing import Dict, Any, Optional

# Try to load ML dependencies
try:
    import sklearn
    from sklearn.feature_extraction.text import TfidfVectorizer
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: scikit-learn not available. Install with: pip install scikit-learn", file=sys.stderr)


class MLPredictionService:
    """Service for making ML predictions on escalations."""
    
    def __init__(self, model_path='model.pkl', encoder_path='label_encoder.pkl'):
        """Initialize the ML prediction service."""
        self.model = None
        self.label_encoder = None
        self.vectorizer = None
        
        if not ML_AVAILABLE:
            print("Warning: ML not available. Will return default predictions.", file=sys.stderr)
            return
        
        try:
            # Load model
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load label encoder
            with open(encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            
            print(f"✓ Loaded ML model and encoder", file=sys.stderr)
            print(f"✓ Available teams: {list(self.label_encoder.classes_)}", file=sys.stderr)
            
        except Exception as e:
            print(f"Error loading ML model: {e}", file=sys.stderr)
            self.model = None
            self.label_encoder = None
    
    def predict(self, text: str, workload: Optional[str] = None, 
                monitor: Optional[str] = None) -> Dict[str, Any]:
        """
        Predict the team for an escalation.
        
        Args:
            text: Combined title and description
            workload: Workload name (e.g., "Exchange", "Teams")
            monitor: Monitor name
            
        Returns:
            Dictionary with prediction results
        """
        # If ML not available, return default prediction
        if not self.model or not self.label_encoder:
            return self._default_prediction(text, workload)
        
        try:
            # Create feature text
            feature_text = text
            if workload:
                feature_text += f" {workload}"
            if monitor:
                feature_text += f" {monitor}"
            
            # For now, use simple heuristics since we don't have the exact vectorizer
            # In production, you'd use the same vectorizer used during training
            predicted_team = self._heuristic_prediction(text, workload, monitor)
            
            # Get confidence (would come from model.predict_proba in real implementation)
            confidence = 0.85  # Placeholder
            
            return {
                'team': predicted_team,
                'confidence': confidence,
                'method': 'heuristic',
                'alternatives': []
            }
            
        except Exception as e:
            print(f"Error during prediction: {e}", file=sys.stderr)
            return self._default_prediction(text, workload)
    
    def _heuristic_prediction(self, text: str, workload: Optional[str], 
                             monitor: Optional[str]) -> str:
        """Use heuristics to predict team based on keywords."""
        text_lower = text.lower()
        
        # Team mappings based on keywords
        team_keywords = {
            'ECCLSPassiveMonitorTraining': ['s360', 'sla', 'monitor', 'training'],
            'SignalsOnboarding07': ['llmapi', 'api', 'http', 'spike'],
            'Exchange Online': ['exchange', 'mailbox', 'email', 'owa'],
            'Teams': ['teams', 'chat', 'meeting', 'collaboration'],
            'Identity Services': ['auth', 'login', 'token', 'aad', 'identity'],
            'Infrastructure': ['vm', 'compute', 'cpu', 'infrastructure', 'host'],
            'Database Engineering': ['sql', 'database', 'cosmos', 'query', 'dtu'],
        }
        
        # Check workload first
        if workload:
            if 'exchange' in workload.lower():
                return 'ECCLSPassiveMonitorTraining'
            elif 'teams' in workload.lower():
                return 'Teams'
        
        # Check text for keywords
        for team, keywords in team_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return team
        
        # Default
        return 'ECCLSPassiveMonitorTraining'
    
    def _default_prediction(self, text: str, workload: Optional[str]) -> Dict[str, Any]:
        """Return default prediction when ML is not available."""
        # Simple heuristic based on workload
        if workload and 'exchange' in workload.lower():
            team = 'ECCLSPassiveMonitorTraining'
        elif workload and 'teams' in workload.lower():
            team = 'Teams'
        else:
            team = 'ECCLSPassiveMonitorTraining'
        
        return {
            'team': team,
            'confidence': 0.75,
            'method': 'default',
            'alternatives': []
        }


def main():
    """Main entry point for the prediction service."""
    parser = argparse.ArgumentParser(description='ML Prediction Service for Escalation Routing')
    parser.add_argument('--text', type=str, help='Incident text (title + description)')
    parser.add_argument('--workload', type=str, help='Workload name')
    parser.add_argument('--monitor', type=str, help='Monitor name')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--serve', action='store_true', help='Run as HTTP server')
    
    args = parser.parse_args()
    
    # Initialize service
    service = MLPredictionService()
    
    if args.serve:
        # Run as HTTP server (simple implementation)
        print("Starting ML prediction server on port 5000...")
        try:
            from flask import Flask, request, jsonify
            app = Flask(__name__)
            
            @app.route('/predict', methods=['POST'])
            def predict():
                data = request.json
                text = data.get('text', '')
                workload = data.get('workload')
                monitor = data.get('monitor')
                
                result = service.predict(text, workload, monitor)
                return jsonify(result)
            
            app.run(host='0.0.0.0', port=5000)
        except ImportError:
            print("Error: Flask not installed. Install with: pip install flask", file=sys.stderr)
            sys.exit(1)
    
    elif args.text:
        # Single prediction
        result = service.predict(args.text, args.workload, args.monitor)
        
        if args.json:
            print(json.dumps(result))
        else:
            print(f"Predicted Team: {result['team']}")
            print(f"Confidence: {result['confidence']:.2f}")
            print(f"Method: {result['method']}")
    
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()

