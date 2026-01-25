"""
Direct model converter - bypasses tensorflowjs issues
Saves model in a format that can be loaded by TensorFlow.js
"""

import tensorflow as tf
import json
import os
import numpy as np

def save_model_for_tfjs():
    print("=" * 60)
    print("Direct TensorFlow.js Model Converter")
    print("=" * 60)
    
    # Load the Keras model
    print("\n1. Loading Keras model from 'saved_model'...")
    model = tf.keras.models.load_model('saved_model')
    print("✓ Model loaded successfully\n")
    
    model.summary()
    
    # Get model architecture
    model_json = model.to_json()
    
    # Create output directory
    output_dir = 'model_web'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Method 1: Save as Keras H5 (TensorFlow.js can load this directly)
    print("\n2. Saving as Keras H5 format...")
    h5_path = os.path.join(output_dir, 'model.h5')
    model.save(h5_path)
    print(f"✓ Saved to {h5_path}")
    
    # Method 2: Save weights separately
    print("\n3. Saving model weights...")
    weights_path = os.path.join(output_dir, 'weights.h5')
    model.save_weights(weights_path)
    print(f"✓ Saved to {weights_path}")
    
    # Save model config
    print("\n4. Saving model configuration...")
    config_path = os.path.join(output_dir, 'model_config.json')
    with open(config_path, 'w') as f:
        json.dump({
            'model_config': json.loads(model_json),
            'input_shape': list(model.input_shape),
            'output_shape': list(model.output_shape),
            'class_count': model.output_shape[-1]
        }, f, indent=2)
    print(f"✓ Saved to {config_path}")
    
    # Save class names if available
    if os.path.exists('class_names.json'):
        import shutil
        shutil.copy('class_names.json', os.path.join(output_dir, 'class_names.json'))
        print("✓ Copied class_names.json")
    
    print("\n" + "=" * 60)
    print("SUCCESS! Model exported to 'model_web/' folder")
    print("=" * 60)
    print("\nFiles created:")
    for file in os.listdir(output_dir):
        file_path = os.path.join(output_dir, file)
        size = os.path.getsize(file_path)
        print(f"  - {file} ({size:,} bytes)")
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("\nOption A - Use the H5 file directly:")
    print("1. Install h5wasm in your React app:")
    print("   npm install @tensorflow/tfjs @tensorflow/tfjs-layers")
    print("2. Load model with:")
    print("   const model = await tf.loadLayersModel('/model_web/model.h5');")
    
    print("\nOption B - Convert using online tool:")
    print("1. Go to: https://www.tensorflow.org/js/tutorials/conversion/import_keras")
    print("2. Upload model_web/model.h5")
    print("3. Download the converted model.json and .bin files")
    
    print("\nOption C - Install clean tensorflowjs:")
    print("pip install --upgrade --force-reinstall tensorflowjs==3.21.0")
    print("tensorflowjs_converter --input_format=keras_saved_model saved_model model")
    print("=" * 60)

if __name__ == "__main__":
    try:
        save_model_for_tfjs()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()