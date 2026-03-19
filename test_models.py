import joblib

model   = joblib.load('ml_models/difficulty_model.pkl')
scaler  = joblib.load('ml_models/scaler.pkl')
encoder = joblib.load('ml_models/difficulty_encoder.pkl')

print('✅ Model loaded:  ', type(model))
print('✅ Scaler loaded: ', type(scaler))
print('✅ Encoder loaded:', encoder.classes_)