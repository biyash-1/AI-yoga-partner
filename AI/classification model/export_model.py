import tensorflow as tf
import json

# Load model
model = tf.keras.models.load_model('saved_model')

# Save in H5 format (works with tfjs)
model.save('yoga_model.h5')
print("✓ Model saved as yoga_model.h5")

# Save architecture
with open('model_architecture.json', 'w') as f:
    f.write(model.to_json())
print("✓ Architecture saved")

# Save weights
model.save_weights('model_weights.h5')
print("✓ Weights saved")

print("\nFiles ready for web deployment!")