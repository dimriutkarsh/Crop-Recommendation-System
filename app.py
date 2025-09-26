from flask import Flask, render_template, request, jsonify
import numpy as np
import joblib
import os

app = Flask(__name__)

# Load models (you'll need to place your .pkl files in the same directory)
try:
    model = joblib.load('model.pkl') if os.path.exists('model.pkl') else None
    scaler = joblib.load('scaler.pkl') if os.path.exists('scaler.pkl') else None
    label_encoder = joblib.load('label_encoder.pkl') if os.path.exists('label_encoder.pkl') else None
except Exception as e:
    print(f"Error loading models: {e}")
    model = scaler = label_encoder = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get form data
        data = request.get_json()
        
        N = float(data['nitrogen'])
        P = float(data['phosphorus'])
        K = float(data['potassium'])
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])
        
        if not all([model, scaler, label_encoder]):
            return jsonify({
                'success': False,
                'error': 'Model files not found. Please ensure model.pkl, scaler.pkl, and label_encoder.pkl are in the project directory.'
            })
        
        # Prepare input data
        input_data = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        scaled_data = scaler.transform(input_data)
        prediction = model.predict(scaled_data)
        recommended_crop = label_encoder.inverse_transform(prediction)[0]
        
        return jsonify({
            'success': True,
            'crop': recommended_crop.title(),
            'temperature': temperature,
            'ph': ph
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)